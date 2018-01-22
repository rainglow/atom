'use babel';

import etch, { dom as $ } from 'etch';
import { Disposable, CompositeDisposable } from 'atom';

import ConfirmButton from './confirm-button';
import StyleSelectView from './style-select-view';
import SchemeSelectView from './scheme-select-view';

export default class ThemePanelView {
  constructor(props) {
    this.props = props;
    this.disposables = new CompositeDisposable();

    etch.initialize(this);
    this.initFocus();

    atom.workspace.onDidOpen(({ uri }) => {
      if (uri !== 'atom://rainglow') return;
      let pane = atom.workspace.paneForURI('atom://rainglow');

      // When the panel is being closed
      this.disposables.add(pane.onDidRemoveItem(this.cancel.bind(this)));
    });
  }

  destroy() {
    this.disposables.dispose();
  }

  render() {
    return (
      $.div({ tabIndex: -1, className: 'padded rainglow-panel' },
        $(StyleSelectView, {
          current: this.props.currentTheme.style,
          onDidChange: (style) => this.props.onDidPreview({ style }),
        }),
        $(SchemeSelectView, {
          ref: 'schemeSelectView',
          schemes: this.props.schemes,
          savedTheme: this.props.savedTheme,
          currentTheme: this.props.currentTheme,
          onDidChange: (scheme) => this.props.onDidPreview({ scheme }),
          onConfirm: this.confirm.bind(this),
          onCancel: this.cancel.bind(this),
        }),
        $.footer({ className: 'btn-toolbar' },
          $(ConfirmButton, {
            ref: 'confirmButton',
            onClick: this.confirm.bind(this),
          }),
          $.button({
            className: 'btn',
            onclick: this.cancel.bind(this),
          }, 'Cancel')
        )
      )
    );
  }

  update(props) {
    this.props = {...this.props, ...props};
    etch.update(this);
  }

  // Always focus query input
  initFocus() {
    let focusCallback = () => this.refs.schemeSelectView.focus();
    this.element.addEventListener('focus', focusCallback);
    this.disposables.add(new Disposable(() =>
      this.element.removeEventListener('focus', focusCallback)
    ));
    this.element.focus();
  }

  confirm() {
    this.refs.confirmButton.withSpinner(() => {
      this.props.onDidConfirm();
      this.update();
      atom.workspace.hide('atom://rainglow');
    });
  }

  cancel() {
    this.props.onDidCancel();
    this.refs.schemeSelectView.selectCurrentScheme(this.props.currentTheme.scheme);
    atom.workspace.hide('atom://rainglow');
  }

  // Atom panel interface section
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
    return 210;
  }

  getAllowedLocations() {
    return ['left', 'right'];
  }

  getDefaultLocation() {
    return 'right';
  }
}
