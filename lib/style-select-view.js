'use babel';

import etch, { dom as $ } from 'etch';

import faCircle from '@fortawesome/fontawesome-free-regular/faCircle';
import faMoon from '@fortawesome/fontawesome-free-regular/faMoon';
import faSun from '@fortawesome/fontawesome-free-regular/faSun';

import IconView from './icon-view';

class StyleButton {
  constructor(props, ...children) {
    this.props = props;
    this.children = children;
    etch.initialize(this);

    atom.tooltips.add(this.refs.button, {
      title: this.props.name,
      placement: 'bottom',
    });
  }

  render() {
    let { name, current, onclick } = this.props;

    let className = 'btn';
    if (current == name) {
      className += ' selected';
    }

    return (
      $.button({ ref: 'button', className, onclick: () => onclick(name) },
        ...this.children
      )
    );
  }

  update(props) {
    this.props = props;
    etch.update(this);
  }
}

export default class StyleSelectView {
  constructor(props) {
    this.props = props;
    etch.initialize(this);
  }

  render() {
    let { current } = this.props;

    return (
      $.header({ className: 'btn-group' },
        $(StyleButton, { name: 'normal', current, onclick: this.changeStyle.bind(this) },
          $(IconView, { icon: faCircle })
        ),
        $(StyleButton, { name: 'contrast', current, onclick: this.changeStyle.bind(this) },
          $(IconView, { icon: faMoon })
        ),
        $(StyleButton, { name: 'light', current, onclick: this.changeStyle.bind(this) },
          $(IconView, { icon: faSun })
        )
      )
    );
  }

  update() {
    etch.update(this);
  }

  changeStyle(style) {
    this.props.current = style;
    this.update();
    this.props.onDidChange(style);
  }
}
