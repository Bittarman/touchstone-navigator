import React, { Component, PropTypes } from 'react';
import { Container, UI } from 'touchstonejs';

import TouchstoneNavigatorViews from './TouchstoneNavigatorViews';

class TouchstoneNavigator extends Component {
  shouldComponentUpdate(nextProps) {
    if (nextProps.className !== this.props.className) { return true; }
    if (nextProps.showNavigationBar !== this.props.showNavigationBar) { return true; }

    return false;
  }

  onViewChange(view, transition) {
    const { navigator } = view.props;
    const navigationBarView = navigator.view || view;
    const { getNavigation } = navigationBarView;

    if (!this.props.showNavigationBar || !getNavigation) { return; }

    const { navigationBar } = this.refs;

    const canGoBack = navigator.canGoBack();
    const viewNavigation = getNavigation.call(navigationBarView);

    navigationBar.updateWithTransition({
      leftAction: () => navigator.pop(),
      leftArrow: canGoBack,
      leftLabel: canGoBack ? viewNavigation.backLabel : void 0,

      ...viewNavigation,
    }, transition);
  }

  render() {
    const { className, name, showNavigationBar } = this.props;

    return (
      <Container fill direction="column" className={className}>
        {showNavigationBar && <UI.NavigationBar ref="navigationBar" name={name} />}
        <TouchstoneNavigatorViews ref="navigator" onViewChange={this.onViewChange} {...this.props} />
      </Container>
    );
  }

  constructor() {
    super(...arguments);
    this.onViewChange = this.onViewChange.bind(this);
  }
}

TouchstoneNavigator.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
  rootViewController: PropTypes.shape({
    component: PropTypes.func.isRequired,
    props: PropTypes.object,
  }).isRequired,
  showNavigationBar: PropTypes.bool,
};

TouchstoneNavigator.defaultProps = {
  showNavigationBar: true,
};

export default TouchstoneNavigator;
