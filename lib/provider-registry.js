// @ts-check

const { CompositeDisposable } = require('atom');
const DisposableObject = require('./disposable-object');

module.exports = class ProviderRegistry {
  constructor() {
    this.providers = [];
  }

  addProvider(provider) {
    const index = this.providers.findIndex(
      p => provider.priority > p.priority,
    );
    if (index === -1) {
      this.providers.push(provider);
    } else {
      this.providers.splice(index, 0, provider);
    }
    console.log(this.providers);
    return new DisposableObject({
      dispose() {
        this.removeProvider(provider);
      }
    });
  }

  removeProvider(provider) {
    const index = this.providers.indexOf(provider);
    if (index !== -1) {
      this.providers.splice(index, 1);
    }
  }
}
