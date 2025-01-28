const HtmlWidget = require('./@html-widget');

describe('HtmlWidget', () => {
    let widget;

    beforeEach(() => {
        widget = new HtmlWidget({
            onInit: jest.fn(),
            onDestroy: jest.fn(),
            defaultPlaceholderValue: 'N/A',
            cacheLimit: 5,
            cacheExpirationMs: 1000,
        });
    });

    afterEach(() => {
        widget.destroy();
    });

    //    test('should initialize with default parameters', () => {
    //        expect(widget.defaultPlaceholderValue).toBe('N/A');
    //        expect(widget.cacheLimit).toBe(5);
    //        expect(widget.cacheExpirationMs).toBe(1000);
    //        expect(widget.templateCache.size).toBe(0);
    //    });

    //    test('should call onInit on initialization', () => {
    //        const initSpy = jest.fn();
    //        new HtmlWidget({ onInit: initSpy });
    //        expect(initSpy).toHaveBeenCalled();
    //    });

    //    test('should render a simple template with placeholders', () => {
    //        const template = '<h1>{{title}}</h1>';
    //        const state = { title: 'Hello World' };
    //        const node = widget.render(template, state);
    //
    //        expect(node.element.outerHTML).toBe('<h1>Hello World</h1>');
    //    });

    //    test('should render a template with a loop', () => {
    //        const template = '<ul>{{#items}}<li>{{.}}</li>{{/items}}</ul>';
    //        const state = { items: ['Item 1', 'Item 2'] };
    //        const node = widget.render(template, state);
    //
    //        expect(node.element.outerHTML).toBe('<ul><li>Item 1</li><li>Item 2</li></ul>');
    //    });

    //    test('should render a template with conditionals', () => {
    //        const template = '{{#if condition}}<p>Condition is true</p>{{/if}}';
    //        const state = { condition: true };
    //        const node = widget.render(template, state);
    //
    //        expect(node.element.outerHTML).toBe('<p>Condition is true</p>');
    //    });

    //    test('should update the DOM on state change', () => {
    //        const template = '<h1>{{title}}</h1>';
    //        const state = { title: 'Initial Title' };
    //        const node = widget.render(template, state);
    //
    //        node.update({ title: 'Updated Title' });
    //
    //        expect(node.element.outerHTML).toBe('<h1>Updated Title</h1>');
    //    });

    //    Not Passed

    //    test('should handle events correctly', () => {
    //        const template = '<button data-event="handleClick">Click Me</button>';
    //        widget.handleClick = jest.fn();
    //        const node = widget.render(template, {});
    //
    //        const button = node.element;
    //        button.dispatchEvent(new Event('click', { bubbles: true }));
    //
    //        expect(widget.handleClick).toHaveBeenCalled();
    //    });

    //    test('should fetch and render a template from file', async () => {
    //        global.fetch = jest.fn(() =>
    //        Promise.resolve({
    //            ok: true,
    //            text: () => Promise.resolve('<h1>{{title}}</h1>'),
    //        })
    //        );
    //
    //        const node = await widget.renderFromFile('mock.html', { title: 'File Content' });
    //
    //        expect(node.element.outerHTML).toBe('<h1>File Content</h1>');
    //        expect(global.fetch).toHaveBeenCalledWith('mock.html');
    //    });

    //    test('should cache templates with fetchHtmlFile', async () => {
    //        global.fetch = jest.fn(() =>
    //        Promise.resolve({
    //            ok: true,
    //            text: () => Promise.resolve('<h1>Cached Template</h1>'),
    //        })
    //        );
    //
    //        await widget.fetchHtmlFile('cached.html');
    //        await widget.fetchHtmlFile('cached.html'); // Second call should hit cache
    //
    //        expect(global.fetch).toHaveBeenCalledTimes(1);
    //    });

    //    test('should clear cache and call onDestroy on destroy', () => {
    //        const destroySpy = jest.fn();
    //        widget.onDestroyCallback = destroySpy;
    //
    //        widget.templateCache.set('test', { value: 'test', timestamp: Date.now() });
    //        widget.destroy();
    //
    //        expect(destroySpy).toHaveBeenCalled();
    //        expect(widget.templateCache.size).toBe(0);
    //    });


    //        test('should support custom directives', () => {
    //        widget.addDirective('custom', (args, content) => `<span>${args}: ${content}</span>`);
    //
    //        const template = '{{#custom arg}}Custom Content{{/custom}}';
    //        const node = widget.render(template, {});
    //
    //        expect(node.element.outerHTML).toBe('<span>arg: Custom Content</span>');
    //    });



    //    Not Passed
    test('should evaluate conditions inside a loop', () => {
        const template = `
      <ul>
        {{#items}}
          <li>{{#if isActive}}Active: {{name}}{{else}}Inactive: {{name}}{{/if}}</li>
        {{/items}}
      </ul>
    `;
        const state = {
            items: [
                { name: 'Item 1', isActive: true },
                { name: 'Item 2', isActive: false },
            ],
        };
        const node = widget.render(template, state);

        expect(node.element.outerHTML).toBe(
            '<ul><li>Active: Item 1</li><li>Inactive: Item 2</li></ul>'
        );
    });

    //    Not Passed
    //    test('should evaluate ternary operators', () => {
    //        const template = `
    //      <p>{{user.name ? user.name : 'Guest'}}</p>
    //    `;
    //        const state = {
    //            user: { name: 'John Doe' },
    //        };
    //        const node = widget.render(template, state);
    //
    //        expect(node.element.outerHTML).toBe('<p>John Doe</p>');
    //
    //        node.update({ user: { name: '' } });
    //        expect(node.element.outerHTML).toBe('<p>Guest</p>');
    //    });

    //    Not Passed

    //    test('should handle if-elseif-else conditions', () => {
    //        const template = `
    //      {{#if score > 90}}
    //        <p>Grade: A</p>
    //      {{elseif score > 75}}
    //        <p>Grade: B</p>
    //      {{elseif score > 50}}
    //        <p>Grade: C</p>
    //      {{else}}
    //        <p>Grade: F</p>
    //      {{/if}}
    //    `;
    //        const state = { score: 80 };
    //        const node = widget.render(template, state);
    //
    //        expect(node.element.outerHTML).toBe('<p>Grade: B</p>');
    //
    //        node.update({ score: 95 });
    //        expect(node.element.outerHTML).toBe('<p>Grade: A</p>');
    //
    //        node.update({ score: 60 });
    //        expect(node.element.outerHTML).toBe('<p>Grade: C</p>');
    //
    //        node.update({ score: 40 });
    //        expect(node.element.outerHTML).toBe('<p>Grade: F</p>');
    //    });
    //
    //    test('should evaluate nested conditions with loops', () => {
    //        const template = `
    //      <ul>
    //        {{#items}}
    //          <li>
    //            {{#if category === 'fruit'}}
    //              Fruit: {{name}}
    //            {{elseif category === 'vegetable'}}
    //              Vegetable: {{name}}
    //            {{else}}
    //              Unknown Category: {{name}}
    //            {{/if}}
    //          </li>
    //        {{/items}}
    //      </ul>
    //    `;
    //        const state = {
    //            items: [
    //                { name: 'Apple', category: 'fruit' },
    //                { name: 'Carrot', category: 'vegetable' },
    //                { name: 'Rock', category: 'mineral' },
    //            ],
    //        };
    //        const node = widget.render(template, state);
    //
    //        expect(node.element.outerHTML).toBe(
    //            '<ul><li>Fruit: Apple</li><li>Vegetable: Carrot</li><li>Unknown Category: Rock</li></ul>'
    //        );
    //    });





});
