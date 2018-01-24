'use babel';

import etch, { dom as $ } from 'etch';

import faCircle from '@fortawesome/fontawesome-free-regular/faCircle';
import faMoon from '@fortawesome/fontawesome-free-regular/faMoon';
import faSun from '@fortawesome/fontawesome-free-regular/faSun';

import StyleButton from './style-button';
import IconView from './icon-view';

const STYLES = [
  { name: 'normal', description: 'Normal', icon: faCircle },
  { name: 'contrast', description: 'Contrast', icon: faMoon },
  { name: 'light', description: 'Light', icon: faSun },
];

export default class StyleSelectView {
  constructor(props) {
    this.props = props;
    etch.initialize(this);
  }

  render() {
    let { current } = this.props;

    let buttons = STYLES.map(({ name, description, icon }) => (
      $(StyleButton, { name, description, current, onClick: this.changeStyle.bind(this) },
        $(IconView, { icon })
      )
    ));

    return (
      $.header({ className: 'btn-group' }, ...buttons)
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
