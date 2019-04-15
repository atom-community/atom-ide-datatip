'use babel';

const { CompositeDisposable, Disposable, Range, Point, TextEditor } = require('atom');
const ProviderRegistry = require('./provider-registry');
const DataTipView = require('./datatip-view');

const DataTipAlignments = Object.freeze({
  BELOW: Symbol("below-line"),
  ABOVE: Symbol("above-line")
});

module.exports = class DatatipManager {

  constructor() {
    /**
     * [subscriptions description]
     * @type {CompositeDisposable}
     */
    this.subscriptions = new CompositeDisposable();
    /**
     * [providerRegistry description]
     * @type {ProviderRegistry}
     */
    this.providerRegistry = new ProviderRegistry();
    /**
     * [watchedEditors description]
     * @type {Array<TextEditor>}
     */
    this.watchedEditors = new WeakSet();
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
    /**
     * [onCursorMoveEvt description]
     */
    this.onCursorMoveEvt = this.onCursorMoveEvt.bind(this);
    /**
     * [mouseMoveTimer description]
     */
    this.mouseMoveTimer = null;
    /**
     * [cursorMoveTimer description]
     */
    this.cursorMoveTimer = null;
    /**
     * [renderer description]
     * @type {[type]}
     */
    this.renderer = null;
  }

  /**
   * [initialize description]
   */
  initialize(renderer) {
    this.renderer = renderer;

    this.subscriptions.add(
      atom.workspace.observeTextEditors(editor => {
        const disposable = this.watchEditor(editor);
        editor.onDidDestroy(() => disposable.dispose());
      }),
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
    let focusListener = () => this.updateCurrentEditor(editor);
    editorView.addEventListener('focus', focusListener);
    let blurListener = () => this.unmountDataTip();
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
    this.unmountDataTip();
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
      this.editor.onDidChangeCursorPosition(this.onCursorMoveEvt),
      this.editor.getBuffer().onDidChangeText(evt => {      // make sure to remove any datatip as long as we are typing
        if (evt.changes.length != 1) { return; }
        this.unmountDataTip();
      }),
      new Disposable(() => { this.editorView.removeEventListener("mousemove", this.onMouseMoveEvt); })
   );
  }

  onCursorMoveEvt (evt) {
    if (this.cursorMoveTimer) {
      clearTimeout(this.cursorMoveTimer);
    }

    this.cursorMoveTimer = setTimeout((evt) => {
      if ((evt.textChanged) || (!this.showDataTipOnCursorMove)) { return; }
      const editor = evt.cursor.editor;
      const position = evt.cursor.getBufferPosition();
      if ((this.currentMarkerRange === null) ||
          (!this.currentMarkerRange.containsPoint(position))) {
        this.showDataTip(editor, position, evt);
      }
    }, 500, evt);
  }
  /**
   * [onMouseMoveEvt description]
   * @param  {MouseEvent} evt [description]
   * @returns {any}
   */
  onMouseMoveEvt (evt) {
    if (this.mouseMoveTimer) {
      clearTimeout(this.mouseMoveTimer);
    }

    this.mouseMoveTimer = setTimeout((evt) => {
      if (this.editorView === null) { return; }

      const component = this.editorView.getComponent();
      // the screen position returned here is always capped to the max width of the text in this row
      const screenPosition = component.screenPositionForMouseEvent(evt);
      // the coordinates below represent X and Y positions on the screen of where the mouse event
      // occured and where the capped screenPosition is located
      const coordinates = {
        mouse: component.pixelPositionForMouseEvent(evt),
        screen: component.pixelPositionForScreenPosition(screenPosition),
      };
      const distance = Math.abs(coordinates.mouse.left - coordinates.screen.left);

      // If the distance between the coordinates is greater than the default character width, it
      // means the mouse event occured quite far away from where the text ends on that row. Do not
      // show the datatip in such situations and hide any existing datatips (the mouse moved more to
      // the right, away from the actual text)
      if (distance >= this.editor.getDefaultCharWidth()) {
        return this.unmountDataTip();
      }

      const point = this.editor.bufferPositionForScreenPosition(screenPosition);
      if ((this.currentMarkerRange === null) ||
           (!this.currentMarkerRange.containsPoint(point))) {
            this.showDataTip(this.editor, point, evt);
      }
    }, 500, evt);
  }

  /**
   * [showDataTip description]
   * @param  {TextEditor} editor   [description]
   * @param  {Point} position [description]
   */
  async showDataTip (editor, position, evt) {
    try {
      const provider = this.providerRegistry.getProviderForEditor(editor);
      if (provider) {
        const datatip = await provider.datatip(editor, position, evt);

        if (!datatip) {
          this.unmountDataTip();
        } else {
          // omit update of UI if the range is the same as the current one
          if (this.currentMarkerRange != null && datatip.range.intersectsWith(this.currentMarkerRange)) { return; }
          // make sure we are still on the same position
          if (!datatip.range.containsPoint(position)) { return; }

          // clear last data tip
          this.unmountDataTip();

          // store marker range
          this.currentMarkerRange = datatip.range;

          if (datatip.component){
            const dataTipView = new DataTipView({ reactView: datatip.component });
            this.dataTipMarkerDisposables = this.mountDataTipWithMarker(editor, datatip.range, position, dataTipView);
          }
          else if (datatip.markedStrings.length > 0) {
            const grammar = editor.getGrammar().name.toLowerCase();
            const htmlString = this.makeHtmlFromMarkedStrings(datatip.markedStrings, grammar);
            const html = await this.renderer.render(htmlString, grammar);
            const dataTipView = new DataTipView({ htmlView: html });
            this.dataTipMarkerDisposables = this.mountDataTipWithMarker(editor, datatip.range, position, dataTipView, DataTipAlignments.BELOW);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * [makeHtmlFromMarkedStrings description]
   * @param  {[type]} markedStrings   [description]
   * @param  {String} grammarName [description]
   * @return {String}          [description]
   */
  makeHtmlFromMarkedStrings(markedStrings, grammarName) {
    const regExpLSPPrefix = /^\((method|property|parameter|alias)\)\W/;

    return markedStrings.map(string => {
      if (string.type === 'markdown') {
        return (string.value.length > 0 ? `<p>${string.value}</p>` : null);
      } else if (string.type === 'snippet') {
        const snippet = string.value.replace(regExpLSPPrefix, '');
        const preElem = document.createElement('pre');
        const codeElem = document.createElement('code');
        codeElem.classList.add(grammarName);
        codeElem.innerText = snippet;
        preElem.appendChild(codeElem);
        return preElem.outerHTML;
      }
    }).join('');
  }

  /**
   * [mountDataTipWithMarker description]
   * @param  {TextEditor} editor   [description]
   * @param  {Range} range    [description]
   * @param  {Point} position [description]
   * @param  {DataTipView} view  [description]
   * @param  {DataTipAlignments} alignment [description]
   * @return {CompositeDisposable}          [description]
   */
  mountDataTipWithMarker(editor, range, position, view, alignment) {
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

    // if there is an overlay already on the same position, skip showing the data tip
    const decorations = editor.getOverlayDecorations().filter((decoration) => {
      const decorationMarker = decoration.getMarker();
      if (decorationMarker.compare(highlightMarker) == 1) {
        return decoration;
      }
      return null;
    });

    if (decorations.length > 0) return this.dataTipMarkerDisposables;

    const marker = editor.decorateMarker(overlayMarker, {
      type: 'overlay',
      class: 'datatip-overlay',
      position: 'tail',
      item: view.element,
    });

    switch(alignment) {
      case DataTipAlignments.ABOVE:
        // move box above the current editing line
        setTimeout(() => {
          view.element.style.bottom = editor.getLineHeightInPixels() + view.element.getBoundingClientRect().height + 'px';
          view.element.style.visibility = "visible";
        }, 100);
      break;
      case DataTipAlignments.BELOW:
        view.element.style.visibility = "visible";
      break;
    }

    view.element.addEventListener("mouseenter", () => {
      this.editorView.removeEventListener("mousemove", this.onMouseMoveEvt);
    });

    view.element.addEventListener("mouseleave", () => {
      this.editorView.addEventListener("mousemove", this.onMouseMoveEvt);
    });

    disposables.add(
      new Disposable(() => highlightMarker.destroy()),
      new Disposable(() => overlayMarker.destroy()),
      new Disposable(() => {
        this.editorView.addEventListener("mousemove", this.onMouseMoveEvt);
        view.destroy();
      }),
      new Disposable(() => marker.destroy())
    );

    return disposables;
  }

  /**
   * [unmountDataTip description]
   */
  unmountDataTip () {
    this.currentMarkerRange = null;
    if (this.dataTipMarkerDisposables) {
      this.dataTipMarkerDisposables.dispose();
    }
    this.dataTipMarkerDisposables = null;
  }
}
