import Component from './Component';
import elementReferencesProvider from './utils/elementReferencesProvider';

export default class LeafComponent extends Component {
  constructor(dataSource, useShadowDom = true) {
    super(dataSource, elementReferencesProvider, renderer, renderingRootProvider);

    this._LeafComponent = {
      uiRoot: useShadowDom ? this.attachShadow({mode: 'open'}) : this,
    };
  }
}

function renderer(component, uiRootProvider, ui) {
  const uiRoot = uiRootProvider(component);
  if (typeof ui === 'string') {
    uiRoot.innerHTML = ui;
  } else {
    uiRoot.innerHTML = '';
    uiRoot.appendChild(ui);
  }
}

function renderingRootProvider(component) {
  return component._LeafComponent.uiRoot;
}
