import React, {PureComponent, PropTypes} from 'react'
import CSSModules from 'react-css-modules'

import style from './button-item.css'

@CSSModules(style)
export default class ButtonItem extends PureComponent {
  static propTypes = {
    icon: PropTypes.string,
    hidden: PropTypes.bool,
    disabled: PropTypes.bool,
    action: PropTypes.func,
    children: PropTypes.node
  }

  onAction = (event) => {
    const {hidden, disabled, action} = this.props
    if (!hidden && !disabled && action) {
      action()
    }
  }

  render() {
    const {icon, hidden, disabled} = this.props
    return !hidden && (
      <button styleName='button' disabled={disabled} onClick={this.onAction}>
        <i className={`fa fa-${icon}`}/>
        {this.props.children}
      </button>
    )
  }
}
