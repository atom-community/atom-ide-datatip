import { CompositeDisposable } from "atom"
import { DataTipManager } from "./datatip-manager"
import type { DatatipService } from "atom-ide-base"

export { default as config } from "./config.json"

/** [subscriptions description] */
const subscriptions: CompositeDisposable = new CompositeDisposable()
/** [datatipManager description] */
let datatipManager: DataTipManager | undefined

/** Called by Atom when activating an extension */
export function activate() {
  // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
  if (datatipManager === undefined) {
    datatipManager = new DataTipManager()
  }
  subscriptions.add(datatipManager)

  install_deps()
    .then(() => {
      datatipManager!.initialize()
    })
    .catch((e) => {
      console.error(e)
    })
}

async function install_deps() {
  // install package-deps if not loaded
  if (!atom.packages.isPackageLoaded("busy-signal")) {
    // Dynamic import https://mariusschulz.com/blog/dynamic-import-expressions-in-typescript
    const atom_package_deps = await import("atom-package-deps")
    try {
      await atom_package_deps.install("atom-ide-datatip", true)
    } catch (err) {
      atom.notifications.addError(err)
    }
  }
}

/** Called by Atom when deactivating an extension */
export function deactivate() {
  subscriptions.dispose()
}

/**
 * Called by IDE extensions to retrieve the Datatip service for registration
 *
 * @returns The current DataTipManager instance
 */
export function provideDatatipService(): DatatipService {
  return datatipManager!.datatipService
}
