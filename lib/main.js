// @ts-check
/// <reference path="../typings/atom-ide.d.ts"/>

import { CompositeDisposable } from "atom";
import { DataTipManager } from "./datatip-manager";

/**
 * the Atom IDE data tip plugin
 * @type {Object}
 */

/**
 * [subscriptions description]
 * @type {CompositeDisposable}
 */
let subscriptions;
/**
 * [datatipManager description]
 * @type {DataTipManager}
 */
let datatipManager;
/**
 * a reference to the markdown rendering service
 * @type {AtomIDE.MarkdownService}
 */
let renderer = null;

/**
 * called by Atom when activating an extension
 * @param  {any} state the current state of atom
 */
export async function activate(state) {
  // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
  subscriptions = new CompositeDisposable();
  if (!datatipManager) datatipManager = new DataTipManager();
  subscriptions.add(datatipManager);

  // install package-deps if not loaded
  if (
    !(
      atom.packages.isPackageLoaded("atom-ide-markdown-service") &&
      atom.packages.isPackageLoaded("busy-signal")
    )
  ) {
    await install_deps();
  }

  datatipManager.initialize(renderer);
}

async function install_deps() {
  // Dynamic import https://mariusschulz.com/blog/dynamic-import-expressions-in-typescript
  import("atom-package-deps").then((atom_package_deps) => {
    atom_package_deps.install("atom-ide-datatip");
  });
}

/**
 * called by Atom when deactivating an extension
 */
export function deactivate() {
  if (subscriptions) {
    subscriptions.dispose();
  }
  subscriptions = null;
  datatipManager = null;
}

/**
 * called by IDE extensions to retrieve the Datatip service for registration
 * @return {AtomIDE.DatatipService} the current DataTipManager instance
 */
export function provideDatatipService() {
  return datatipManager.datatipService;
}

/**
 * retrieves a reference to the markdown rendering service that should be used
 * @param  {AtomIDE.MarkdownService} rendererIn the service for rendering markdown text
 */
export function consumeMarkdownRenderer(rendererIn) {
  renderer = rendererIn;
}

export const config = {
  showDataTipOnCursorMove: {
    title: 'Show datatip automatically on "cursor" stay',
    description:
      "If set to true, the data tip is shown as soon as you move your cursor stays on a word. Otherwise you will have to activate it via keypress.",
    type: "boolean",
    default: true,
  },
  showDataTipOnMouseMove: {
    title: 'Show datatip automatically on "mouse" hover',
    description:
      "If set to true, the data tip is shown as soon as mouse hovers on a word.",
    type: "boolean",
    default: false,
  },
  hoverTime: {
    title: "Hover/Stay Time",
    description:
      "The time that the mouse/cursor should hover/stay to show a datatip. Also specifies the time that the datatip is still shown when the mouse/cursor moves [ms].",
    type: "number",
    default: 200,
  },
};
