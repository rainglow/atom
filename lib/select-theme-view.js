'use babel';

import SelectListView from 'atom-select-list';
import etch, { dom as $ } from 'etch';
import { Disposable, CompositeDisposable } from 'atom';
import ConfirmButton from './confirm-button';

export default class SelectThemeView {
  constructor(rainglow) {
    this.rainglow = rainglow;
    this.themes = this.getThemes();
    this.disposables = new CompositeDisposable();

    etch.initialize(this);

    this.initKeybindings();
    this.initFocus();
    this.initQueryPlaceholder();

    // Each time the panel is toggled open
    atom.workspace.onDidOpen(({ uri }) => {
      if (uri !== 'atom://rainglow') return;

      // Avoid unnecessary theme refresh after selection
      this.enabled = false;
      this.selectActiveItem();
      this.enabled = true;
    });

    this.selectedTheme = this.rainglow.getSettings();
    this.enabled = true;
  }

  destroy() {
    this.disposables.dispose();
  }

  render() {
    return (
      $.div({ tabIndex: -1, className: 'padded rainglow-panel' },
        $(SelectListView, {
          ref: 'selectListView',
          itemsClassList: ['mark-active'],
          items: this.themes,
          filterKeyForItem: (item) => item.name,
          elementForItem: this.elementForItem.bind(this),
          didChangeSelection: this.didChangeSelection.bind(this),
        }),
        $.footer({ className: 'btn-toolbar' },
          $(ConfirmButton, { ref: 'confirmButton', onclick: this.confirm.bind(this) }),
          $.button({ className: 'btn', onclick: this.cancel.bind(this) }, 'Cancel')
        )
      )
    );
  }

  // Always focus query input
  initFocus() {
    let focusCallback = () => this.refs.selectListView.focus();
    this.element.addEventListener('focus', focusCallback);
    this.disposables.add(new Disposable(() => this.element.removeEventListener('focus', focusCallback)));
    this.element.focus();
  }

  // 'Enter' to confirm, 'escape' to cancel
  initKeybindings() {
    this.disposables.add(atom.commands.add(this.refs.selectListView.element, {
      'core:confirm': () => this.refs.confirmButton.onClick(),
      'core:cancel': () => this.cancel(),
      'core:close': () => this.cancel(),
    }));
  }

  initQueryPlaceholder() {
    let { selectListView } = this.refs;
    let { queryEditor } = selectListView.refs;
    queryEditor.setPlaceholderText('Find theme by name');
  }

  selectActiveItem() {
    let currentTheme = this.themes.find((theme) => theme.current);
    this.refs.selectListView.selectItem(currentTheme);
  }

  confirm() {
    let { scheme, style } = this.selectedTheme;
    this.rainglow.setThemeConfig(scheme, style);

    this.themes = this.getThemes();
    this.enabled = false;
    etch.update(this);
    this.false = false;

    atom.workspace.hide('atom://rainglow');
  }

  cancel() {
    this.rainglow.enableConfigTheme();
    atom.workspace.hide('atom://rainglow');
  }

  // SelectListView interface section
  elementForItem(item) {
    let element = document.createElement('li');
    element.textContent = item.name;

    if (item.current) {
      element.classList.add('active');
    }

    return element;
  }

  didChangeSelection(theme) {
    if (!this.enabled) return;
    if (!theme) return;

    this.refs.selectListView.focus();

    this.selectedTheme = theme;
    this.rainglow.enableTheme(theme.scheme, theme.style, { preview: true });
  }

  // Atom panel interface section
  update() {}

  getTitle() {
    return 'Rainglow';
  }

  getIconName() {
    return 'paintcan';
  }

  getURI() {
    return 'atom://rainglow';
  }

  getPreferredWidth() {
    return 360;
  }

  getAllowedLocations() {
    return ['left', 'right'];
  }

  getDefaultLocation() {
    return 'right';
  }

  // to be changed
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
}
