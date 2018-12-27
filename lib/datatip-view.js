'use babel';
/** @jsx etch.dom */

const etch = require('etch')
const marked = require('marked')
const createDOMPurify = require('dompurify')
const domPurify = createDOMPurify();

const TYPE_TO_ICON_NAME = {
  array: 'type-array',
  boolean: 'type-boolean',
  class: 'type-class',
  constant: 'type-constant',
  constructor: 'type-constructor',
  enum: 'type-enum',
  field: 'type-field',
  file: 'type-file',
  function: 'type-function',
  interface: 'type-interface',
  method: 'type-method',
  module: 'type-module',
  namespace: 'type-namespace',
  number: 'type-number',
  package: 'type-package',
  property: 'type-property',
  string: 'type-string',
  variable: 'type-variable',
};

class SnippetView {
  constructor({ snippet }) {
    /**
     * [snippet description]
     * @type {String}
     */
    this.snippet = snippet;
    etch.initialize(this);
  }

  render() {
    if (this.snippet) {
      let img = null;
      if (this.snippet.startsWith("(")) {
        const endOfType = this.snippet.indexOf(")");
        const type = this.snippet.substr(1, endOfType - 1);
        const classNames = "icon icon-" + TYPE_TO_ICON_NAME[type];
        img = <span className={classNames} />;
        this.snippet = this.snippet.substr(endOfType + 1);
      }

      return (
        <div className="datatip-container">
          { img } <span>{ this.snippet }</span>
        </div>
      )
    }

    return ( "" );
  }

  update (props, children) {
    // perform custom update logic here...
    // then call `etch.update`, which is async and returns a promise
    return etch.update(this)
  }

  // Optional: Destroy the component. Async/await syntax is pretty but optional.
  async destroy () {
    // call etch.destroy to remove the element and destroy child components
    await etch.destroy(this)
    // then perform custom teardown logic here...
  }
}

class MarkdownView {
  constructor({ markedString }) {
    this.markedString = markedString;
    this.rootElement = document.createElement('div');
    this.rootElement.className = "datatip-marked-container";
    this.rootElement.innerHTML = domPurify.sanitize(marked(this.markedString, { breaks: true }));
  }
  update ({ markedString }) {
    this.markedString = markedString;
    this.rootElement.innerHTML = domPurify.sanitize(marked(this.markedString, { breaks: true }));
  }

  get element() {
    return this.rootElement;
  }
}

module.exports = class DataTipView {
  // Required: Define an ordinary constructor to initialize your component.
  constructor (properties) {
    this.properties = properties;
    etch.initialize(this);
  }

  render() {
    return (
      <div className="datatip-element">
        <SnippetView snippet={this.properties.snippet} />
        <MarkdownView markedString={this.properties.markedString} />
      </div>
    );
  }

  update (props, children) {
    // perform custom update logic here...
    // then call `etch.update`, which is async and returns a promise
    return etch.update(this)
  }

  // Optional: Destroy the component. Async/await syntax is pretty but optional.
  async destroy () {
    // call etch.destroy to remove the element and destroy child components
    await etch.destroy(this)
    // then perform custom teardown logic here...
  }
}
