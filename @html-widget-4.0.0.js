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
        constructor(options = {}) {
            this.defaultValue = options.defaultValue || "";
            this.placeholderRegex = /{{(.*?)}}/g;
            this.loopRegex = /{{#(\w+)}}([\s\S]*?){{\/\1}}/g;
            this.conditionalRegex = /{{#if (.*?)}}([\s\S]*?)(({{#elseif (.*?)}}([\s\S]*?))*)({{#else}}([\s\S]*?))?{{\/if}}/g;
            this.ternaryRegex = /{{(.*?)\?(.*?):(.*?)}}/g;
            this.eventRegex = /event:([\w]+)/g;
            this.templateCacheLimit = options.cacheLimit || 100;
            this.cacheExpiryTimeMs = options.cacheExpirationMs || 60000; // Default 1 minute
            this.htmlTemplateCache = new Map();
            this.directives = new Map(); // Store custom directives
            if (typeof options.onInitializeCallback === "function") {
                options.onInitializeCallback();
            }

            this.onDestroyCallback = options.onDestroyCallback || null;
        }

        render(templateString, stateObject = {}) {
            let renderedTemplate;

            const reactiveState = this.createReactiveStateProxy(stateObject, () => {
                renderedTemplate.render();
            });

            renderedTemplate = {
                state: reactiveState,
                template: templateString,
                element: null,
                update: (updatedState) => {
                    const currentElement = renderedTemplate.element;
                    Object.assign(reactiveState, updatedState);

                    const updatedHtml = this.parseTemplate(templateString, reactiveState);
                    const container = document.createElement("template");
                    container.innerHTML = updatedHtml.trim();
                    const newNode = container.content.firstChild;

                    this.updateDomTree(currentElement, newNode);
                    renderedTemplate.element = currentElement;
                },
                render: () => {
                    const htmlContent = this.parseTemplate(templateString, reactiveState);
                    const container = document.createElement("template");
                    container.innerHTML = htmlContent.trim();

                    if (container.content.children.length > 1) {
                        console.warn("Warning: Template can only have one root element.");
                    }

                    renderedTemplate.element = container.content.firstChild;
                },
            };

            renderedTemplate.render();
            return renderedTemplate;
        }


        updateDomTree(currentNode, newNode) {
            // Base case: If nodes are of different types, replace the old one
            if (currentNode.nodeType !== newNode.nodeType || currentNode.nodeName !== newNode.nodeName) {
                currentNode.replaceWith(newNode.cloneNode(true));
                return;
            }

            // Update attributes for element nodes
            if (currentNode.nodeType === Node.ELEMENT_NODE) {
                // Update or remove attributes
                const oldAttributes = Array.from(currentNode.attributes);
                const newAttributes = Array.from(newNode.attributes);

                oldAttributes.forEach(attr => {
                    if (!newNode.hasAttribute(attr.name)) {
                        currentNode.removeAttribute(attr.name); // Remove outdated attributes
                    }
                });

                newAttributes.forEach(attr => {
                    if (currentNode.getAttribute(attr.name) !== attr.value) {
                        currentNode.setAttribute(attr.name, attr.value); // Update changed attributes
                    }
                });
            }

            // Update text content for text nodes
            if (currentNode.nodeType === Node.TEXT_NODE && currentNode.textContent !== newNode.textContent) {
                currentNode.textContent = newNode.textContent;
                return;
            }

            // Diff child nodes recursively
            const oldChildren = Array.from(currentNode.childNodes);
            const newChildren = Array.from(newNode.childNodes);

            // Update existing children
            oldChildren.forEach((oldChild, i) => {
                if (newChildren[i]) {
                    this.updateDomTree(oldChild, newChildren[i]);
                } else {
                    oldChild.remove(); // Remove extra nodes
                }
            });

            // Append new children
            newChildren.slice(oldChildren.length).forEach(newChild => {
                currentNode.appendChild(newChild);
            });
        }

        createReactiveStateProxy(stateObject, callback) {
            return this.createDeepProxy(stateObject, callback);
        }

        createDeepProxy(object, callback) {
            return new Proxy(object, {
                set: (target, key, value) => {
                    if (target[key] !== value) {
                        target[key] = value;
                        callback();
                    }
                    return true;
                },
                get: (target, key) => {
                    const property = target[key];
                    return typeof property === "object" && property !== null
                    ? this.createDeepProxy(property, callback)
                    : property;
                },
            });
        }

        parseTemplate(templateString, stateObject) {

            // Handle custom directives
            this.directives.forEach((handler, directiveName) => {
                const directiveRegex = new RegExp(`{{#${directiveName}\\s(.*?)}}([\\s\\S]*?){{\\/${directiveName}}}`, 'g');
                templateString = templateString.replace(directiveRegex, (match, args, content) => {
                    return handler(args, content, stateObject);
                });
            });

            // Replace loops
            templateString = templateString.replace(this.loopRegex, (match, arrayName, content) => {
                const array = stateObject[arrayName];
                if (Array.isArray(array)) {
                    return array
                        .map((item) =>{
                        return this.parseTemplate(content, typeof item === "object" ? item : { ".": item });
                    }

                    )
                        .join("");
                } else {
                    console.warn(`Warning: Expected an array for "${arrayName}".`);
                    return "";
                }
            });

            // Replace conditionals
            templateString = templateString.replace(this.conditionalRegex, (match, condition, ifContent, elseifChain, _, elseifCondition, elseifContent, elseBlock, elseContent) => {
                if (this.evaluateConditionExpression(condition, stateObject)) {
                    return ifContent;
                }

                if (elseifChain) {
                    const elseifMatches = elseifChain.match(/{{#elseif (.*?)}}([\s\S]*?)/g) || [];
                    for (const elseifMatch of elseifMatches) {
                        const [, elseifCond, elseifCont] = elseifMatch.match(/{{#elseif (.*?)}}([\s\S]*?)/);
                        if (this.evaluateConditionExpression(elseifCond, stateObject)) {
                            return elseifCont;
                        }
                    }
                }

                if (elseBlock) {
                    return elseContent;
                }

                return "";
            });

            // Replace ternary expressions
            templateString = templateString.replace(this.ternaryRegex, (match, condition, trueValue, falseValue) => {
                return this.evaluateConditionExpression(condition, stateObject) ? trueValue.trim() : falseValue.trim();
            });

            // Replace placeholders
            templateString = templateString.replace(this.placeholderRegex, (match, key) => {
                if (Object.prototype.hasOwnProperty.call(stateObject, key)) {
                    return this.sanitizeHtmlContent(stateObject[key]);
                } else {
                    console.warn(`Warning: Placeholder "${key}" has no matching value.`);
                    return this.sanitizeHtmlContent(this.defaultValue);
                }
            });

            // Replace events
            templateString = templateString.replace(this.eventRegex, (match, eventName) => {
                return `data-event="${eventName}"`;
            });

            return templateString;
        }

        evaluateConditionExpression(expression, stateObject) {
            const safeExpression = expression.replace(/(\w+)/g, (match, key) => {
                return Object.prototype.hasOwnProperty.call(stateObject, key) ? `params["${key}"]` : match;
            });

            try {
                return new Function("params", `return ${safeExpression};`)(stateObject);
            } catch (error) {
                console.error("Error evaluating condition:", error);
                return false;
            }
        }

        sanitizeHtmlContent(content) {
            if (typeof content !== "string") return content;

            return content
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
        }

        async fetchTemplateFile(filePath) {
            try {
                const cachedEntry = this.htmlTemplateCache.get(filePath);
                if (cachedEntry) {
                    const { value: cachedHtml, timestamp } = cachedEntry;
                    if (Date.now() - timestamp < this.cacheExpiryTimeMs) {
                        return cachedHtml;
                    }
                    this.htmlTemplateCache.delete(filePath);
                }

                const response = await fetch(filePath);
                if (!response.ok) {
                    throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
                }

                const htmlContent = await response.text();

                if (this.htmlTemplateCache.size >= this.templateCacheLimit) {
                    const firstKey = this.htmlTemplateCache.keys().next().value;
                    this.htmlTemplateCache.delete(firstKey);
                }

                this.htmlTemplateCache.set(filePath, {
                    value: htmlContent,
                    timestamp: Date.now(),
                });

                return htmlContent;
            } catch (error) {
                console.error("Error fetching HTML file:", error);
                return null;
            }
        }

        async renderFromFile(filePath, stateObject = {}) {
            try {
                const htmlContent = await this.fetchTemplateFile(filePath);
                if (htmlContent) {
                    return this.render(htmlContent, stateObject);
                } else {
                    throw new Error("HTML content could not be fetched or is invalid.");
                }
            } catch (error) {
                console.error(`Error rendering template from file: ${error.message}`);
                return null;
            }
        }

        destroy() {
            if (typeof this.onDestroyCallback === "function") {
                this.onDestroyCallback();
            }
            this.htmlTemplateCache.clear();
        }
    }


    return HtmlWidget;
}));