import React, { Component, PropTypes } from 'react';
import { View, ViewManager } from 'touchstonejs';

import _ from 'lodash';

import prepareViewController from './utils/prepareViewController';

class TouchstoneNavigatorViews extends Component {
  componentDidMount() {
    this.props.onViewChange(this.refs.viewManager.refs.view);
  }

  componentDidUpdate(prevProps, prevState) {
    const { viewControllers } = this.state;
    const { viewControllers: previousViewControllers } = prevState;

    if (!previousViewControllers) { return; }

    _.defer(() => {
      const difference = viewControllers.length - previousViewControllers.length;

      let transition;
      if (difference < 0) {
        transition = 'reveal-from-right';
      } else if (difference > 0) {
        transition = 'show-from-right';
      }

      this.props.onViewChange(this.refs.viewManager.refs.view, transition);
    });
  }

  componentWillUnmount() {
    const { navigator } = this.props;
    if (navigator) { navigator.saveState(this.state); }
  }

  getViewController(id) {
    return _.find(this.state.viewControllers, { id });
  }

  render() {
    const { viewControllers } = this.state;
    const { name } = this.props;

    const [ rootViewController ] = viewControllers;
    const defaultView = rootViewController.id;

    return (
      <ViewManager
        ref="viewManager"
        name={name}
        defaultView={defaultView}>

        {viewControllers.map(({ id, component, props, savedState, scrollable }) => (
          <View
            key={id}
            name={id}
            component={component}

            {...props}
            initialState={savedState}
            scrollable={scrollable}
            navigator={this._createPropsNavigator(id)} />
        ))}
      </ViewManager>
    );
  }

  push(viewComponent, viewProps, animated = true) {
    const newViewController = prepareViewController({
      component: viewComponent,
      props: viewProps,
    });
    const { id, props, scrollable } = newViewController;

    const performTransition = () => {
      const navigator = this._createPropsNavigator(id);
      this.refs.viewManager.transitionTo(id, {
        transition: animated ? 'show-from-right' : 'instant',
        viewProps: {
          ...props,
          scrollable,
          navigator,
        },
      });

      this.props.onPush();
    };

    this.setState({
      ...this.state,
      viewControllers: [ ...this.state.viewControllers, newViewController ],
    }, performTransition);

    return id;
  }

  pop(animated = true, acknowledge = true) {
    const { viewControllers } = this.state;
    const previousViewController = viewControllers[viewControllers.length - 2];
    return this.popToView(_.get(previousViewController, 'id'), animated, acknowledge);
  }

  popToRoot(animated = true, acknowledge = true) {
    return this.popToView(_.get(_.first(this.state.viewControllers), 'id'), animated, acknowledge);
  }

  popToView(viewControllerId, animated = true, acknowledge = true) {
    const { viewControllers } = this.state;

    const viewControllerToPopTo = this.getViewController(viewControllerId);

    if (viewControllerToPopTo) {
      const { id, props, savedState, scrollable } = viewControllerToPopTo;

      _.defer(() => {
        const numberOfViewsAfterPop = _.indexOf(viewControllers, viewControllerToPopTo) + 1;
        const navigator = this._createPropsNavigator(id);

        this.refs.viewManager.transitionTo(id, {
          transition: animated ? 'reveal-from-right' : 'instant',
          viewProps: {
            ...props,
            initialState: savedState,
            scrollable,
            navigator,
          },
        });

        this.setState({
          ...this.state,
          viewControllers: viewControllers.concat().splice(0, numberOfViewsAfterPop),
        });

        if (acknowledge) { this.props.onPop(); }
      });

      return id;
    }

    return null;
  }

  _createPropsNavigator(viewControllerId) {
    return {
      init(view) { this.view = view; },

      push: this.push.bind(this),
      pop: this.pop.bind(this),
      popToRoot: this.popToRoot.bind(this),
      popToView: this.popToView.bind(this),

      getViewController: this.getViewController.bind(this),

      canGoBack: () => {
        const viewController = this.getViewController(viewControllerId);
        return _.indexOf(this.state.viewControllers, viewController) > 0;
      },

      saveState: (state) => {
        const viewController = this.getViewController(viewControllerId);
        if (viewController) { viewController.savedState = { ...state }; }
      },

      refreshNavigation: () => {
        this.props.onViewChange(this.refs.viewManager.refs.view);
      },
    };
  }

  constructor(props) {
    super(...arguments);

    this.state = {
      viewControllers: [
        prepareViewController(props.rootViewController),
      ],
      ...props.initialState,
    };
  }
}

TouchstoneNavigatorViews.propTypes = {
  name: PropTypes.string.isRequired,
  navigator: PropTypes.object,
  rootViewController: PropTypes.shape({
    component: PropTypes.func.isRequired,
    props: PropTypes.object,
  }).isRequired,
  onViewChange: PropTypes.func.isRequired,
  onPop: PropTypes.func,
  onPush: PropTypes.func,
};

TouchstoneNavigatorViews.defaultProps = {
  onPop: () => {},
  onPush: () => {},
};

export default TouchstoneNavigatorViews;
