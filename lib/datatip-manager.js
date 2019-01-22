// @ts-check
/// <reference path="../typings/atom-ide.d.ts"/>
'use babel';

const { CompositeDisposable, Disposable, Range, Point, TextEditor } = require('atom');
const ProviderRegistry = require('./provider-registry');
const DataTipView = require('./datatip-view');

module.exports = class DatatipManager {

  constructor() {
    /**
     * [subscriptions description]
     * @type {CompositeDisposable}
     */
    this.subscriptions = null;
    /**
     * [providerRegistry description]
     * @type {ProviderRegistry}
     */
    this.providerRegistry = null;
    /**
     * [watchedEditors description]
     * @type {Array<TextEditor>}
     */
    this.watchedEditors = null;
    /**
     * [editor description]
     * @type {TextEditor}
     */
    this.editor = null;
    /**
     * [editorView description]
     */
    this.editorView = null;
    /**
     * [editorSubscriptions description]
     * @type {CompositeDisposable}
     */
    this.editorSubscriptions = null;
    /**
     * [dataTipMarkerDisposables description]
     * @type {CompositeDisposable}
     */
    this.dataTipMarkerDisposables = null;
    /**
     * [showDataTipOnCursorMove description]
     * @type {Boolean}
     */
    this.showDataTipOnCursorMove = false;

    /**
     * [showDataTipOnMouseMove description]
     * @type {Boolean}
     */
    this.showDataTipOnMouseMove = false;

    /**
     * [currentMarkerRange description]
     * @type {Range}
     */
    this.currentMarkerRange = null;

    /**
     * [onMouseMoveEvt description]
     */
    this.onMouseMoveEvt = this.onMouseMoveEvt.bind(this);
  }

  /**
   * [initialize description]
   */
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
          const editor = evt.currentTarget.getModel();
          if (atom.workspace.isTextEditor(editor)) {
            const position = evt.currentTarget.getModel().getCursorBufferPosition();
            this.showDataTip(editor, position, undefined);
          }
        }
      }),
      atom.config.observe('atom-ide-datatip.showDataTipOnCursorMove', toggleSwitch => {
        this.showDataTipOnCursorMove = toggleSwitch;
        // forces update of internal editor tracking
        const editor = this.editor;
        this.editor = null;
        this.updateCurrentEditor(editor);
      }),
      atom.config.observe('atom-ide-datatip.showDataTipOnMouseMove', toggleSwitch => {
        this.showDataTipOnMouseMove = toggleSwitch;
        // forces update of internal editor tracking
        const editor = this.editor;
        this.editor = null;
        this.updateCurrentEditor(editor);
      }),
    );
  }

  /**
   * [dispose description]
   */
  dispose() {
    if (this.dataTipMarkerDisposables) {
        this.dataTipMarkerDisposables.dispose();
    }
    this.dataTipMarkerDisposables = null;

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
   * @param  {TextEditor} editor [description]
   * @return {Disposable | null}        [description]
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
   * @param  {TextEditor} editor [description]
   */
  updateCurrentEditor (editor) {
    if (editor === this.editor) { return; }
    if (this.editorSubscriptions) {
      this.editorSubscriptions.dispose();
    }
    this.editorSubscriptions = null;

    // Stop tracking editor + buffer; close any left-overs
    this.hideDataTip();
    this.editor = null;
    this.editorView = null;

    if (!atom.workspace.isTextEditor(editor)) { return; }

    this.editor = editor;
    this.editorView = atom.views.getView(this.editor);

    if (this.showDataTipOnMouseMove) {
      this.editorView.addEventListener("mousemove", this.onMouseMoveEvt);
    }

    this.editorSubscriptions = new CompositeDisposable();

    this.editorSubscriptions.add(
      this.editor.onDidChangeCursorPosition((evt) => {
        if ((evt.textChanged) || (!this.showDataTipOnCursorMove)) { return; }
        const editor = evt.cursor.editor;
        const position = evt.cursor.getBufferPosition();
        if ((this.currentMarkerRange === null) ||
            (!this.currentMarkerRange.containsPoint(position))) {
          this.showDataTip(editor, position, evt);
        }
     }),
     new Disposable(() => { this.editorView.removeEventListener("mousemove", this.onMouseMoveEvt); })
   );
  }

  /**
   * [onMouseMoveEvt description]
   * @param  {MouseEvent} evt [description]
   * @returns {any}
   */
  onMouseMoveEvt (evt) {
    const component = this.editorView.getComponent();

    // get the raw pixel position of the event
    const pixelPosition = component.pixelPositionForMouseEvent(evt);

    // the screen position returned here is always capped to the max width of the text in this row
    const screenPosition = component.screenPositionForMouseEvent(evt);
    // now turn this back into a pixel position
    const cappedPixelPosition = component.pixelPositionForScreenPosition(screenPosition);

    // now compare the diff of these two pixel positions
    const diff = pixelPosition.left - cappedPixelPosition.left
    const charWidth = component.getBaseCharacterWidth();
    if (diff > charWidth) {
      // if it's positively larger than 1 character in the editor we can be sure
      // that the mouse cursor is actually over no text, hence ignore it.
      return
    }

    const point = this.editor.bufferPositionForScreenPosition(screenPosition);

    if ((this.currentMarkerRange === null) ||
         (!this.currentMarkerRange.containsPoint(point))) {
          this.showDataTip(this.editor, point, evt);
    }
  }

  /**
   * [showDataTip description]
   * @param  {TextEditor} editor   [description]
   * @param  {Point} position [description]
   */
  showDataTip (editor, position, evt) {
    const provider = this.providerRegistry.getProviderForEditor(editor);
    if (provider) {
      provider.datatip(editor, position, evt)
        .then((result) => {
          // clear last data tip
          this.hideDataTip();

          if (result === null) { return; }

          // omit update of UI if the range is the same as the current one
          if (this.currentMarkerRange != null && result.range.compare(this.currentMarkerRange)) { return; }

          // store marker range
          this.currentMarkerRange = result.range;

          let dataTipView = null;

          if (result.component){
            dataTipView = new DataTipView({ component: result.component });
          }
          else if (result.markedStrings.length > 0) {
            dataTipView = new DataTipView({ markedStrings: result.markedStrings });
          }

          if (dataTipView) {
            this.dataTipMarkerDisposables = this.mountDataTipWithMarker(editor, result.range, position, dataTipView);
          }
        });
    }
  }

  /**
   * [mountDataTipWithMarker description]
   * @param  {TextEditor} editor   [description]
   * @param  {Range} range    [description]
   * @param  {Point} position [description]
   * @param  {DataTipView} view  [description]
   * @return {CompositeDisposable}          [description]
   */
  mountDataTipWithMarker(editor, range, position, view) {
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

    const marker = editor.decorateMarker(overlayMarker, {
      type: 'overlay',
      class: 'datatip-overlay',
      position: 'tail',
      item: view.element,
    });
    view.element.style.display = 'block';
    view.element.addEventListener("mouseenter", () => {
      this.editorView.removeEventListener("mousemove", this.onMouseMoveEvt);
    });
    view.element.addEventListener("mouseleave", () => {
      this.editorView.addEventListener("mousemove", this.onMouseMoveEvt);
    });

    disposables.add(
      new Disposable(() => highlightMarker.destroy()),
      new Disposable(() => overlayMarker.destroy()),
      new Disposable(() => view.destroy()),
      new Disposable(() => marker.destroy())
    );

    return disposables;
  }

  /**
   * [hideDataTip description]
   */
  hideDataTip () {
    this.currentMarkerRange = null;
    if (this.dataTipMarkerDisposables) {
      this.dataTipMarkerDisposables.dispose();
    }
    this.dataTipMarkerDisposables = null;
  }
}
