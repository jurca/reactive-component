export default class DataSource {
  constructor(initialData = {}) {
    this._data = initialData;
    this._listeners = new Set();
  }

  getData() {
    return this._data;
  }

  setData(data) {
    this._data = data;
    for (const listener of this._listeners) {
      listener();
    }
  }

  addListener(listener) {
    this._listeners.add(listener);
  }

  removeListener(listener) {
    this._listeners.delete(listener);
  }
}
