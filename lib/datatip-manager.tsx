import {
  CompositeDisposable,
  Disposable,
  Range,
  Point,
  TextEditor,
  TextEditorElement,
  CommandEvent,
  CursorPositionChangedEvent,
} from "atom"
import type { Datatip, DatatipProvider, ReactComponentDatatip } from "atom-ide-base"
import { ViewContainer, Props as ViewContainerProps } from "atom-ide-base/src-commons-ui/float-pane/ViewContainer"
import { render } from "solid-js/web"
import { ProviderRegistry } from "atom-ide-base/src-commons-atom/ProviderRegistry"
import { makeOverlaySelectable } from "atom-ide-base/src-commons-ui/float-pane/selectable-overlay"

export class DataTipManager {
  /** Holds a reference to disposable items from this data tip manager */
  subscriptions: CompositeDisposable = new CompositeDisposable()

  /** Holds a list of registered data tip providers */
  providerRegistry: ProviderRegistry<DatatipProvider> = new ProviderRegistry()

  /** Holds a weak reference to all watched Atom text editors */
  watchedEditors: WeakSet<TextEditor> = new WeakSet()

  /** Holds a reference to the current watched Atom text editor */
  editor: TextEditor | null = null

  /** Holds a reference to the current watched Atom text editor viewbuffer */
  editorView: TextEditorElement | null = null

  /** Holds a reference to all disposable items for the current watched Atom text editor */
  editorSubscriptions: CompositeDisposable | null = null

  /** Holds a reference to all disposable items for the current data tip */
  dataTipMarkerDisposables: CompositeDisposable | null = null

  /** Config flag denoting if the data tip should be shown when moving the cursor on screen */
  showDataTipOnCursorMove = false

  /** Config flag denoting if the data tip should be shown when moving the mouse cursor around */
  showDataTipOnMouseMove = true

  /** Holds the range of the current data tip to prevent unnecessary show/hide calls */
  currentMarkerRange: Range | null = null

  /**
   * To optimize show/hide calls we set a timeout of hoverTime for the mouse movement only if the mouse pointer is not
   * moving for more than hoverTime the data tip functionality is triggered
   */
  mouseMoveTimer: NodeJS.Timeout | null = null

  /**
   * To optimize show/hide calls we set a timeout of hoverTime for the cursor movement only if the cursor is not moving
   * for more than hoverTime the data tip functionality is triggered
   */
  cursorMoveTimer: NodeJS.Timeout | null = null

  /**
   * The time that the mouse/cursor should hover/stay to show a datatip. Also specifies the time that the datatip is
   * still shown when the mouse/cursor moves [ms].
   */
  hoverTime = atom.config.get("atom-ide-datatip.hoverTime")

  constructor() {
    /** The mouse move event handler that evaluates the screen position and eventually shows a data tip */
    this.onMouseMoveEvt = this.onMouseMoveEvt.bind(this)

    /** The cursor move event handler that evaluates the cursor position and eventually shows a data tip */
    this.onCursorMoveEvt = this.onCursorMoveEvt.bind(this)
  }

  /** Initialization routine retrieving a reference to the markdown service */
  initialize() {
    this.subscriptions.add(
      atom.workspace.observeTextEditors((editor) => {
        const disposable = this.watchEditor(editor)
        editor.onDidDestroy(() => disposable?.dispose())
      }),
      atom.commands.add("atom-text-editor", {
        "datatip:toggle": (evt) => this.onCommandEvt(evt),
      }),
      atom.config.observe("atom-ide-datatip.showDataTipOnCursorMove", (toggleSwitch) => {
        this.showDataTipOnCursorMove = toggleSwitch
        // forces update of internal editor tracking
        const editor = this.editor
        this.editor = null
        this.updateCurrentEditor(editor)
      }),
      atom.config.observe("atom-ide-datatip.showDataTipOnMouseMove", (toggleSwitch) => {
        this.showDataTipOnMouseMove = toggleSwitch
        // forces update of internal editor tracking
        const editor = this.editor
        this.editor = null
        this.updateCurrentEditor(editor)
      })
    )
  }

