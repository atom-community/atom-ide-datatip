'use babel';
/** @jsx etch.dom */

const etch = require('etch')
const marked = require('marked')
const createDOMPurify = require('dompurify')
const domPurify = createDOMPurify();

const SnippetView = ({ snippet }) => {
  return ( snippet ?
    <div className="datatip-marked-text-editor-container">
      {snippet}
    </div> : ""
  );
}

const MarkdownView = ({ markedString }) => {
    return ( markedString ?
        <div className="datatip-marked-container">
          { domPurify.sanitize(
              marked(markedString, {
                breaks: true,
              })) }
        </div> : ""
    );
}

module.exports = class DataTipView {
  // Required: Define an ordinary constructor to initialize your component.
  constructor (properties) {
    this.properties = properties;
    etch.initialize(this);
  }

  render() {
    return (
      <div className="datatip-container">
        { SnippetView(this.properties) }
        { MarkdownView(this.properties) }
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
