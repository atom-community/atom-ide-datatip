// @ts-check
/// <reference path="../typings/atom-ide.d.ts"/>
/// <reference path="../typings/atom.d.ts" />
'use babel';

const { CompositeDisposable, Disposable, Point, Range } = require('atom');
const ProviderRegistry = require('./provider-registry');
const DataTipView = require('./datatip-view');

module.exports = class DatatipManager {

  constructor() {
    /**
     * [subscriptions description]
     * @type {Atom.CompositeDisposable}
     */
    this.subscriptions = null;
    /**
     * [providerRegistry description]
     * @type {ProviderRegistry}
     */
    this.providerRegistry = null;
    /**
     * [watchedEditors description]
     * @type {Array<Atom.TextEditor>}
     */
    this.watchedEditors = null;
    /**
     * [editor description]
     * @type {Atom.TextEditor}
     */
    this.editor = null;
    /**
     * [editorView description]
     * @type {Atom.TextEditorElement}
     */
    this.editorView = null;
    /**
     * [editorSubscriptions description]
     * @type {Atom.CompositeDisposable}
     */
    this.editorSubscriptions = null;
    /**
     * [dataTipMarkerDisposables description]
     * @type {Atom.CompositeDisposable}
     */
    this.dataTipMarkerDisposables = null;
  }

  initialize() {
    this.subscriptions = new CompositeDisposable();
    this.providerRegistry = new ProviderRegistry();
    this.watchedEditors = new WeakSet();

    this.subscriptions.add(
      atom.workspace.observeTextEditors(editor => {
        const disposable = this.watchEditor(editor);
        editor.onDidDestroy(() => disposable.dispose());
      })
    );

    this.subscriptions.add(
      atom.commands.add('atom-text-editor', {
        'datatip:toggle': (evt) => {
          this.showDataTip();
        }
      })
    );
  }

  dispose() {
    if (this.editorSubscriptions) {
      this.editorSubscriptions.dispose();
    }
    this.editorSubscriptions = null;

    if (this.subscriptions) {
      this.subscriptions.dispose();
    }
    this.subscriptions = null;
  }

  /**
   * [addProvider description]
   * @param {AtomIDE.DatatipProvider} provider [description]
   * @returns {Disposable}
   */
  addProvider (provider) {
    return this.providerRegistry.addProvider(provider);
  }

  /**
   * [watchEditor description]
   * @param  {Atom.TextEditor} editor [description]
   * @return {Atom.Disposable | null}        [description]
   */
  watchEditor (editor) {
    if (this.watchedEditors.has(editor)) { return; }
    let editorView = atom.views.getView(editor);
    if (editorView.hasFocus()) {
      this.updateCurrentEditor(editor);
    }
    let focusListener = (element) => this.updateCurrentEditor(editor);
    editorView.addEventListener('focus', focusListener);
    let blurListener = (element) => this.hideDataTip();
    editorView.addEventListener('blur', blurListener);

    let disposable = new Disposable(() => {
      editorView.removeEventListener('focus', focusListener);
      editorView.removeEventListener('blur', blurListener);
      if (this.editor === editor) {
        this.updateCurrentEditor(null);
      }
    });

    this.watchedEditors.add(editor);
    this.subscriptions.add(disposable);

    return new Disposable(() => {
      disposable.dispose();
      if (this.subscriptions != null) {
        this.subscriptions.remove(disposable);
      }
      this.watchedEditors.delete(editor);
    });
  }

  /**
   * [updateCurrentEditor description]
   * @param  {Atom.TextEditor} editor [description]
   * @return {[type]}        [description]
   */
  updateCurrentEditor (editor) {
    if (editor === this.editor) { return; }
    if (this.editorSubscriptions) {
      this.editorSubscriptions.dispose();
    }
    this.editorSubscriptions = null;

    // Stop tracking editor + buffer
    this.editor = null;
    this.editorView = null;

    if (!atom.workspace.isTextEditor(editor)) { return; }

    this.editor = editor;
    this.editorView = atom.views.getView(this.editor);

    this.editorSubscriptions = new CompositeDisposable();
    this.editorSubscriptions.add(this.editor.onDidChangeCursorPosition((e) => { this.cursorMoved(e); }));
  }

  /**
   * [cursorMoved description]
   * @param  {Atom.CursorPositionChangedEvent} evt [description]
   * @return {[type]}     [description]
   */
  cursorMoved (evt) {
    this.showDataTip(evt);
  }

  /**
   * [showDataTip description]
   * @param  {Atom.CursorPositionChangedEvent} evt [description]
   * @return {[type]}     [description]
   */
  showDataTip (evt) {
    const activeEditor = (evt ? evt.cursor.editor : this.editor);
    const position = (evt ? evt.cursor.getBufferPosition() : this.editor.getLastCursor().getBufferPosition());

    if (this.dataTipMarkerDisposables) {
      this.dataTipMarkerDisposables.dispose();
    }

    const provider = this.providerRegistry.getProviderForEditor(activeEditor);
    if (provider) {
      provider.datatip(activeEditor, position, evt)
        .then((result) => {
          if (result && result.markedStrings.length > 0) {
            let snippet, markedString;
            result.markedStrings.forEach(m => {
              switch(m.type) {
                case "snippet":
                  snippet = m.value;
                  break;
                case "markdown":
                  markedString = m.value;
                  break;
              }
            });
            const dataTipView = new DataTipView({ snippet: snippet, markedString: markedString });
            this.dataTipMarkerDisposables = this.mountDataTipWithMarker(activeEditor, result.range, position, dataTipView.element);
          }
        });
    }
  }

  /**
   * [mountDataTipWithMarker description]
   * @param  {Atom.TextEditor} editor   [description]
   * @param  {Atom.RangeCompatible} range    [description]
   * @param  {Atom.Point} position [description]
   * @param  {HTMLElement} element  [description]
   * @return {Atom.CompositeDisposable}          [description]
   */
  mountDataTipWithMarker(editor, range, position, element) {
    let disposables = new CompositeDisposable();

    // Highlight the text indicated by the datatip's range.
    const highlightMarker = editor.markBufferRange(range, {
      invalidate: 'never',
    });

    editor.decorateMarker(highlightMarker, {
      type: 'highlight',
      class: 'datatip-highlight-region',
    });

    // The actual datatip should appear at the trigger position.
    const overlayMarker = editor.markBufferRange(new Range(position, position), {
      invalidate: 'never',
    });

    editor.getElement().getNextUpdatePromise().then(() => {
        editor.decorateMarker(overlayMarker, {
          type: 'overlay',
          class: 'datatip-overlay',
          position: 'tail',
          item: element,
        });
        element.style.display = 'block';
      }
    );

    disposables.add(
      new Disposable(() => highlightMarker.destroy()),
      new Disposable(() => overlayMarker.destroy())
    );
    return disposables;
  }

  /**
   * [hideDataTip description]
   * @param  {[type]} evt [description]
   * @return {[type]}     [description]
   */
  hideDataTip (evt) {

  }
}