  /** Dispose function to clean up any disposable references used */
  dispose() {
    if (this.dataTipMarkerDisposables) {
      this.dataTipMarkerDisposables.dispose()
    }
    this.dataTipMarkerDisposables = null

    if (this.editorSubscriptions) {
      this.editorSubscriptions.dispose()
    }
    this.editorSubscriptions = null

    this.subscriptions.dispose()
  }

  /** Returns the provider registry as a consumable service */
  get datatipService() {
    return this.providerRegistry
  }

  /**
   * Checks and setups an Atom Text editor instance for tracking cursor/mouse movements
   *
   * @param editor A valid Atom Text editor instance
   */
  watchEditor(editor: TextEditor) {
    if (this.watchedEditors.has(editor)) {
      return
    }
    const editorView = atom.views.getView(editor)
    if (editorView.hasFocus()) {
      this.updateCurrentEditor(editor)
    }
    const focusListener = () => this.updateCurrentEditor(editor)
    editorView.addEventListener("focus", focusListener)
    const blurListener = () => this.unmountDataTip()
    editorView.addEventListener("blur", blurListener)

    const disposable = new Disposable(() => {
      editorView.removeEventListener("focus", focusListener)
      editorView.removeEventListener("blur", blurListener)
      if (this.editor === editor) {
        this.updateCurrentEditor(null)
      }
    })

    this.watchedEditors.add(editor)
    this.subscriptions.add(disposable)

    return new Disposable(() => {
      disposable.dispose()
      this.subscriptions.remove(disposable)
      this.watchedEditors.delete(editor)
    })
  }

  /**
   * Updates the internal references to a specific Atom Text editor instance in case it has been decided to track this instance
   *
   * @param editor The Atom Text editor instance to be tracked
   */
  updateCurrentEditor(editor: TextEditor | null) {
    if (editor === this.editor) {
      return
    }
    if (this.editorSubscriptions) {
      this.editorSubscriptions.dispose()
    }
    this.editorSubscriptions = null

    // Stop tracking editor + buffer; close any left-overs
    this.unmountDataTip()
    this.editor = null
    this.editorView = null

    if (editor === null || !atom.workspace.isTextEditor(editor)) {
      return
    }

    this.editor = editor
    this.editorView = atom.views.getView(this.editor)

    if (this.showDataTipOnMouseMove) {
      this.editorView.addEventListener("mousemove", this.onMouseMoveEvt)
    }

    this.editorSubscriptions = new CompositeDisposable()

    this.editorSubscriptions.add(
      this.editor.onDidChangeCursorPosition(this.onCursorMoveEvt),
      this.editor.getBuffer().onDidChangeText((evt) => {
        // make sure to remove any datatip as long as we are typing
        if (evt.changes.length === 0) {
          return
        }
        this.unmountDataTip()
      }),
      new Disposable(() => {
        this.editorView?.removeEventListener("mousemove", this.onMouseMoveEvt)
      })
    )
  }

  /**
   * The central cursor movement event handler
   *
   * @param evt The cursor move event
   */
  onCursorMoveEvt(event: CursorPositionChangedEvent) {
    if (this.cursorMoveTimer) {
      clearTimeout(this.cursorMoveTimer)
    }

    this.cursorMoveTimer = setTimeout(
      (evt) => {
        if (evt.textChanged || !this.showDataTipOnCursorMove) {
          return
        }
        const editor = evt.cursor.editor
        const position = evt.cursor.getBufferPosition()
        if (this.currentMarkerRange === null || !this.currentMarkerRange.containsPoint(position)) {
          this.showDataTip(editor, position)
        }
      },
      this.hoverTime,
      event
    )
  }

