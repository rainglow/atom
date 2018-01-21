'use babel';

import SelectListView from 'atom-select-list';
import etch, { dom as $ } from 'etch';
import { Disposable, CompositeDisposable } from 'atom';

import faCircle from '@fortawesome/fontawesome-free-regular/faCircle';
import faMoon from '@fortawesome/fontawesome-free-regular/faMoon';
import faSun from '@fortawesome/fontawesome-free-regular/faSun';

import ConfirmButton from './confirm-button';
import IconView from './icon-view';

export default class SelectThemeView {
  constructor(rainglow) {
    this.rainglow = rainglow;
    this.schemes = this.getSchemes();
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
        $.header({ className: 'btn-group' },
          $.button({ className: 'btn', onclick: () => this.changeStyle('normal') },
            $(IconView, { icon: faCircle })
          ),
          $.button({ className: 'btn', onclick: () => this.changeStyle('contrast') },
            $(IconView, { icon: faMoon })
          ),
          $.button({ className: 'btn', onclick: () => this.changeStyle('light') },
            $(IconView, { icon: faSun })
          )
        ),
        $(SelectListView, {
          ref: 'selectListView',
          itemsClassList: ['mark-active'],
          items: this.schemes,
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
    let currentScheme = this.schemes.find((scheme) => scheme.current);
    this.refs.selectListView.selectItem(currentScheme);
  }

  confirm() {
    let { scheme, style } = this.selectedTheme;
    this.rainglow.setThemeConfig(scheme, style);

    this.schemes = this.getSchemes();
    this.enabled = false;
    etch.update(this);
    this.false = false;

    atom.workspace.hide('atom://rainglow');
  }

  cancel() {
    this.rainglow.enableConfigTheme();
    atom.workspace.hide('atom://rainglow');
  }

  changeStyle(style) {
    this.selectedTheme.style = style;
    this.rainglow.enableTheme(this.selectedTheme.scheme, style, { preview: true });
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

  didChangeSelection(item) {
    if (!this.enabled) return;
    if (!item) return;

    this.refs.selectListView.focus();

    this.selectedTheme.scheme = item.scheme;
    this.rainglow.enableTheme(item.scheme, this.selectedTheme.style, { preview: true });
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
    return 430;
  }

  getAllowedLocations() {
    return ['left', 'right'];
  }

  getDefaultLocation() {
    return 'right';
  }

  getStyles() {
    // let styles = atom.config.getSchema('rainglow.style').enum;
    // let current = atom.config.get('rainglow.style');
  }

  getSchemes() {
    let schemes = atom.config.getSchema('rainglow.scheme').enum;
    let current = atom.config.get('rainglow.scheme');

    return schemes.map(({ value, description }) => ({
      scheme: value,
      name: description,
      current: value === current,
    }));
  }
}
