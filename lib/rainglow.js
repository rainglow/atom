const fs = require('fs');
const path = require('path');
const { CompositeDisposable } = require('atom');

const SelectThemeView = require('./select-theme-view');
const packageName = require('../package.json').name;
const config = require('./config');

class Rainglow {
  constructor() {
    this.packageName = packageName;
    this.config = config;
  }

  activate() {
    this.disposables = new CompositeDisposable();
    this.disposables.add(atom.config.observe(`${packageName}.scheme`, () => this.enableConfigTheme()));
    this.disposables.add(atom.config.observe(`${packageName}.style`, () => this.enableConfigTheme()));
    this.disposables.add(atom.commands.add('atom-workspace', `${packageName}:select-theme`, () => this.createSelectThemeView()));
  }

  deactivate() {
    this.disposables.dispose();
  }

  enableConfigTheme() {
    let scheme = atom.config.get(`${packageName}.scheme`);
    let style = atom.config.get(`${packageName}.style`);
    this.enableTheme(scheme, style);
  }

  enableTheme(scheme, style, { preview } = {}) {
    // No need to enable the theme if it is already active.
    if (this.isActiveTheme(scheme, style)) return;

    try {
      // Write the requested theme to the `syntax-variables` file.
      fs.writeFileSync(this.getSyntaxVariablesPath(), this.getSyntaxVariablesContent(scheme, style));
      let activePackages = atom.packages.getActivePackages();

      if (preview) {
        // Reload own stylesheets to apply the requested theme.
        atom.packages.getLoadedPackage(packageName).reloadStylesheets();
      } else {
        // Reload the stylesheets of all packages to apply the requested theme.
        for (let activePackage of activePackages) {
          activePackage.reloadStylesheets();
        }
      }

      this.activeScheme = scheme;
      this.activeStyle = style;
    } catch(e) {
      // If unsuccessfull enable the default theme.
      this.enableDefaultTheme();
    }
  }

  isActiveTheme(scheme, style) {
    return scheme === this.activeScheme && style === this.activeStyle;
  }

  getSyntaxVariablesPath() {
    return path.join(__dirname, '..', 'styles', 'syntax-variables.less');
  }

  getSyntaxVariablesContent(scheme, style) {
    let schemeName = style === 'standard' ? `${scheme}-rainglow-syntax` : `${scheme}-${style}-rainglow-syntax`;

    return `
      @import '../themes/${schemeName}/index';
      @import '../themes/${schemeName}/styles/syntax-variables';
    `;
  }

  enableDefaultTheme() {
    let scheme = atom.config.getDefault(`${packageName}.scheme`);
    let style = atom.config.getDefault(`${packageName}.style`);
    this.setThemeConfig(scheme, style);
  }

  setThemeConfig(scheme, style) {
    atom.config.set(`${packageName}.scheme`, scheme);
    atom.config.set(`${packageName}.style`, style);
  }

  createSelectThemeView() {
    let view = new SelectThemeView(this);
    view.attach();
  }

  isConfigTheme(scheme, style) {
    let configScheme = atom.config.get(`${packageName}.scheme`);
    let configStyle = atom.config.get(`${packageName}.style`);

    return scheme === configScheme && style === configStyle;
  }
};

module.exports = new Rainglow();
