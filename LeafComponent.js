import Component from './AbstractComponent.js';
import elementReferencesProvider from './utils/elementReferencesProvider.js';

export default class LeafComponent extends Component {
  constructor(dataSource, useShadowDom = true) {
    super(dataSource, elementReferencesProvider, renderer, renderingRootProvider);

    this._LeafComponent = {
      uiRoot: useShadowDom ? this.attachShadow({mode: 'open'}) : this,
      lastUi: null,
    };
  }
}

function renderer(component, uiRootProvider, ui) {
  if (ui === component._LeafComponent.lastUi) {
    return;
  }

  const uiRoot = uiRootProvider(component);
  if (typeof ui === 'string') {
    uiRoot.innerHTML = ui;
  } else {
    uiRoot.innerHTML = '';
    uiRoot.appendChild(ui);
  }
  component._LeafComponent.lastUi = ui;
}

function renderingRootProvider(component) {
  return component._LeafComponent.uiRoot;
}
