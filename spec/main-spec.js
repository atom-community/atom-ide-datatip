describe("atom-ide-datatip", () => {

    beforeEach(async () => {
        jasmine.attachToDOM(atom.views.getView(atom.workspace))
        // Activate activation hook
        atom.packages.triggerActivationHook('core:loaded-shell-environment');
        atom.packages.triggerDeferredActivationHooks();
        // Activate package-deps
        await atom.packages.activatePackage("busy-signal")
        await atom.packages.activatePackage("atom-ide-markdown-service")
    })

    it("Activation", async function () {

        // This makes the log visible again from the command line.
        spyOn(console, 'log').and.callThrough();

        console.log("\n Activation Started")
        measure("Activation Time", async function activationBenchmark() {
            await atom.packages.activatePackage("atom-ide-datatip")
        })
        expect(atom.packages.isPackageLoaded("atom-ide-datatip")).toBeTruthy()

        console.log("\n Finished")
    })
})
