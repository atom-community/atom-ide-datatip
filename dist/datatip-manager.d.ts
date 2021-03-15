/// <reference types="node" />
import { CompositeDisposable, Disposable, Range, Point, TextEditor, TextEditorElement, CommandEvent, CursorPositionChangedEvent } from "atom";
import type { DatatipProvider } from "atom-ide-base";
import { ViewContainer } from "atom-ide-base/commons-ui/float-pane/ViewContainer";
import { ProviderRegistry } from "atom-ide-base/commons-atom/ProviderRegistry";
export declare class DataTipManager {
    subscriptions: CompositeDisposable;
    providerRegistry: ProviderRegistry<DatatipProvider>;
    watchedEditors: WeakSet<TextEditor>;
    editor: TextEditor | null;
    editorView: TextEditorElement | null;
    editorSubscriptions: CompositeDisposable | null;
    dataTipMarkerDisposables: CompositeDisposable | null;
    showDataTipOnCursorMove: boolean;
    showDataTipOnMouseMove: boolean;
    currentMarkerRange: Range | null;
    mouseMoveTimer: NodeJS.Timeout | null;
    cursorMoveTimer: NodeJS.Timeout | null;
    hoverTime: any;
    constructor();
    initialize(): void;
    dispose(): void;
    get datatipService(): ProviderRegistry<DatatipProvider>;
    watchEditor(editor: TextEditor): Disposable | undefined;
    updateCurrentEditor(editor: TextEditor | null): void;
    onCursorMoveEvt(event: CursorPositionChangedEvent): void;
    onMouseMoveEvt(event: MouseEvent): void;
    onCommandEvt(evt: CommandEvent<TextEditorElement>): void;
    showDataTip(editor: TextEditor, position: Point): Promise<void>;
    mountDataTipWithMarker(editor: TextEditor, range: Range, position: Point, view: ViewContainer): CompositeDisposable | null;
    unmountDataTip(): void;
}
