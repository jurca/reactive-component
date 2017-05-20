import html2hyperscript from 'html-to-hyperscript';
import createElement from 'virtual-dom/create-element';
import diff from 'virtual-dom/diff';
import h from 'virtual-dom/h';
import patch from 'virtual-dom/patch';
import AbstractComponent from './AbstractComponent.js';
import elementReferencesProvider from './utils/elementReferencesProvider.js';

const htmlParser = html2hyperscript.htmlToHs({syntax: 'h'});

export default class Component extends AbstractComponent {
  constructor(dataSource, useShadowDom = true) {
    super(dataSource, elementReferencesProvider, renderer, renderingRootProvider);

    this._Component = {
      uiRoot: useShadowDom ? this.attachShadow({mode: 'open'}) : this,
      firstRender: true,
      uiDom: null,
      lastUi: null,
      lastVTree: null,
    };
  }
}

function renderer(component, uiRootProvider, ui) {
  if (ui === component._Component.lastUi) {
    return;
  }

  let uiVTree;
  if (typeof ui === 'string') {
    const uiHs = htmlParser(`<shadow-root>${ui}</shadow-root>`);
    uiVTree = eval(uiHs); // eslint-disable-line no-eval
  } else {
    uiVTree = h('shadow-root', ui);
  }

  const uiRoot = uiRootProvider(component);

  if (component._Component.firstRender) {
    component._Component.uiDom = uiRoot;
    for (const child of uiVTree.children) {
      component._Component.uiDom.appendChild(createElement(child));
    }
    component._Component.firstRender = false;
  } else {
    const patches = diff(component._Component.lastVTree, uiVTree);
    patch(component._Component.uiDom, patches);
  }

  component._Component.lastUi = ui;
  component._Component.lastVTree = uiVTree;
}

function renderingRootProvider(component) {
  return component._Component.uiRoot;
}

