// @ts-check
'use babel';

const { CompositeDisposable } = require('atom');
const DataTipManager =  require('./datatip-manager');

module.exports = {

  subscriptions: null,
  datatipManager: null,

  activate(state) {

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    if (!this.datatipManager) this.datatipManager = new DataTipManager();
    this.subscriptions.add(this.datatipManager);
    this.datatipManager.initialize();
  },

  deactivate() {
    if (this.subscriptions) {
      this.subscriptions.dispose();
    }
    this.subscriptions = null;
    this.datatipManager = null;
  },

  provideDatatipService() {
      return this.datatipManager;
  }

};
