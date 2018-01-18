const SelectListView = require('atom-select-list');

module.exports = class SelectThemeView {
  constructor(rainglow) {
    this.rainglow = rainglow;
    this.themes = this.getThemes();

    this.selectListView = new SelectListView({
      itemsClassList: ['mark-active'],
      items: this.themes,

      filterKeyForItem: (item) => item.name,

      elementForItem: (item, options) => {
        let element = document.createElement('li');

        if (item.current) {
          element.classList.add('active');
        }

        element.textContent = item.name;

        return element;
      },

      didChangeSelection: (theme) => {
        if (!theme) return;
        if (!this.available) return;

        this.rainglow.enableTheme(theme.scheme, theme.style, { preview: true });
      },

      didConfirmSelection: (theme) => {
        if (!this.available) return;

        this.rainglow.setThemeConfig(theme.scheme, theme.style);
        this.cancel();
      },

      didCancelSelection: () => {
        if (!this.available) return;

        this.rainglow.enableConfigTheme();
        this.cancel();
      },
    });
  }

  attach() {
    this.previouslyFocusedElement = document.activeElement;

    this.panel = atom.workspace.addModalPanel({ item: this.selectListView });

    let currentTheme = this.themes.find((theme) => theme.current);
    this.selectListView.selectItem(currentTheme);
    this.selectListView.focus();

    this.available = true;
  }

  cancel() {
    this.available = false;
    this.panel.destroy();

    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus();
    }
  }

  getThemes() {
    let schemes = atom.config.getSchema('rainglow.scheme').enum;
    let styles = atom.config.getSchema('rainglow.style').enum;
    let currentScheme = atom.config.get('rainglow.scheme');
    let currentStyle = atom.config.get('rainglow.style');

    let themes = [];

    for (let scheme of schemes) {
      for (let style of styles) {
        let item = {
          scheme: scheme.value,
          style: style.value,
          name: `${scheme.description} (${style.description})`,
        };

        if (scheme.value === currentScheme && style.value === currentStyle) {
          item.current = true;
        }

        themes.push(item);
      }
    }

    return themes;
  }
};