  /** The central mouse movement event handler */
  onMouseMoveEvt(event: MouseEvent) {
    if (this.mouseMoveTimer) {
      clearTimeout(this.mouseMoveTimer)
    }

    this.mouseMoveTimer = setTimeout(
      (evt) => {
        if (this.editorView === null || this.editor === null) {
          return
        }

        const component = this.editorView.getComponent()
        // the screen position returned here is always capped to the max width of the text in this row
        const screenPosition = component.screenPositionForMouseEvent(evt)
        // the coordinates below represent X and Y positions on the screen of where the mouse event
        // occured and where the capped screenPosition is located
        const coordinates = {
          mouse: component.pixelPositionForMouseEvent(evt),
          screen: component.pixelPositionForScreenPosition(screenPosition),
        }
        const distance = Math.abs(coordinates.mouse.left - coordinates.screen.left)

        // If the distance between the coordinates is greater than the default character width, it
        // means the mouse event occured quite far away from where the text ends on that row. Do not
        // show the datatip in such situations and hide any existing datatips (the mouse moved more to
        // the right, away from the actual text)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore: internal API
        if (distance >= this.editor.getDefaultCharWidth()) {
          return this.unmountDataTip()
        }

        const point = this.editor.bufferPositionForScreenPosition(screenPosition)
        if (this.currentMarkerRange === null || !this.currentMarkerRange.containsPoint(point)) {
          this.showDataTip(this.editor, point)
        }
      },
      this.hoverTime,
      event
    )
  }

  /**
   * The central command event handler
   *
   * @param evt Command event
   */
  onCommandEvt(evt: CommandEvent<TextEditorElement>) {
    const editor = evt.currentTarget.getModel()

    if (atom.workspace.isTextEditor(editor)) {
      const position = evt.currentTarget.getModel().getCursorBufferPosition()

      const isTooltipOpenForPosition = this.currentMarkerRange?.containsPoint(position)
      if (isTooltipOpenForPosition) {
        return this.unmountDataTip()
      }

      this.showDataTip(editor, position)
    }
  }

  /**
   * Evaluates the responsible DatatipProvider to call for data tip information at a given position in a specific Atom Text editor
   *
   * @param editor The Atom Text editor instance to be used
   * @param position The cursor or mouse position within the text editor to qualify for a data tip
   * @param evt The original event triggering this data tip evaluation
   * @returns A promise object to track the asynchronous operation
   */
  async showDataTip(editor: TextEditor, position: Point): Promise<void> {
    try {
      let datatip: Datatip | null = null
      for (const provider of this.providerRegistry.getAllProvidersForEditor(editor)) {
        // we only need one and we want to process them synchronously
        // eslint-disable-next-line no-await-in-loop
        const providerTip = await provider.datatip(editor, position)
        if (providerTip) {
          datatip = providerTip
          break
        }
      }
      if (!datatip) {
        this.unmountDataTip()
      } else {
        // omit update of UI if the range is the same as the current one
        if (this.currentMarkerRange !== null && datatip.range.intersectsWith(this.currentMarkerRange)) {
          return
        }
        // make sure we are still on the same position
        if (!datatip.range.containsPoint(position)) {
          return
        }

        // clear last data tip
        this.unmountDataTip()

        // store marker range
        this.currentMarkerRange = datatip.range

        if ("component" in datatip) {
          const element = document.createElement("div")
          render(
            () => (
              <ViewContainer
                component={{
                  component: (datatip as ReactComponentDatatip).component,
                  containerClassName: "datatip-component-container",
                  contentClassName: "datatip-component",
                }}
                className="datatip-element select-list popover-list"
              />
            ),
            element
          )
          this.dataTipMarkerDisposables = this.mountDataTipWithMarker(editor, datatip.range, position, element)
        } else if (datatip.markedStrings.length > 0) {
          const grammar = editor.getGrammar().scopeName.toLowerCase()

          const snippetData: string[] = []
          const markdownData: string[] = []
          for (const markedString of datatip.markedStrings) {
            if (markedString.type === "snippet") {
              snippetData.push(markedString.value)
            } else if (markedString.type === "markdown") {
              markdownData.push(markedString.value)
            }
          }

          let snippet: ViewContainerProps["snippet"] | undefined = undefined
          let markdown: ViewContainerProps["markdown"] | undefined = undefined
          if (snippetData.length > 0) {
            snippet = {
              snippet: snippetData,
              grammarName: grammar,
              containerClassName: "datatip-snippet-container",
              contentClassName: "datatip-snippet",
            }
          }
          if (markdownData.length > 0) {
            markdown = {
              markdown: markdownData,
              grammarName: grammar,
              containerClassName: "datatip-markdown-container",
              contentClassName: "datatip-markdown",
            }
          }
          const element = document.createElement("div")
          render(
            () => (
              <ViewContainer
                snippet={snippet}
                markdown={markdown}
                className="datatip-element select-list popover-list"
              />
            ),
            element
          )
          this.dataTipMarkerDisposables = this.mountDataTipWithMarker(editor, datatip.range, position, element)
        }
      }
    } catch (err) {
      this.unmountDataTip()
      console.error(err)
    }
  }

