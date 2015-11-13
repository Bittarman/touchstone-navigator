import React, { Component, PropTypes } from 'react';
import { Container, View, ViewManager } from 'touchstonejs';

import _ from 'lodash';
import uuid from 'node-uuid';

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
    const newViewController = this._prepareViewController({
      component: viewComponent,
      props: viewProps,
    });
    const { id, props, scrollable } = newViewController;

    const performTransition = () => {
      this.refs.viewManager.transitionTo(id, {
        transition: animated ? 'show-from-right' : 'instant',
        viewProps: {
          ...props,
          scrollable,
          navigator: this._createPropsNavigator(id),
        },
      });
    };

    this.setState({
      ...this.state,
      viewControllers: [ ...this.state.viewControllers, newViewController ],
    }, performTransition);

    return id;
  }

  pop(animated = true) {
    const { viewControllers } = this.state;
    const previousViewController = viewControllers[viewControllers.length - 2];
    return this.popToView(_.get(previousViewController, 'id'), animated);
  }

  popToRoot(animated = true) {
    return this.popToView(_.get(_.first(this.state.viewControllers), 'id'), animated);
  }

  popToView(viewControllerId, animated = true) {
    const { viewControllers } = this.state;

    const viewControllerToPopTo = this.getViewController(viewControllerId);

    if (viewControllerToPopTo) {
      const { id, props, savedState, scrollable } = viewControllerToPopTo;
      const numberOfViewsAfterPop = _.indexOf(viewControllers, viewControllerToPopTo) + 1;

      this.refs.viewManager.transitionTo(id, {
        transition: animated ? 'reveal-from-right' : 'instant',
        viewProps: {
          ...props,
          initialState: savedState,
          scrollable,
          navigator: this._createPropsNavigator(id),
        },
      });

      this.setState({
        ...this.state,
        viewControllers: viewControllers.concat().splice(0, numberOfViewsAfterPop),
      });

      return id;
    }

    return null;
  }

  _prepareViewController(viewController) {
    return {
      id: uuid.v1(),
      ...viewController,
      scrollable: viewController.scrollable || Container.initScrollable(),
    };
  }

  _createPropsNavigator(viewControllerId) {
    return {
      push: this.push.bind(this),
      pop: this.pop.bind(this),
      popToRoot: this.popToRoot.bind(this),
      popToView: this.popToView.bind(this),

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
      ...props.initialState,
      viewControllers: [
        this._prepareViewController(props.rootViewController),
      ],
    };
  }
}

TouchstoneNavigatorViews.propTypes = {
  name: PropTypes.string.isRequired,
  rootViewController: PropTypes.shape({
    component: PropTypes.func.isRequired,
    props: PropTypes.object,
  }).isRequired,
  onViewChange: PropTypes.func.isRequired,
};

export default TouchstoneNavigatorViews;
