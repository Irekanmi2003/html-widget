const HtmlWidget = require('./@html-widget');

describe('HtmlWidget', () => {
    let widget;

    beforeEach(() => {
        widget = new HtmlWidget({
            cacheLimit: 2,
            cacheExpirationMs: 1000,
            onInitializeCallback: jest.fn(),
            onDestroyCallback: jest.fn(),
        });
    });

    afterEach(() => {
        widget.destroy();
    });

    //    test('renders a simple template with placeholders', () => {
    //        const template = `<div><h1>{{title}}</h1><p>{{description}}</p></div>`;
    //        const instance = widget.render(template, {
    //            title: 'Hello, World!',
    //            description: 'This is a test description.',
    //        });
    //        expect(instance.element.outerHTML).toBe(
    //            '<div><h1>Hello, World!</h1><p>This is a test description.</p></div>'
    //        );
    //    });
    //
    //    test('updates state reactively', () => {
    //        const template = `<div><h1>{{title}}</h1></div>`;
    //        const instance = widget.render(template, { title: 'Initial Title' });
    //        instance.update({ title: 'Updated Title' });
    //        expect(instance.element.outerHTML).toBe('<div><h1>Updated Title</h1></div>');
    //    });
    //
    //    test('supports loops', () => {
    //        const template = `<ul>{{#items}}<li>{{.}}</li>{{/items}}</ul>`;
    //        const instance = widget.render(template, { items: ['Item 1', 'Item 2', 'Item 3'] });
    //        expect(instance.element.outerHTML).toBe(
    //            '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>'
    //        );
    //    });
    //
    //    test('handles conditional rendering', () => {
    //        const template = `
    //            {{#if isLoggedIn}}
    //                <p>Welcome, {{username}}!</p>
    //            {{#else}}
    //                <p>Please log in.</p>
    //            {{/if}}
    //        `;
    //        const instance = widget.render(template, { isLoggedIn: true, username: 'John' });
    //        expect(instance.element.outerHTML.trim()).toBe('<p>Welcome, John!</p>');
    //
    //        instance.update({ isLoggedIn: false });
    //        expect(instance.element.outerHTML.trim()).toBe('<p>Please log in.</p>');
    //    });

    //    test('parses ternary expressions', () => {
    //        const template = `<p>{{isPremium ? Premium User : Regular User}}</p>`;
    //        const instance = widget.render(template, { isPremium: true });
    //        expect(instance.element.outerHTML).toBe('<p>Premium User</p>');
    //
    //        instance.update({ isPremium: false });
    //        expect(instance.element.outerHTML).toBe('<p>Regular User</p>');
    //    });
    //
    //    test('supports directives', () => {
    //        widget.directives.set('custom', (arg, content) => `<strong>${arg}: ${content}</strong>`);
    //        const template = `{{#custom Important}}This is custom content.{{/custom}}`;
    //        const instance = widget.render(template, {});
    //        expect(instance.element.outerHTML).toBe('<strong>Important: This is custom content.</strong>');
    //    });
    //
    //    test('sanitizes HTML input', () => {
    //        const template = `<div>{{unsafeContent}}</div>`;
    //        const instance = widget.render(template, {
    //            unsafeContent: '<script>alert(attack)</script>',
    //        });
    //        expect(instance.element.outerHTML).toBe(
    //            '<div>&lt;script&gt;alert(attack)&lt;/script&gt;</div>'
    //        );
    //    });

    //    test('caches templates and respects cache limit', async () => {
    //        jest.useFakeTimers();
    //
    //        const fetchMock = jest.spyOn(global, 'fetch').mockImplementation((url) =>
    //        Promise.resolve({
    //            ok: true,
    //            text: () => Promise.resolve(`<div>Template from ${url}</div>`),
    //        })
    //        );
    //
    //        const instance1 = await widget.renderFromFile('/template1.html', {});
    //        expect(instance1.element.outerHTML).toBe('<div>Template from /template1.html</div>');
    //
    //        const instance2 = await widget.renderFromFile('/template2.html', {});
    //        expect(instance2.element.outerHTML).toBe('<div>Template from /template2.html</div>');
    //
    //        expect(widget.htmlTemplateCache.size).toBe(2);
    //
    //        // Add a third template, causing the cache to exceed its limit
    //        await widget.renderFromFile('/template3.html', {});
    //        expect(widget.htmlTemplateCache.size).toBe(2);
    //        expect(widget.htmlTemplateCache.has('/template1.html')).toBe(false);
    //
    //        jest.advanceTimersByTime(1000);
    //
    //        // Expired cache should be removed
    //        expect(widget.htmlTemplateCache.size).toBe(0);
    //
    //        fetchMock.mockRestore();
    //    });

    //    test('handles timeout in caching', async () => {
    //        jest.useFakeTimers();
    //
    //        const fetchMock = jest.spyOn(global, 'fetch').mockImplementation((url) =>
    //        Promise.resolve({
    //            ok: true,
    //            text: () => Promise.resolve(`<div>Template from ${url}</div>`),
    //        })
    //        );
    //
    //        await widget.renderFromFile('/template.html', {});
    //        expect(widget.htmlTemplateCache.size).toBe(1);
    //
    //        jest.advanceTimersByTime(1000);
    //        expect(widget.htmlTemplateCache.size).toBe(0);
    //
    //        fetchMock.mockRestore();
    //    });

    //    test('lifecycle callbacks are called correctly', () => {
    //        expect(widget.onInitializeCallback).toHaveBeenCalled();
    //        widget.destroy();
    //        expect(widget.onDestroyCallback).toHaveBeenCalled();
    //    });


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



    test('should bind dynamic attributes based on state', () => {
        const template = `
        <div class="{{className}}" style="color: {{color}};">
            {{text}}
        </div>
    `;
        const state = {
            className: 'highlight',
            color: 'red',
            text: 'Dynamic Attributes Test',
        };
        const node = widget.render(template, state);

        // Check initial render
        expect(node.element.outerHTML).toBe(
            '<div class="highlight" style="color: red;">Dynamic Attributes Test</div>'
        );

        // Update state dynamically
        node.update({
            className: 'faded',
            color: 'blue',
            text: 'Updated Attributes',
        });

        // Verify updated attributes and content
        expect(node.element.outerHTML).toBe(
            '<div class="faded" style="color: blue;">Updated Attributes</div>'
        );
    });



});
