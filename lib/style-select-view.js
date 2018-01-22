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
  }

  render() {
    let className = 'btn';
    if (this.props.selected) {
      className += ' selected';
    }

    return (
      $.button({ className, onclick: this.props.onclick },
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
    return (
      $.header({ className: 'btn-group' },
        $(StyleButton, { selected: this.props.current === 'normal', onclick: () => this.changeStyle('normal') },
          $(IconView, { icon: faCircle })
        ),
        $(StyleButton, { selected: this.props.current === 'contrast', onclick: () => this.changeStyle('contrast') },
          $(IconView, { icon: faMoon })
        ),
        $(StyleButton, { selected: this.props.current === 'light', onclick: () => this.changeStyle('light') },
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
