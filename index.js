import { ViewManager } from 'touchstonejs';

require('./src/utils/patchViewManager')(ViewManager);

export { default as default } from './src/TouchstoneNavigator';
