import React, { Component, PropTypes } from 'react';

import _ from 'lodash';
import blacklist from 'blacklist';
import classNames from 'classnames';

function createViewsFromChildren(children) {
  const views = {};
  React.Children.forEach(children, (view) => views[view.props.name] = view);
  return views;
}

class ViewContainer extends Component {
  propTypes: {
    children: PropTypes.node,
  }

  render() {
    return (
      <div {...blacklist(this.props, 'children')}>
        {this.props.children}
      </div>
    );
  }

  shouldFillVerticalSpace: true
}

export default (ViewManager) => {
  ViewManager.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
    const { name } = this.props;
    const { currentView } = this.state;

    // There's a bug inside Touchstone's ViewManager that uses the wrong props children
    // here to fix that (nextProps.children vs this.props.children)
    this.setState({
      views: createViewsFromChildren(nextProps.children),
    });

    if (nextProps.name !== name) {
      this.context.app.viewManagers[nextProps.name] = this;
      delete this.context.app.viewManagers[name];
    }

    if (nextProps.currentView && nextProps.currentView !== currentView) {
      this.transitionTo(nextProps.currentView, { viewProps: nextProps.viewProps });
    }
  };

  const originalRender = ViewManager.prototype.render;

  const renderViewContainer = function renderViewContainer() {
    const { currentView, views } = this.state;
    if (!currentView) { return false; }

    const view = views[currentView];
    if (!view || !view.props.component) { return false; }

    const options = { ...this.state.options };
    const ViewComponent = view.props.component;
    const viewProps = {
      ...blacklist(view.props, 'component', 'className'),
      ...options.viewProps,
      ref: 'view',
    };

    return (
      <ViewContainer
        key={currentView}
        className={classNames(`View View--${currentView}`, view.props.className)}>
        <ViewComponent {...viewProps} />
      </ViewContainer>
    );
  };

  ViewManager.prototype.render = function render() {
    this.renderViewContainer = renderViewContainer.bind(this);
    return originalRender.apply(this, arguments);
  };
};
