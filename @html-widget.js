/**
 * HtmlWidget - A class for rendering dynamic HTML templates with reactive state,
 * event handling, and template caching. It supports placeholders, conditionals, loops,
 * lifecycle methods, and more.
 *
 * Usage:
 * 1. Initialize the widget:
 *    const widget = new HtmlWidget({
 *      onInit: () => console.log('Widget initialized'),
 *      onDestroy: () => console.log('Widget destroyed'),
 *      defaultPlaceholderValue: 'N/A',
 *      cacheLimit: 50,
 *      cacheExpirationMs: 120000
 *    });
 *
 * 2. Render a template:
 *    const template = `
 *      <h1>{{title}}</h1>
 *      <ul>
 *        {{#items}}<li>{{.}}</li>{{/items}}
 *      </ul>
 *    `;
 *    const state = { title: 'Welcome', items: ['Item 1', 'Item 2'] };
 *    const node = widget.render(template, state);
 *
 * 3. Update state and re-render:
 *    node.update({ title: 'Updated Title' });
 *
 * 4. Handle events (e.g., click handler):
 *    <button data-event="handleClick">Click Me</button>
 *    widget.handleClick = function() { alert('Button clicked!'); };
 *
 * 5. Fetch and render a template from a file:
 *    widget.renderFromFile('/path/to/template.html', { title: 'File Content' })
 *      .then(node => console.log(node.element));
 *
 * 6. Destroy the widget (cleanup):
 *    widget.destroy();
 *
 * Template Syntax:
 * - Placeholders: {{key}}
 * - Loops: {{#key}}...{{/key}}
 * - Conditionals: {{#if condition}}...{{/if}}
 * - Event Binding: data-event="handlerName"
 */
