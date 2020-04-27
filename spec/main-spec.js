describe("atom-ide-datatip tests", () => {

  beforeEach(async () => {
    jasmine.attachToDOM(atom.views.getView(atom.workspace))

    /*    Activation     */
    // Trigger deffered activation
    atom.packages.triggerDeferredActivationHooks();
    // Activate activation hook
    atom.packages.triggerActivationHook('core:loaded-shell-environment');
    // Activate package-deps
    await atom.packages.activatePackage("busy-signal")
    await atom.packages.activatePackage("atom-ide-markdown-service")
    // Activate atom-ide-datatip
    await atom.packages.activatePackage("atom-ide-datatip");
  })

  it("Activation", async function() {
    expect(atom.packages.isPackageLoaded("atom-ide-datatip")).toBeTruthy();
  })
})
