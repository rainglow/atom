'use babel';

import etch, { dom as $ } from 'etch';

import faCircle from '@fortawesome/fontawesome-free-regular/faCircle';
import faMoon from '@fortawesome/fontawesome-free-regular/faMoon';
import faSun from '@fortawesome/fontawesome-free-regular/faSun';

import StyleButton from './style-button';
import IconView from './icon-view';

export default class StyleSelectView {
  constructor(props) {
    this.props = props;
    etch.initialize(this);
  }

  render() {
    let { current } = this.props;

    return (
      $.header({ className: 'btn-group' },
        $(StyleButton, { name: 'normal', current, onClick: this.changeStyle.bind(this) },
          $(IconView, { icon: faCircle })
        ),
        $(StyleButton, { name: 'contrast', current, onClick: this.changeStyle.bind(this) },
          $(IconView, { icon: faMoon })
        ),
        $(StyleButton, { name: 'light', current, onClick: this.changeStyle.bind(this) },
          $(IconView, { icon: faSun })
        )
      )
    );
  }

  update(props = {}) {
    this.props = { ...this.props, ...props };
    etch.update(this);
  }

  changeStyle(style) {
    this.props.current = style;
    this.update();
    this.props.onDidChange(style);
  }
}
