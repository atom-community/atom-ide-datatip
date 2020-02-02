// @ts-check
/// <reference path="../typings/atom-ide.d.ts"/>
'use babel';

const { CompositeDisposable, Disposable, Range, Point, TextEditor } = require('atom');
const ProviderRegistry = require('./provider-registry');
const DataTipView = require('./datatip-view');

module.exports = class DatatipManager {

  constructor() {
    /**
     * holds a reference to disposable items from this data tip manager
     * @type {CompositeDisposable}
     */
    this.subscriptions = new CompositeDisposable();
    /**
     * holds a list of registered data tip providers
     * @type {ProviderRegistry}
     */
    this.providerRegistry = new ProviderRegistry();
    /**
     * holds a weak reference to all watched Atom text editors
     * @type {Array<TextEditor>}
     */
    this.watchedEditors = new WeakSet();
    /**
     * holds a reference to the current watched Atom text editor
     * @type {TextEditor}
     */
    this.editor = null;
    /**
     * holds a reference to the current watched Atom text editor viewbuffer
     */
    this.editorView = null;
    /**
     * holds a reference to all disposable items for the current watched Atom text editor
     * @type {CompositeDisposable}
     */
    this.editorSubscriptions = null;
    /**
     * holds a reference to all disposable items for the current data tip
     * @type {CompositeDisposable}
     */
    this.dataTipMarkerDisposables = null;
    /**
     * config flag denoting if the data tip should be shown when moving the cursor on screen
     * @type {Boolean}
     */
    this.showDataTipOnCursorMove = false;
    /**
     * config flag denoting if the data tip should be shown when moving the mouse cursor around
     * @type {Boolean}
     */
    this.showDataTipOnMouseMove = false;
    /**
     * holds the range of the current data tip to prevent unnecessary show/hide calls
     * @type {Range}
     */
    this.currentMarkerRange = null;
    /**
     * the mouse move event handler that evaluates the screen position and eventually shows a data tip
     */
    this.onMouseMoveEvt = this.onMouseMoveEvt.bind(this);
    /**
     * the cursor move event handler that evaluates the cursor position and eventually shows a data tip
     */
    this.onCursorMoveEvt = this.onCursorMoveEvt.bind(this);
    /**
     * to optimize show/hide calls we set a timeout of 500ms for the mouse movement
     * only if the mouse pointer is not moving for more than 500ms the data tip functionality is triggered
     */
    this.mouseMoveTimer = null;
    /**
     * to optimize show/hide calls we set a timeout of 500ms for the cursor movement
     * only if the cursor is not moving for more than 500ms the data tip functionality is triggered
     */
    this.cursorMoveTimer = null;
    /**
     * a reference to the markdown rendering service
     * @type {AtomIDE.MarkdownService}
     */
    this.renderer = null;
  }

  /**
   * initialization routine retrieving a reference  to the markdown service
   * @param {AtomIDE.MarkdownService} renderer the markdown rendering service reference
   */
  initialize(renderer) {
    this.renderer = renderer;

    this.subscriptions.add(
      atom.workspace.observeTextEditors(editor => {
        const disposable = this.watchEditor(editor);
        editor.onDidDestroy(() => disposable.dispose());
      }),
      atom.commands.add('atom-text-editor', {
        'datatip:toggle': (evt) => this.onCommandEvt(evt)
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
   * dispose function to clean up any disposable references used
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
   * returns the provider registry as a consumable service
   * @return {AtomIDE.DatatipService} [description]
   */
  get datatipService() {
    return this.providerRegistry;
  }

  /**
   * checks and setups an Atom Text editor instance for tracking cursor/mouse movements
   * @param  {TextEditor} editor  a valid Atom Text editor instance
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
   * updates the internal references to a specific Atom Text editor instance in case
   * it has been decided to track this instance
   * @param  {TextEditor} editor the Atom Text editor instance to be tracked
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
        if (evt.changes.length === 0) { return; }
        this.unmountDataTip();
      }),
      new Disposable(() => { this.editorView.removeEventListener("mousemove", this.onMouseMoveEvt); })
   );
  }

  /**
   * the central cursor movement event handler
   * @param {CursorPositionChangedEvent} evt the cursor move event
   */
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
   * the central mouse movement event handler
   * @param  {MouseEvent} evt [description]
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
   * the central command event handler
   * @param  { CommandEvent } evt command event
   */
  onCommandEvt (evt) {
    const editor = evt.currentTarget.getModel();

    if (atom.workspace.isTextEditor(editor)) {
      const position = evt.currentTarget.getModel().getCursorBufferPosition();

      const isTooltipOpenForPosition = this.currentMarkerRange && this.currentMarkerRange.containsPoint(position);
      if(isTooltipOpenForPosition) {
        return this.unmountDataTip();
      }

      this.showDataTip(editor, position, undefined);
    }
  }

  /**
   * evaluates the responsible DatatipProvider to call for data tip information at a given position in a specific Atom Text editor
   * @param  {TextEditor} editor   the Atom Text editor instance to be used
   * @param  {Point} position the cursor or mouse position within the text editor to qualify for a data tip
   * @param {CursorPositionChangedEvent | MouseEvent | null} evt the original event triggering this data tip evaluation
   * @return {Promise} a promise object to track the asynchronous operation
   */
  async showDataTip (editor, position, evt) {
    try {
      let datatip = null;
      for (const provider of this.providerRegistry.getAllProvidersForEditor(editor)) {
        const providerTip = await provider.datatip(editor, position, evt);
        if (providerTip) {
          datatip = providerTip;
          break;
        }
      }
      if (!datatip) {
        this.unmountDataTip();
      }
      else {
        // omit update of UI if the range is the same as the current one
        if (this.currentMarkerRange != null && datatip.range.intersectsWith(this.currentMarkerRange)) { return; }
        // make sure we are still on the same position
        if (!datatip.range.containsPoint(position)) { return; }

        // clear last data tip
        this.unmountDataTip();

        // store marker range
        this.currentMarkerRange = datatip.range;

        if (datatip.component){
          const dataTipView = new DataTipView({ component: datatip.component });
          this.dataTipMarkerDisposables = this.mountDataTipWithMarker(editor, datatip.range, position, dataTipView);
        }
        else if (datatip.markedStrings.length > 0) {
          const grammar = editor.getGrammar().scopeName.toLowerCase();
          const snippetHtml = await this.getSnippetHtml(datatip.markedStrings.filter(t => t.type === 'snippet').map(t => t.value), grammar);
          const documentationHtml = await this.getDocumentationHtml(datatip.markedStrings.filter(t => t.type === 'markdown').map(t => t.value), grammar);
          const dataTipView = new DataTipView({ snippet: snippetHtml, html: documentationHtml });
          this.dataTipMarkerDisposables = this.mountDataTipWithMarker(editor, datatip.range, position, dataTipView);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * converts a given code snippet into syntax formatted HTML
   * @param  {Array<String>}  snippets     the code snippet to be converted
   * @param  {String}  grammarName the name of the grammar to be used for syntax highlighting
   * @return {Promise<string>}     a promise object to track the asynchronous operation
   */
  async getSnippetHtml(snippets, grammarName) {
    if ((snippets !== undefined) && (snippets.length > 0)) {
      const regExpLSPPrefix = /^\((method|property|parameter|alias)\)\W/;
      const divElem = document.createElement('div');
      snippets.forEach((snippet) => {
        const preElem = document.createElement('pre');
        const codeElem = document.createElement('code');
        snippet = snippet.replace(/^\s*<(\?|!)([a-zA-Z]+)?\s*/i, ''); // remove any preamble from the line
        codeElem.innerText = snippet.replace(regExpLSPPrefix, '');
        preElem.appendChild(codeElem);
        divElem.appendChild(preElem);
      });
      return this.renderer.render(divElem.outerHTML, grammarName);
    }
    return null;
  }

  /**
   * convert the markdown documentation to HTML
   * @param  {Array<String>}  markdownTexts the documentation text in markdown format to be converted
   * @param  {String}  grammarName  the default grammar used for embedded code samples
   * @return {Promise<string>}      a promise object to track the asynchronous operation
   */
  async getDocumentationHtml(markdownTexts, grammarName) {
    if ((markdownTexts !== undefined) && (markdownTexts.length > 0)) {
      const markdownText = markdownTexts.join("\r\n");
      return this.renderer.render(markdownText, grammarName);
    }
    return null;
  }

  /**
   * mounts / displays a data tip view component at a specific position in a given Atom Text editor
   * @param  {TextEditor} editor   the Atom Text editor instance to host the data tip view
   * @param  {Range} range         the range for which the data tip component is valid
   * @param  {Point} position      the position on which to show the data tip view
   * @param  {DataTipView} view    the data tip component to display
   * @return {CompositeDisposable}  a composite object to release references at a later stage
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
   * unmounts / hides the most recent data tip view component
   */
  unmountDataTip () {
    this.currentMarkerRange = null;
    if (this.dataTipMarkerDisposables) {
      this.dataTipMarkerDisposables.dispose();
    }
    this.dataTipMarkerDisposables = null;
  }
}
