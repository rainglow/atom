'use babel';

import fontawesome from '@fortawesome/fontawesome';

export default class IconView {
  constructor({ icon }) {
    fontawesome.library.add(icon);

    let { node } = fontawesome.icon(icon);
    this.element = node[0];
  }

  update() {}
}
