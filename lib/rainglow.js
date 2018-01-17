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
    this.migrateSettings();

    this.disposables = new CompositeDisposable();
    this.disposables.add(atom.config.onDidChange(`${packageName}.scheme`, () => this.enableConfigTheme()));
    this.disposables.add(atom.config.onDidChange(`${packageName}.style`, () => this.enableConfigTheme()));
    this.disposables.add(atom.commands.add('atom-workspace', `${packageName}:select-theme`, () => this.createSelectThemeView()));
  }

  deactivate() {
    this.disposables.dispose();
  }

  getSettings() {
    let scheme = atom.config.get(`${packageName}.scheme`);
    let style = atom.config.get(`${packageName}.style`);
    return { scheme, style };
  }

  enableConfigTheme() {
    let { scheme, style } = this.getSettings();
    this.enableTheme(scheme, style);
  }

  enableTheme(scheme, style, { preview } = {}) {
    // Write the requested theme to the `syntax-variables` file.
    fs.writeFileSync(this.getSyntaxVariablesPath(), this.getSyntaxVariablesContent(scheme, style));

    if (preview) {
      // Reload own stylesheets to apply the requested theme.
      atom.packages.getLoadedPackage(packageName).reloadStylesheets();
    } else {
      // Reload the stylesheets of all packages to apply the requested theme.
      atom.themes.reloadBaseStylesheets();

      for (let pack of atom.packages.getActivePackages()) {
        if (pack.getStylesheetPaths().length) {
          pack.reloadStylesheets();
        }
      }
    }
  }

  getSyntaxVariablesPath() {
    return path.join(__dirname, '..', 'styles', 'syntax-variables.less');
  }

  getSyntaxVariablesContent(scheme, style) {
    let schemeName = style === 'normal' ? `${scheme}` : `${scheme}-${style}`;

    return `
      @import '../themes/${schemeName}/index';
      @import '../themes/${schemeName}/syntax-variables';
    `;
  }

  setThemeConfig(scheme, style) {
    atom.config.transact(() => {
      atom.config.set(`${packageName}.scheme`, scheme);
      atom.config.set(`${packageName}.style`, style);
    });
  }

  createSelectThemeView() {
    let view = new SelectThemeView(this);
    view.attach();
  }

  migrateSettings() {
    let deprecatedSetting = atom.config.get(`${packageName}.SelectSyntax`);
    if (!deprecatedSetting) return;

    let match = deprecatedSetting.match(/(.+)(-colorblind)?-rainglow-syntax$/);
    if (!match) return;

    let name = match[1];
    let light = name.match(/(.+)-light$/);
    let contrast = name.match(/(.+)-contrast$/);

    if (light) {
      this.setThemeConfig(light[1], 'light');
    } else if (contrast) {
      this.setThemeConfig(contrast[1], 'contrast');
    } else {
      this.setThemeConfig(name, 'normal');
    }

    atom.config.unset(`${packageName}.SelectSyntax`);
    this.enableConfigTheme();
  }
};

module.exports = new Rainglow();
