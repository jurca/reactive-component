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
    this._Component = {
      props,
      data: null,
      dataFragments: null,
      elementReferencesProvider,
      renderer,
      renderingRootProvider,
      dataChangeObserver: () => {
        this._Component.update(this._Component.props);
      },
      update(nextProps) {
        const nextDataFragments = instance._Component.getDataFragments();
        const dataFragmentsChanged = nextDataFragments.some(
          (fragment, index) => fragment !== instance._Component.dataFragments[index],
        );
        const privates = instance._Component;
        const nextData = dataFragmentsChanged ? privates.getData(nextDataFragments) : privates.data;
        instance.componentWillReceiveProps(nextProps, nextData);

        if (!instance.shouldComponentUpdate(nextProps, nextData)) {
          return;
        }
        instance.componentWillUpdate(nextProps, nextData);
        const prevProps = instance._Component.props;
        const prevData = instance._Component.data;
        instance._Component.props = nextProps;
        instance._Component.data = nextData;
        instance._Component.render();
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
    dataSource.addListener(this._Component.dataChangeObserver);
    this._Component.dataFragments = this._Component.getDataFragments();
    this._Component.data = this._Component.getData(this._Component.dataFragments);
  }

  get props() {
    return this._Component.props;
  }

  get data() {
    return this._Component.data;
  }

  get elements() {
    return this._Component.elementReferencesProvider(
      this,
      this._Component.renderingRootProvider,
      this._Component.props,
      this._Component.data,
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
    return this._Component.props !== nextProps || this._Component.data !== nextData;
  }

  componentWillUpdate(nextProps, nextData) {}

  componentDidUpdate(prevProps, prevData) {}

  componentDidUnmount() {}

  connectedCallback() {
    this._Component.render();

    this.componentDidMount();
  }

  disconnectedCallback() {
    this._Component.dataSource.removeListener(this._Component.dataChangeObserver);
    this.componentDidUnmount();
  }

  attributeChangedCallback(attributeName, oldValue, newValue, namespace) {
    const nextProps = {
      ...this._Component.props,
      [`${namespace ? `${namespace}:` : ''}${attributeName}`]: newValue,
    };
    this._Component.update(nextProps);
  }
}
