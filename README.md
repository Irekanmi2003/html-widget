# HtmlWidget

**HtmlWidget** is a lightweight, easy-to-use JavaScript templating engine for rendering dynamic HTML with support for placeholders, loops, conditionals, events, and reactive state updates.

---

## Features

- Simple **template placeholders** `{{key}}`
- Loop through arrays with `{{#list}}...{{/list}}`
- Conditional rendering with `{{#if}}`, `{{#elseif}}`, and `{{#else}}`
- Inline ternary operators `{{condition ? trueValue : falseValue}}`
- Event attribute support with `event:eventName`
- Reactive state with automatic DOM updates
- Load templates from files and cache them
- HTML escaping to prevent injection

---

## Installation

### CDN

```html
<script src="https://cdn.jsdelivr.net/npm/html-widget@4.0.0/@html-widget.js"></script>
````

### NPM

```bash
npm install html-widget
```

Then import in your project:

```js
import HtmlWidget from 'html-widget';
```

---

## Quick Start

```js
const widget = new HtmlWidget();

const template = `<h1>Hello, {{name}}!</h1>`;
const data = { name: 'World' };

const instance = widget.render(template, data);

document.body.appendChild(instance.element);
```

---

## Template Syntax

### 1. Placeholders

Use double curly braces to insert values:

```html
<p>Name: {{name}}</p>
```

If `data = { name: "Alice" }`, it renders:

```html
<p>Name: Alice</p>
```

---

### 2. Loops (Arrays)

Repeat a block for each item in an array:

```html
<ul>
  {{#items}}
    <li>{{.}}</li>
  {{/items}}
</ul>
```

Example data:

```js
{ items: ['Apple', 'Banana', 'Cherry'] }
```

Renders:

```html
<ul>
  <li>Apple</li>
  <li>Banana</li>
  <li>Cherry</li>
</ul>
```

Inside loops, if items are objects:

```html
{{#users}}
  <p>{{name}} ({{age}} years old)</p>
{{/users}}
```

---

### 3. Conditionals

Use `if`, `elseif`, and `else` for conditional rendering:

```html
{{#if isLoggedIn}}
  <p>Welcome back!</p>
{{#elseif isGuest}}
  <p>Please log in.</p>
{{#else}}
  <p>Access denied.</p>
{{/if}}
```

The expressions support JavaScript syntax with your data keys.

---

### 4. Ternary Operators

Inline conditions in placeholders:

```html
<p>Status: {{isAdmin ? 'Admin' : 'User'}}</p>
```

---

### 5. Event Attributes

Add custom attributes like this:

```html
<button event:click>Click me</button>
```

This renders as:

```html
<button data-event="click">Click me</button>
```

You can attach listeners externally using these `data-event` attributes.

---

## API Reference

### `new HtmlWidget(options)`

Create an instance. Options:

* `defaultValue` (string): fallback for missing placeholders
* `cacheLimit` (number): max cached templates (default 100)
* `cacheExpirationMs` (number): cache expiry time in ms (default 60000)
* `onInitializeCallback` (function): called once on init
* `onDestroyCallback` (function): called on destroy

---

### `render(templateString, data)`

Render an HTML string with data.

Returns an object:

* `element`: rendered root HTMLElement
* `state`: reactive proxy of the data
* `render()`: manually re-render template
* `update(newData)`: update data and re-render

Example:

```js
const instance = widget.render('<p>{{msg}}</p>', { msg: 'Hello' });
document.body.appendChild(instance.element);

setTimeout(() => {
  instance.update({ msg: 'Updated!' });
}, 1000);
```

---

### `renderFromFile(url, data)`

Load template from a file and render it.

Example:

```js
const instance = await widget.renderFromFile('/templates/card.html', { title: 'Card Title' });
document.body.appendChild(instance.element);
```

---

### `destroy()`

Clear caches and call cleanup callbacks:

```js
widget.destroy();
```

---

## Reactive State

The `state` object is a Proxy, so changing properties triggers automatic DOM updates:

```js
const instance = widget.render('<p>{{count}}</p>', { count: 0 });
document.body.appendChild(instance.element);

instance.state.count = 1; // DOM updates automatically
```

---

## Security

All placeholders are sanitized to escape HTML entities (`&`, `<`, `>`, `"`, `'`) to prevent injection attacks.

---

## Example: Project Card Component

### Template (`project-card.html`)

```html
<div class="project-card">
  <img src="{{imageSrc}}" alt="Project Image" />
  <h2>{{title}}</h2>
  <p>{{description}}</p>
  <div>
    {{#links}}
      <a href="{{url}}" target="_blank">{{text}}</a>
    {{/links}}
  </div>
</div>
```

### Usage

```js
const widget = new HtmlWidget();

const data = {
  imageSrc: 'https://example.com/image.png',
  title: 'My Project',
  description: 'This is a great project.',
  links: [
    { url: 'https://github.com', text: 'GitHub' },
    { url: 'https://example.com', text: 'Website' }
  ]
};

const instance = widget.renderFromFile('/templates/project-card.html', data);
document.body.appendChild(instance.element);
```

---

## Tips

* Templates should have **one root element**.
* Use `{{.}}` inside loops for primitive array items.
* Condition expressions are evaluated with JavaScript, so avoid untrusted input.
* Use `event:eventName` to add custom event hooks.

---

## License

MIT License

---

Feel free to open issues or contribute!
