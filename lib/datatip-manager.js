// @ts-check
'use babel';

const { CompositeDisposable, Disposable, Point, Range } = require('atom');
const ProviderRegistry = require('./provider-registry');

module.exports = class DatatipManager {

  constructor() {
    this.subscriptions = null;
    this.providerRegistry = null;
  }

  initialize() {
    this.subscriptions = new CompositeDisposable();
    this.providerRegistry = new ProviderRegistry();
  }

  dispose() {
    if (this.subscriptions) {
      this.subscriptions.dispose();
    }
    this.subscriptions = null;
  }

  addProvider (provider) {
    return this.providerRegistry.addProvider(provider);
  }
}
