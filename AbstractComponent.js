const IDENTITY_FUNCTION = input => input;

export default class AbstractComponent extends HTMLElement {
  static get is() {
    throw new TypeError('The id static property getter is abstract and must be overridden');
  }

  static get observedAttributes() {
    return [];
  }

  constructor(dataSource, elementReferencesProvider, renderer, renderingRootProvider) {
    super();

    const instance = this;
    const props = {};
    const attributes = this.attributes;
    for (let i = 0, length = attributes.length; i < length; i++) {
      const attribute = attributes.item(i);
      props[attribute.name] = attribute.value;
    }
    this._AbstractComponent = {
      mounted: false,
      props,
      data: null,
      dataFragments: null,
      elementReferencesProvider,
      renderer,
      renderingRootProvider,
      dataChangeObserver: () => {
        this._AbstractComponent.update(this._AbstractComponent.props);
      },
      update(nextProps) {
        const nextDataFragments = instance._AbstractComponent.getDataFragments();
        const dataFragmentsChanged = nextDataFragments.some(
          (fragment, index) => fragment !== instance._AbstractComponent.dataFragments[index],
        );
        const privates = instance._AbstractComponent;
        const nextData = dataFragmentsChanged ? privates.getData(nextDataFragments) : privates.data;
        instance.componentWillReceiveProps(nextProps, nextData);

        if (!instance.shouldComponentUpdate(nextProps, nextData)) {
          return;
        }
        instance.componentWillUpdate(nextProps, nextData);
        const prevProps = instance._AbstractComponent.props;
        const prevData = instance._AbstractComponent.data;
        instance._AbstractComponent.props = nextProps;
        instance._AbstractComponent.dataFragments = nextDataFragments;
        instance._AbstractComponent.data = nextData;
        instance._AbstractComponent.render();
        instance.componentDidUpdate(prevProps, prevData);
      },
      render() {
        const ui = instance.render();
        renderer(instance, renderingRootProvider, ui);
      },
      getDataFragments() {
        const rawData = dataSource.getData();
        return instance.dataSelectors.map(
          selector => selector(rawData),
        );
      },
      getData(dataFragments) {
        return Object.assign({}, ...dataFragments);
      },
    };
    dataSource.addListener(this._AbstractComponent.dataChangeObserver);
  }

  get props() {
    return this._AbstractComponent.props;
  }

  get data() {
    return this._AbstractComponent.data;
  }

  get elements() {
    return this._AbstractComponent.elementReferencesProvider(
      this,
      this._AbstractComponent.renderingRootProvider,
      this._AbstractComponent.props,
      this._AbstractComponent.data,
    );
  }

  get dataSelectors() {
    return [IDENTITY_FUNCTION];
  }

  render() {
    throw new TypeError('The render method is abstract and must be overridden');
  }

  componentDidMount() {}

  componentWillReceiveProps(nextProps, nextData) {}

  shouldComponentUpdate(nextProps, nextData) {
    return this._AbstractComponent.props !== nextProps || this._AbstractComponent.data !== nextData;
  }

  componentWillUpdate(nextProps, nextData) {}

  componentDidUpdate(prevProps, prevData) {}

  componentDidUnmount() {}

  connectedCallback() {
    this._AbstractComponent.dataFragments = this._AbstractComponent.getDataFragments();
    this._AbstractComponent.data = this._AbstractComponent.getData(this._AbstractComponent.dataFragments);
    this._AbstractComponent.mounted = true;
    this._AbstractComponent.render();

    this.componentDidMount();
  }

  disconnectedCallback() {
    this._AbstractComponent.mounted = false;
    this._AbstractComponent.dataSource.removeListener(this._AbstractComponent.dataChangeObserver);
    this.componentDidUnmount();
  }

  attributeChangedCallback(attributeName, oldValue, newValue, namespace) {
    if (!this._AbstractComponent.mounted) {
      this.props[`${namespace ? `${namespace}:` : ''}${attributeName}`] = newValue;
      return;
    }

    const nextProps = {
      ...this._AbstractComponent.props,
      [`${namespace ? `${namespace}:` : ''}${attributeName}`]: newValue,
    };
    this._AbstractComponent.update(nextProps);
  }
}
