import combineKeys from './compoundCacheKeys';

const refProxies = new WeakMap();
const refObjects = new WeakMap();

export default function elementReferencesProvider(component, uiRootProvider, currentProps, currentData) {
  if (typeof Proxy !== 'undefined') {
    if (refProxies.has(component)) {
      return refProxies.get(component);
    }

    const elementCache = new WeakMap();
    const refProxy = new Proxy({}, {
      get(target, propertyName) {
        const cacheKey = combineKeys(currentProps, currentData);
        if (!elementCache.has(cacheKey)) {
          return elementCache.set(cacheKey, new Map());
        }
        const elements = elementCache.get(cacheKey);
        if (elements.has(propertyName)) {
          return elements.get(propertyName);
        }

        const element = uiRootProvider(component).querySelector(`#${propertyName}, [data-ref="${propertyName}"]`);
        elements.set(propertyName, element);
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
