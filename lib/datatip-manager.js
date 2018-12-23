// @ts-check
/// <reference path="../typings/atom-ide.d.ts"/>
/// <reference path="../typings/atom.d.ts" />
'use babel';

const { CompositeDisposable, Disposable, Point, Range } = require('atom');
const ProviderRegistry = require('./provider-registry');

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
   * @param  {[type]} evt [description]
   * @return {[type]}     [description]
   */
  cursorMoved (evt) {
    let provider = this.providerRegistry.getProviderForEditor(evt.cursor.editor);
    if (provider) {
      provider.datatip(evt.cursor.editor, evt.newBufferPosition, evt)
        .then((result) => {
          if (result && result.markedStrings.length > 0) {
            result.markedStrings.forEach(m => console.log(m.value));
          }
        });
    }
  }

  /**
   * [hideDataTip description]
   * @param  {[type]} evt [description]
   * @return {[type]}     [description]
   */
  hideDataTip (evt) {

  }
}