  /**
   * Mounts / displays a data tip view component at a specific position in a given Atom Text editor
   *
   * @param editor The Atom Text editor instance to host the data tip view
   * @param range The range for which the data tip component is valid
   * @param position The position on which to show the data tip view
   * @param view The data tip component to display
   * @returns A composite object to release references at a later stage
   */
  mountDataTipWithMarker(
    editor: TextEditor,
    range: Range,
    position: Point,
    element: HTMLElement
  ): CompositeDisposable | null {
    const disposables = new CompositeDisposable()

    // Highlight the text indicated by the datatip's range.
    const highlightMarker = editor.markBufferRange(range, {
      invalidate: "never",
    })

    // OPTIMIZATION:
    // if there is an highligh overlay already on the same position, skip adding the highlight
    const decorations = editor.getOverlayDecorations().filter((decoration) => {
      return decoration.isType("highligh") && decoration.getMarker().compare(highlightMarker) === 1
    })
    if (decorations.length > 0) {
      highlightMarker.destroy()
      // END OPTIMIZATION
    } else {
      // Actual Highlighting
      disposables.add(new Disposable(() => highlightMarker.destroy()))

      editor.decorateMarker(highlightMarker, {
        type: "highlight",
        class: "datatip-highlight-region",
      })
    }

    // The actual datatip should appear at the trigger position.
    const overlayMarker = editor.markBufferRange(new Range(position, position), {
      invalidate: "never",
    })

    // makes overlay selectable
    makeOverlaySelectable(editor, element)

    editor.decorateMarker(overlayMarker, {
      type: "overlay",
      class: "datatip-overlay",
      position: "tail",
      item: element,
    })
    disposables.add(new Disposable(() => overlayMarker.destroy()))

    if (this.showDataTipOnMouseMove) {
      element.addEventListener("mouseenter", () => {
        this.editorView?.removeEventListener("mousemove", this.onMouseMoveEvt)
      })

      element.addEventListener("mouseleave", () => {
        this.editorView?.addEventListener("mousemove", this.onMouseMoveEvt)
      })

      disposables.add(
        new Disposable(() => {
          this.editorView?.addEventListener("mousemove", this.onMouseMoveEvt)
        })
      )
    }

    // TODO move this code to atom-ide-base
    element.addEventListener("wheel", onMouseWheel, { passive: true })

    return disposables
  }

  /** Unmounts / hides the most recent data tip view component */
  unmountDataTip() {
    this.currentMarkerRange = null
    this.dataTipMarkerDisposables?.dispose()
    this.dataTipMarkerDisposables = null
  }
}

/**
 * Handles the mouse wheel event to enable scrolling over long text
 *
 * @param evt The mouse wheel event being triggered
 */
function onMouseWheel(evt: WheelEvent) {
  evt.stopPropagation()
}
