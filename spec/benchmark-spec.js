describe("atom-ide-datatip Benchmark", () => {

  // This number doesn't match what timecope gives, but shows the trend
  it("Activation Benchmark", async function() {
    jasmine.attachToDOM(atom.views.getView(atom.workspace));
    atom.packages.triggerDeferredActivationHooks();
    // Activate activation hook
    atom.packages.triggerActivationHook('core:loaded-shell-environment');
    // Activate package-deps
    await atom.packages.activatePackage("busy-signal");
    await atom.packages.activatePackage("atom-ide-markdown-service");
    measure("Activation Time", async function activationBenchmark() {
      await atom.packages.activatePackage("atom-ide-datatip");
    })

    expect(atom.packages.isPackageLoaded("atom-ide-datatip")).toBeTruthy();
  })
})