(function(global, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        // Node.js or CommonJS
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define(factory);
    } else {
        // Browser global
        global.HtmlWidget = factory();
    }
}(typeof window !== 'undefined' ? window : globalThis, function() {
    // HtmlWidget class definition
    class HtmlWidget {
        constructor(params = {}) {
            this.defaultPlaceholderValue = params.defaultPlaceholderValue || '';
            this.placeholderPattern = /{{(.*?)}}/g;
            this.loopPattern = /{{#(\w+)}}([\s\S]*?){{\/\1}}/g; // Matches {{#key}}...{{/key}}
            this.conditionalPattern = /{{#if (.*?)}}([\s\S]*?){{\/if}}/g; // Matches {{#if condition}}...{{/if}}

            this.eventPattern = /event:([\w]+)/g;

            this.cacheLimit = params.cacheLimit || 100;
            this.cacheExpirationMs = params.cacheExpirationMs || 60000;

            this.templateCache = new Map();

            if (typeof params.onInit === 'function') {
                params.onInit();
            }

            this.onDestroyCallback = params.onDestroy || null;
        }

        render(template, state ={}) {
            let node; // Declare node first

            const reactiveState = this.createReactiveState(state, () => {
                node.render(); // Access node after initialization
            });

            node = {
                state: reactiveState,
                template,
                element: null,
                update: (newState) => {
                    const oldElement = node.element;
                    Object.assign(reactiveState, newState);

                    // Render new content as a virtual element
                    const htmlString = this.renderTemplate(template, reactiveState);
                    const templateElement = document.createElement('template');
                    templateElement.innerHTML = htmlString.trim();
                    const newElement = templateElement.content.firstChild;

                    // Perform incremental updates
                    this.updateDom(oldElement, newElement);
                    node.element = oldElement; // Keep reference to the updated DOM element
                },
                render: () => {
                    const htmlString = this.renderTemplate(template, reactiveState);
                    const templateElement = document.createElement('template');
                    templateElement.innerHTML = htmlString.trim();
                    if(templateElement.content.children.length > 1){
                        console.warn(`Warning: Template can only have one parent <div>Children</div>`);
                    }else{
                        node.element = templateElement.content.firstChild;
                    }
                },
            };


            // Initial rendering
            node.render();
            return node;
        }

        updateDom(oldNode, newNode) {
            // Base case: replace node if different
            if (!oldNode.isEqualNode(newNode)) {
                oldNode.replaceWith(newNode);
                return;
            }

            // Recursively update child nodes
            const oldChildren = oldNode.childNodes;
            const newChildren = newNode.childNodes;

            oldChildren.forEach((oldChild, i) => {
                if (newChildren[i]) {
                    this.updateDom(oldChild, newChildren[i]);
                } else {
                    oldChild.remove(); // Remove extra nodes
                }
            });

            // Append new nodes if any remain
            newChildren.forEach((newChild, i) => {
                if (!oldChildren[i]) {
                    oldNode.appendChild(newChild);
                }
            });
        }


        createReactiveState(initialState, renderCallback) {
            return this.deepProxy(initialState, renderCallback);
        }

        deepProxy(obj, callback) {
            return new Proxy(obj, {
                set: (target, key, value) => {
                    if (target[key] !== value) {
                        target[key] = value;
                        callback(); // Trigger the custom render callback
                    }
                    return true;
                },
                get: (target, key) => {
                    if (typeof target[key] === 'object' && target[key] !== null) {
                        return this.deepProxy(target[key], callback);
                    }
                    return target[key];
                },
            });
        }


        renderTemplate(template, params) {
            template =  template
                .replace(this.conditionalPattern, (match, condition, innerContent) => {
                const result = this.evaluateCondition(condition, params);
                return result ? innerContent : '';
            });

            template =  template.replace(this.loopPattern, (match, key, innerTemplate) => {
                const array = params[key];
                if (Array.isArray(array)) {
                    return array.map((item) =>this.renderTemplate(innerTemplate, typeof item === 'object' ? item : { '.': item })).join('');
                }
                console.warn(`Warning: Placeholder for array "${key}" is missing or not an array.`);
                return '';
            });

            template =  template.replace(this.placeholderPattern, (match, key) => {
                if (Object.prototype.hasOwnProperty.call(params, key)) {
                    return this.escapeHtml(params[key]);
                }
                console.warn(`Warning: Placeholder "${key}" has no matching value. Using default.`);
                return this.escapeHtml(this.defaultPlaceholderValue);
            });

            template =  template.replace(this.eventPattern, (match, handlerName) => {
                return `data-event="${handlerName}"`;
            });

            return template;
        }

//        evaluateCondition(condition, params) {
//            condition = condition.replace(/(\w+)/g, (match, key) =>
//            Object.prototype.hasOwnProperty.call(params, key) ? `params["${key}"]` : match
//            );
//
//            try {
//                return new Function('params', `return ${condition};`)(params);
//            } catch (error) {
//                console.error("Error evaluating condition:", error);
//                return false;
//            }
//        }

        evaluateCondition(condition, params, context = params) {
            // Replace keys with their resolved values from the current context (nested handling)
            condition = condition.replace(/(\w+\[\d*\]|\w+)/g, (match, key) => {
                let contextToCheck = context;  // Start from the current context

                // If the key is an array access (e.g., data[0]), resolve it accordingly
                if (key.includes('[')) {
                    return `context.${key}`;
                }
                // Otherwise, resolve simple keys from the current context
                else {
                    return `context.${key}`;
                }
            });

            try {
                // Use Function constructor to evaluate the condition in the current scope
                return new Function('context', `with (context) { return ${condition}; }`)(context);
            } catch (error) {
                console.error("Error evaluating condition:", error);
                return false;
            }
        }


        escapeHtml(value) {
            if (typeof value !== 'string') return value;
            return value
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
        }

        handleEvent(event) {
            const handlerName = event.target.getAttribute('data-event');
            if (typeof this[handlerName] === 'function') {
                this[handlerName](event);
            } else {
                console.warn(`Event handler '${handlerName}' is not defined.`);
            }
        }

        async fetchHtmlFile(filePath) {
            try {
                const cachedTemplate = this.templateCache.get(filePath);
                if (cachedTemplate) {
                    const { value, timestamp } = cachedTemplate;
                    if (Date.now() - timestamp < this.cacheExpirationMs) {
                        return value; // Return cached value if still valid
                    }
                    this.templateCache.delete(filePath);
                }

                const response = await fetch(filePath);
                if (!response.ok) {
                    throw new Error(`Failed to load file: ${response.status} ${response.statusText}`);
                }
                const template = await response.text();

                if (this.templateCache.size >= this.cacheLimit) {
                    const oldestKey = this.templateCache.keys().next().value;
                    this.templateCache.delete(oldestKey);
                }
                this.templateCache.set(filePath, { value: template, timestamp: Date.now() });

                return template;
            } catch (error) {
                console.error("Error fetching HTML file:", error);
                return null;
            }
        }

        async renderFromFile(filePath, params = {}) {
            try {
                const htmlContent = await this.fetchHtmlFile(filePath);
                if (htmlContent) {
                    return this.render(htmlContent, params);
                }
                throw new Error('HTML content could not be fetched or is invalid.');
            } catch (error) {
                console.error(`Error in renderFromFile: ${error.message}`);
                return null;
            }
        }


        destroy() {
            if (typeof this.onDestroyCallback === 'function') {
                this.onDestroyCallback();
            }
            this.templateCache.clear();
        }
    }

    return HtmlWidget;
}));