'use babel';

import etch, { dom as $ } from 'etch';
import { CompositeDisposable } from 'atom';
import cx from 'classnames';

export default class StyleButton {
  constructor(props, ...children) {
    this.props = props;
    this.children = children;
    this.disposables = new CompositeDisposable();
    etch.initialize(this);

    this.disposables.add(atom.tooltips.add(this.refs.button, {
      title: this.props.name,
      placement: 'bottom',
    }));
  }

  destroy() {
    this.disposables.dispose();
  }

  render() {
    let { name, current, onClick } = this.props;

    return (
      $.button({
        ref: 'button',
        className: cx('btn', { selected: current === name }),
        onclick: () => onClick(name),
      }, ...this.children)
    );
  }

  update(props = {}) {
    this.props = { ...this.props, ...props };
    etch.update(this);
  }
}
