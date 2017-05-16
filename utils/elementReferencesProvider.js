import combineKeys from './compoundCacheKeys.js';

const refProxies = new WeakMap();
const refObjects = new WeakMap();

export default function elementReferencesProvider(component, uiRootProvider, currentProps, currentData) {
  if (typeof Proxy !== 'undefined') {
    const cacheKey = combineKeys(component, currentProps, currentData);
    if (refProxies.has(cacheKey)) {
      return refProxies.get(cacheKey);
    }

    const elementCache = new Map();
    const refProxy = new Proxy({}, {
      get(target, propertyName) {
        if (elementCache.has(propertyName)) {
          return elementCache.get(propertyName);
        }

        const element = uiRootProvider(component).querySelector(`#${propertyName}, [data-ref="${propertyName}"]`);
        elementCache.set(propertyName, element);
        return element;
      },
    });
    refProxies.set(component, refProxy);
    return refProxy;
  }

  const cacheKey = combineKeys(component, currentProps, currentData);
  if (refObjects.has(cacheKey)) {
    return refObjects.get(cacheKey);
  }

  const references = {};
  const referencedElements = uiRootProvider(component).querySelectorAll('[data-ref]');
  for (const element of Array.from(referencedElements)) {
    references[element.dataset.ref] = element;
  }
  const idElements = uiRootProvider(component).querySelectorAll('[id]');
  for (const element of Array.from(idElements)) {
    references[element.id] = element;
  }
  refObjects.set(cacheKey, references);
  return references;
}
