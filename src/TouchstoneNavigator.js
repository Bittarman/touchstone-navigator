import React, { Component, PropTypes } from 'react';
import { Container, UI } from 'touchstonejs';

import TouchstoneNavigatorViews from './TouchstoneNavigatorViews';

class TouchstoneNavigator extends Component {
  onViewChange(view, transition) {
    if (!view.getNavigation) { return; }

    const { navigationBar } = this.refs;
    const { navigator } = view.props;

    const canGoBack = navigator.canGoBack();
    const viewNavigation = view.getNavigation();

    navigationBar.updateWithTransition({
      leftAction: () => navigator.pop(),
      leftArrow: canGoBack,
      leftLabel: canGoBack ? viewNavigation.backLabel : void 0,

      ...viewNavigation,
    }, transition);
  }

  render() {
    const { name } = this.props;

    return (
      <Container fill direction="column">
        <UI.NavigationBar ref="navigationBar" name={name} />
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
  name: PropTypes.string.isRequired,
  rootViewController: PropTypes.shape({
    component: PropTypes.object.isRequired,
    props: PropTypes.object,
  }).isRequired,
};

export default TouchstoneNavigator;
