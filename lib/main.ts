// @ts-check

import { CompositeDisposable } from "atom"
import { DataTipManager } from "./datatip-manager"
import type { DatatipService } from "atom-ide-base"

export { default as config } from "./config.json"

/**
 * [subscriptions description]
 */
let subscriptions: CompositeDisposable
/**
 * [datatipManager description]
 */
let datatipManager: DataTipManager

/**
 * called by Atom when activating an extension
 */
export async function activate() {
  // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
  subscriptions = new CompositeDisposable()
  if (!datatipManager) datatipManager = new DataTipManager()
  subscriptions.add(datatipManager)

  install_deps().then(() => {
    datatipManager.initialize()
  })
}

async function install_deps() {
  // install package-deps if not loaded
  if (!atom.packages.isPackageLoaded("busy-signal")) {
    // Dynamic import https://mariusschulz.com/blog/dynamic-import-expressions-in-typescript
    // @ts-ignore
    await import("atom-package-deps").then((atom_package_deps) => {
      atom_package_deps.install("atom-ide-datatip", true)
    })
  }
}

/**
 * called by Atom when deactivating an extension
 */
export function deactivate() {
  if (subscriptions) {
    subscriptions.dispose()
  }
}

/**
 * called by IDE extensions to retrieve the Datatip service for registration
 * @return the current DataTipManager instance
 */
export function provideDatatipService(): DatatipService {
  return datatipManager!.datatipService
}
