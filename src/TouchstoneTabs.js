import React, { Component, PropTypes } from 'react';
import { Container, UI, View, ViewManager } from 'touchstonejs';

import _ from 'lodash';

import prepareViewController from './utils/prepareViewController';

class TouchstoneTabs extends Component {
  getViewController(id) {
    return _.find(this.state.viewControllers, { id });
  }

  renderTabs() {
    const { viewControllers } = this.state;

    return (
      <UI.Tabs.Navigator>
        {viewControllers.map(({ id, tab }, i) => {
          return (
            <UI.Tabs.Tab
              key={id}
              onTap={() => this.setSelectedIndex(i)}
              selected={this.state.selectedIndex === i}>
              {tab}
            </UI.Tabs.Tab>
          );
        })}
      </UI.Tabs.Navigator>
    );
  }

  render() {
    const { name, position } = this.props;
    const { selectedIndex, viewControllers } = this.state;

    return (
      <Container fill direction="column">
        {position === 'top' && this.renderTabs()}

        <ViewManager
          ref="viewManager"
          name={name}
          defaultView={viewControllers[selectedIndex].id}>
          {viewControllers.map(({ id, component, props, savedState, scrollable }) => (
            <View
              key={id}
              name={id}
              component={component}

              {...props}
              initialState={savedState}
              scrollable={scrollable}
              tabinator={this._createPropsTabinator(id)} />
          ))}
        </ViewManager>

        {position === 'bottom' && this.renderTabs()}
      </Container>
    );
  }

  setSelectedIndex(index) {
    const { viewControllers } = this.state;

    const selectedViewController = viewControllers[index];
    const { id, props, savedState, scrollable } = selectedViewController;

    this.refs.viewManager.transitionTo(id, {
      transition: 'instant',
      viewProps: {
        ...props,
        initialState: savedState,
        scrollable,
        tabinator: this._createPropsTabinator(id),
      },
    });

    this.setState({ selectedIndex: index });
  }

  _createPropsTabinator(viewControllerId) {
    return {
      saveState: (state) => {
        const viewController = this.getViewController(viewControllerId);
        if (viewController) { viewController.savedState = { ...state }; }
      },
    };
  }

  constructor(props) {
    super(...arguments);

    this.state = {
      selectedIndex: 0,
      viewControllers: props.viewControllers.map((vc) => prepareViewController(vc)),
      ...props.initialState,
    };
  }
}

TouchstoneTabs.propTypes = {
  name: PropTypes.string.isRequired,
  position: PropTypes.oneOf([ 'top', 'bottom' ]),
  viewControllers: PropTypes.arrayOf(PropTypes.shape({
    component: PropTypes.func.isRequired,
    props: PropTypes.object,
    tab: PropTypes.node.isRequired,
  })).isRequired,
};

TouchstoneTabs.defaultProps = {
  position: 'bottom',
};

export default TouchstoneTabs;
