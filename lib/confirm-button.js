'use babel';

import etch, { dom as $ } from 'etch';

export default class ConfirmButton {
  constructor(props) {
    this.props = { loading: false, ...props };
    etch.initialize(this);
  }

  render() {
    let spinner = '';
    if (this.props.loading) {
      spinner = $.span({ className: 'loading loading-spinner-tiny inline-block' });
    }

    return (
      $.button({
        className: 'btn btn-primary',
        disabled: this.props.loading,
        onclick: this.props.onClick
      }, spinner, 'Confirm')
    );
  }

  update(props) {
    this.props = { ...this.props, ...props };
    return etch.update(this);
  }

  async withSpinner(callback) {
    await this.update({ loading: true });

    setTimeout(async () => {
      await callback();
      await this.update({ loading: false });
    }, 1);
  }
}
