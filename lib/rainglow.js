'use babel';

import fs from 'fs';
import path from 'path';
import { CompositeDisposable } from 'atom';

import SelectThemeView from './select-theme-view';
import config from './config';

class Rainglow {
  constructor() {
    this.config = config;
  }

  activate() {
    this.migrateSettings();

    this.disposables = new CompositeDisposable(
      atom.config.onDidChange('rainglow.scheme', () => this.enableConfigTheme()),
      atom.config.onDidChange('rainglow.style', () => this.enableConfigTheme()),
      atom.commands.add('atom-workspace', 'rainglow:select-theme', () => this.toggle()),
      atom.workspace.addOpener((uri) => {
        if (uri === 'atom://rainglow') return new SelectThemeView(this);
      }),
    );
  }

  deactivate() {
    this.disposables.dispose();
  }

  toggle() {
    atom.workspace.toggle('atom://rainglow');
  }

  getSettings() {
    let { scheme, style } = atom.config.get('rainglow');
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
      atom.packages.getLoadedPackage('rainglow').reloadStylesheets();
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
      atom.config.set('rainglow.scheme', scheme);
      atom.config.set('rainglow.style', style);
    });
  }

  migrateSettings() {
    let deprecatedSetting = atom.config.get('rainglow.SelectSyntax');
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

    atom.config.unset('rainglow.SelectSyntax');
    this.enableConfigTheme();
  }
}

export default new Rainglow();
