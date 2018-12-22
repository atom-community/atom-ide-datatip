// @ts-check

const { CompositeDisposable } = require('atom');

module.exports = class DisposableObject {
  constructor(object, disposeFunc) {
    this.subscription = new CompositeDisposable();
    this.subscription.add(object);
  }

  dispose() {
    if (this.subscription) {
      this.subscription.dispose();
    }
  }
}
