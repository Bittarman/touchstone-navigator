import { Container } from 'touchstonejs';

import uuid from 'node-uuid';

export default (viewController) => {
  return {
    id: uuid.v1(),
    ...viewController,
    scrollable: viewController.scrollable || Container.initScrollable(),
  };
};
