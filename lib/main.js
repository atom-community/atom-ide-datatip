'use babel';

const { CompositeDisposable } = require('atom');
const DataTipManager =  require('./datatip-manager');

module.exports = {

  /**
   * [subscriptions description]
   * @type {CompositeDisposable}
   */
  subscriptions: null,
  /**
   * [datatipManager description]
   * @type {DataTipManager}
   */
  datatipManager: null,

  /**
   * [renderer description]
   * @type {[type]}
   */
  renderer: null,

  /**
   * called by Atom when activating an extension
   * @param  {[type]} state [description]
   */
  activate(state) {

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    if (!this.datatipManager) this.datatipManager = new DataTipManager();
    this.subscriptions.add(this.datatipManager);

    require('atom-package-deps').install('atom-ide-datatip').then(() => {
      this.datatipManager.initialize(this.renderer);
    });
  },

  /**
   * called by Atom when deactivating an extension
   */
  deactivate() {
    if (this.subscriptions) {
      this.subscriptions.dispose();
    }
    this.subscriptions = null;
    this.datatipManager = null;
  },

  /**
   * called by IDE extensions to retrieve the Datatip service for registration
   * @return {DataTipManager} the current DataTipManager instance
   */
  provideDatatipService() {
    return this.datatipManager;
  },

  consumeMarkdownRenderer(renderer) {
    this.renderer = renderer;
  }
};
