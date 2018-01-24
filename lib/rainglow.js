'use babel';

import fs from 'fs';
import path from 'path';
import { CompositeDisposable } from 'atom';

import ThemePanelView from './theme-panel-view';

class Rainglow {
  activate() {
    this.migrateSettings();

    this.currentTheme = this.getSavedTheme();

    this.disposables = new CompositeDisposable(
      atom.config.onDidChange('rainglow.scheme', this.applySavedTheme.bind(this)),
      atom.config.onDidChange('rainglow.style', this.applySavedTheme.bind(this)),
      atom.commands.add('atom-workspace', 'rainglow:select-theme', this.toggle.bind(this)),
      atom.workspace.addOpener((uri) => {
        if (uri === 'atom://rainglow') return this.createThemePanelView();
      }),
    );
  }

  deactivate() {
    this.disposables.dispose();
  }

  createThemePanelView() {
    return this.selectThemeView = new ThemePanelView({
      schemes: atom.config.getSchema('rainglow.scheme').enum,
      currentTheme: this.currentTheme,
      savedTheme: this.getSavedTheme(),
      onDidPreview: (theme) => this.applyTheme(theme, true),
      onDidConfirm: () => this.setSavedTheme(),
      onDidCancel: () => this.applyTheme(this.getSavedTheme(), false),
    });
  }

  toggle() {
    atom.workspace.toggle('atom://rainglow');
  }

  getSavedTheme() {
    let { scheme, style } = atom.config.get('rainglow');
    return { scheme, style };
  }

  setSavedTheme() {
    let { scheme, style } = this.currentTheme;

    atom.config.transact(() => {
      atom.config.set('rainglow.scheme', scheme);
      atom.config.set('rainglow.style', style);
    });
  }

  applySavedTheme() {
    this.applyTheme(this.getSavedTheme(), false);
  }

  applyTheme(theme, preview) {
    theme = { ...this.currentTheme, ...theme };
    this.currentTheme = theme;

    if (this.selectThemeView) {
      this.selectThemeView.update({
        currentTheme: theme,
        savedTheme: this.getSavedTheme(),
      });
    }

    // Write the requested theme to the `syntax-variables` file.
    fs.writeFileSync(
      this.getSyntaxVariablesPath(),
      this.getSyntaxVariablesContent(theme.scheme, theme.style)
    );

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
    let schemeName = style === 'normal' ? scheme : `${scheme}-${style}`;

    return `
      @import '../themes/${schemeName}/index';
      @import '../themes/${schemeName}/syntax-variables';
    `;
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
      this.setSavedTheme(light[1], 'light');
    } else if (contrast) {
      this.setSavedTheme(contrast[1], 'contrast');
    } else {
      this.setSavedTheme(name, 'normal');
    }

    atom.config.unset('rainglow.SelectSyntax');
    this.applySavedTheme();
  }
}

export default new Rainglow();
