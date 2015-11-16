# touchstone-navigator

Touchstone does many things right, but navigation is not one of them. A few flaws include:

 - The need to define all views in the `ViewManager`. This also means you cannot transition to another instance of a view the same Component type as the current view.
 - `getNavigation` is a static method, meaning navigation bars have no proper access to an instance of a View. This means using things like EventEmitters which is not ideal.
 - The `ViewManager` does not have a built-in navigation stack like `UINavigationController` does.
 - It also does not automatically handle restoring of state when going back. This includes props/states, and the scroll position of the view.

The goal of Touchstone Navigator has been to mimic the API of iOS's `UINavigationController`. It does the following:

 - Responsible for storing the complete view stack of where the user has been.
 - Implements pushing, popping, helper methods for navigating between views.
 - Does not require all views to be defined like `ViewManager` does, components are pushed into the navigator on the fly.
 - Persists the props, state, and scroll position of all views in the view stack.
 - Automatically adds a back button into the navigation bar if there is a view to pop to in the view stack.
 - Navigation bar states are no longer handled as static methods, and can be implemented as part of a view instance.

## Installation

    npm install touchstone-navigator --save

Then require the module:

    import TouchstoneNavigator from 'touchstone-navigator';

## Usage

Simply use `TouchstoneNavigator` as a component along with specifying the initial view to display:

    import React, { Component } from 'react';
    import TouchstoneNavigator from 'touchstone-navigator';
    import TourGuide from '../views/TourGuide';

    class Onboarding extends Component {
      render() {
        return (
          <TouchstoneNavigator
            name="Onboarding"
            showNavigationBar={true}
            rootViewController={{ component: TourGuide, props: {} }} />
        );
      }
    }

    export default Onboarding;

A `navigator` prop is passed into the views rendered by `TouchstoneNavigator`, this gives you access to
methods such as `push` and `pop` to programmatically navigate between views.

A `scrollable` prop is also passed through. You are responsible for passing this into the `Container` to restore scroll position state.

    import React, { Component, PropTypes } from 'react';
    import { Container } from 'touchstonejs';
    import Tappable from 'react-tappable';

    import SignInScreen from './SignInScreen';

    class TourGuide extends Component {
      render() {
        const { navigator, scrollable } = this.props;

        return (
          <Container scrollable={scrollable}>
            <Tappable onTap={() => navigator.push(SignInScreen, {})>Sign In</Tappable>
          </Container>
        );
      }
    }

    TourGuide.propTypes = {
      navigator: PropTypes.object.isRequired,
      scrollable: PropTypes.object.isRequired,
    };

    export default TourGuide;

### Persisting and Restoring State

Everytime `ViewManager` renders a view, it replaces the old one, this means that the state of a previous view
will be lost. Touchstone Navigator provides an easy set of APIs that enables the persisting and restoring of view's state
as the user navigates within the app. This means that when a user clicks back, they are brought back to where they
left off in the previous view.

    class TourGuide extends Component {
      componentWillUnmount() {
        // Call the `saveState` navigator method with the data you want to persist
        this.props.navigator.saveState(this.state);
      }

      constructor(props) {
        super(...arguments);

        // When the user returns to the view, the previously persisted state will be passed along as a `props.initialState`.
        // You can use this to initialise your state object.

        this.state = {
          ...props.initialState,
          foobar: 'foobar',
        };
      }
    }

### Controlling the navigation bar

To control the navigation bar, you simply implement a `getNavigation` instance method in your view that returns
the expected state of the navigation bar. This gets called when the view is first pushed into the view stack.

The expected properties returned is the same as what TouchStone expects with their static `getNavigation` method.

    class TourGuide extends Component {
      getNavigation() {
        return {
          title: 'Tour Guide',
          rightLabel: 'Skip',
          rightAction: this.skipTour,

          // By default, there is no back label, and only an arrow is shown, you can override thid with `backLabel`
          backLabel: 'Go back',
        };
      }

If you want your navigation bar to update whenever your view re-renders, you can do the following:

    class TourGuide extends Component {
      componentWillUpdate() {
        this.props.navigator.refreshNavigation();
      }
    }

If you use higher-order components and compose your views with them, then Touchstone Navigator may not be able to
find the `getNavigation` method. The following is a workaround:

    class TourGuide extends Component {
      constructor() {
        super(...arguments);

        // Tell navigator which component to grab `getNavigation` from
        props.navigator.init(this);
      }
    }

### All `navigator` methods

There are few other useful methods in the `navigator` prop as well, here are all of them:

 - **navigator.push(viewComponent, viewProps, animated)** - Pushes a new view into the navigation.
 - **navigator.pop(animated)** - Pops a view from the navigation stack (goes back a view).
 - **navigator.popToRoot(animated)** - Pops to the root view.
 - **navigator.popToView(viewControllerId, animated)** - Pops to a specific view contoller based on an id.
 - **navigator.canGoBack()** - Returns whether the current view can go back a view (useful for showing back buttons inside your view).
 - **navigator.saveState(state)** - Persist the state of your view before it unmounts.
 - **navigator.refreshNavigation()** - Forces the navigation bar to be re-rendered.
