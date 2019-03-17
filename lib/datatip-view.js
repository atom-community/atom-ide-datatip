'use babel';
/** @jsx etch.dom */

const ReactDOMServer = require('react-dom/server');
const etch = require('etch');
const createDOMPurify = require('dompurify');
/**
 * [domPurify description]
 * @type {DOMPurify}
 */
const domPurify = createDOMPurify();

class HtmlView {
  constructor({ html }) {
    this.rootElement = document.createElement('div');
    this.rootElement.className = "datatip-marked-container";
    this.rootElement.addEventListener("wheel", this.onMouseWheel, { passive: true });
    if (html){
      this.rootElement.innerHTML = domPurify.sanitize(html);
    }
  }

  destroy() {
    this.rootElement.removeEventListener("wheel", this.onMouseWheel);
  }

  get element() {
    return this.rootElement;
  }

  onMouseWheel(evt) {
    evt.stopPropagation();
  }
}

class ReactView {
  constructor({ component }) {
    this.rootElement = document.createElement('span')
    if (component) {
      this.rootElement.innerHTML = domPurify.sanitize(ReactDOMServer.renderToStaticMarkup(component()))
    }
  }

  get element() {
    return this.rootElement
  }
}

module.exports = class DataTipView {
  // Required: Define an ordinary constructor to initialize your component.
  constructor(properties) {
    this.properties = properties;
    etch.initialize(this);
  }

  render() {
    if (this.properties.reactView) {
      return (
        <div className="datatip-element">
          <ReactView component={this.properties.reactView} />
        </div>
      );
    }
    else if (this.properties.htmlView) {
      return (
        <div className="datatip-element">
          <HtmlView html={this.properties.htmlView} />
        </div>
      );
    }
    else {
      return (
        <div className="datatip-element">
          { this.children }
        </div>
      );
    }
  }

  update(props, children) {
    // perform custom update logic here...
    // then call `etch.update`, which is async and returns a promise
    return etch.update(this)
  }

  // Optional: Destroy the component. Async/await syntax is pretty but optional.
  async destroy() {
    // call etch.destroy to remove the element and destroy child components
    await etch.destroy(this)
    // then perform custom teardown logic here...
  }
}
