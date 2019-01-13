'use babel';
/** @jsx etch.dom */

const ReactDOMServer = require('react-dom/server')
const etch = require('etch')
const marked = require('marked')
const createDOMPurify = require('dompurify')
const domPurify = createDOMPurify();

class SnippetView {
  constructor({ snippet, grammar }) {
    this.rootElement = document.createElement("div");
    this.rootElement.className = "datatip-container";
    if (snippet) {
      this.refreshRootElement(snippet, grammar);
    }
  }

  update({ snippet, grammar }) {
    this.refreshRootElement(snippet, grammar);
  }

  refreshRootElement(snippet, grammar) {
    const wrapper = document.createElement("div");
    wrapper.className = "datatip-marked-text-editor";
    if (snippet) {
      if (snippet.startsWith("(")) {
        const endOfType = snippet.indexOf(")");
        snippet = snippet.substr(endOfType + 1);
      }
      if (grammar) {
        const atomElem = atom.workspace.buildTextEditor({
          lineNumberGutterVisible: false
        });
        atomElem.setSoftWrapped(true);
        atomElem.setGrammar(grammar);
        atomElem.setText(snippet);
        const atomView = atom.views.getView(atomElem);
        atomView.style.fontSize = "1em";
        wrapper.appendChild(atomView);
      }
    }
    this.rootElement.appendChild(wrapper);
  }

  get element() {
    return this.rootElement;
  }
}

class MarkdownView {
  constructor({ markedString }) {
    this.markedString = markedString;
    this.rootElement = document.createElement('div');
    this.rootElement.className = "datatip-marked-container";
    this.rootElement.addEventListener("wheel", this.onMouseWheel, {passive: true});

    if (this.markedString) {
      this.rootElement.innerHTML = domPurify.sanitize(marked(this.markedString, { breaks: true }));
    }
  }
  update ({ markedString }) {
    this.markedString = markedString;
    if (this.markedString) {
      this.rootElement.innerHTML = domPurify.sanitize(marked(this.markedString, { breaks: true }));
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

class ReactComponentView {
  constructor({component}) {
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
  constructor (properties) {
    this.properties = properties;
    etch.initialize(this);
  }

  render() {
    if (this.properties.component) {
      return (
        <div className="datatip-element">
          <ReactComponentView component={this.properties.component} />
        </div>
      );
    }
    else {
      return (
        <div className="datatip-element">
          <SnippetView snippet={this.properties.snippet} grammar={this.properties.grammar} />
          <MarkdownView markedString={this.properties.markedString} />
        </div>
      );
    }
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
