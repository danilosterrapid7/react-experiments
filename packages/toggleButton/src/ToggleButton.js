import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid/v4';
import If from 'daniloster-if';

import styles from './ToggleButton.scss';

/**
 * Button that switches between checked and unchecked.
 * E.g.
 * ```js
 * class Example extends Component {
 *   state = {
 *     isLightOn: false,
 *   }
 *
 *   toggle = () => {
 *     this.setState(({ isLightOn }) => {
 *       return { isLightOn: !isLightOn };
 *     })
 *   }
 *
 *   render() {
 *     return (
 *       <ToggleButton
 *         onChange={this.toggle}
 *         isChecked={this.state.isLightOn}
 *       >Lights?</ToggleButton>
 *     );
 *   }
 * }
 *
 * // ...
 *
 * <Example />
 * ```
 */
class ToggleButton extends PureComponent {
  componentWillMount() {
    this.labelID = uuid();
    this.uniqueID = uuid();
  }

  onToggle = () => {
    const { isChecked, onChange } = this.props;
    onChange(!isChecked);
  };

  render() {
    const { className, children, nodeOn, nodeOff, isChecked } = this.props;
    const classNameComposed = [styles.toggleButton, className].join(' ');

    return (
      <div className={classNameComposed}>
        <If expression={!!children}>
          <label id={this.labelID} htmlFor={this.uniqueID}>
            {children}
          </label>
        </If>
        <button
          id={this.uniqueID}
          aria-labelledby={this.labelID}
          aria-checked={isChecked}
          role="switch"
          onClick={this.onToggle}
          title={isChecked ? nodeOn : nodeOff}
        />
      </div>
    );
  }
}

ToggleButton.defaultProps = {
  className: '',
  children: null,
  nodeOn: 'On',
  nodeOff: 'Off',
};

ToggleButton.propTypes = {
  /**
   * className applied to the container element in order to change styles from outer world.
   */
  className: PropTypes.string,
  /**
   * It is the label representative for the element.
   */
  children: PropTypes.node,
  /**
   * It is the representative element for checked.
   */
  nodeOn: PropTypes.node,
  /**
   * It is the representative element for unchecked.
   */
  nodeOff: PropTypes.node,
  /**
   * It is the event handler for toggling.
   */
  onChange: PropTypes.func.isRequired,
  /**
   * It is the value for checked/unchecked representation.
   */
  isChecked: PropTypes.bool.isRequired,
};

export default ToggleButton;
