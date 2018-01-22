'use babel';

import SelectListView from 'atom-select-list';
import etch, { dom as $ } from 'etch';
import { CompositeDisposable } from 'atom';

export default class SchemeSelectView {
  constructor(props) {
    this.props = props;
    this.items = this.getItems();
    this.disposables = new CompositeDisposable();

    etch.initialize(this);

    this.initKeybindings();
    this.initQueryPlaceholder();
    this.selectCurrentScheme();
    this.markSavedScheme();
  }

  destroy() {
    this.disposables.dispose();
  }

  render() {
    return $(SelectListView, {
      ref: 'selectListView',
      itemsClassList: ['mark-active'],
      items: this.items,
      filterKeyForItem: (item) => item.name,
      elementForItem: this.elementForItem.bind(this),
      didChangeSelection: this.didChangeSelection.bind(this),
    });
  }

  update(props) {
    this.props = { ...this.props, ...props };
    this.markSavedScheme();
  }

  focus() {
    this.refs.selectListView.focus();
  }

  // HACK: Manually change .active class to avoid SelectListView issues
  markSavedScheme() {
    let { listItems, items } = this.refs.selectListView;

    // Remove the 'active' class from the previously marked item
    let activeItem = listItems.find(({ component }) => component.element.classList.contains('active'));
    if (activeItem) {
      activeItem.component.element.classList.remove('active');
    }

    // Add the 'active' class to the currently saved scheme item
    let savedItemIndex = items.findIndex(({ scheme }) => scheme === this.props.savedTheme.scheme);
    let newActiveItem = listItems[savedItemIndex];
    newActiveItem.component.element.classList.add('active');
  }

  // 'Enter' to confirm, 'escape' to cancel
  initKeybindings() {
    this.disposables.add(atom.commands.add(this.refs.selectListView.element, {
      'core:confirm': this.props.onConfirm,
      'core:cancel': this.props.onCancel,
      'core:close': this.props.onCancel,
    }));
  }

  initQueryPlaceholder() {
    let { selectListView } = this.refs;
    let { queryEditor } = selectListView.refs;
    queryEditor.setPlaceholderText('Find theme by name');
  }

  selectCurrentScheme(scheme) {
    let currentScheme = scheme || this.props.currentTheme.scheme;
    let currentSchemeIndex = this.items.findIndex((item) => item.scheme === currentScheme);

    this.enabled = false;
    this.refs.selectListView.selectIndex(currentSchemeIndex);
    this.enabled = true;
  }

  getItems() {
    let schemes = this.props.schemes;

    return schemes.map(({ value, description }) => ({
      scheme: value,
      name: description,
    }));
  }

  // SelectListView interface section
  elementForItem(item) {
    let element = document.createElement('li');
    element.textContent = item.name;
    return element;
  }

  didChangeSelection(item) {
    if (!this.enabled) return;
    if (!item) return;

    this.refs.selectListView.focus(); // immediately regain lost focus
    this.props.onDidChange(item.scheme);
  }
}
