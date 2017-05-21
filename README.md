# reactive-component

This repository is a technical experiment: what might React look like if it was
based on the Web Components (v1) API?

The point of this experiment is to create a base class for web components with
as close-to-react as possible API and behavior.

There are some simplifications and differences in place though:

* No component has internal state - this experiment follows the "one global
  state" pattern introduced in [redux](http://redux.js.org/).
* Props can only be strings - this is caused by the fact that attribute values
  are always strings. The [Polymer](https://www.polymer-project.org/) goes
  around this by putting JSON in attribute values where necessary (using child
  elements to describe structured data would be IMHO better, HTML tables and
  selects do it), but this introduces serialization/deserialization overhead
  and, IMHO, looks somewhat weird.
* There is no `componentWillMount` method, because it cannot be easily done
  with the current web components API, and there is no actual need for it: the
  [React docs](https://facebook.github.io/react/docs/react-component.html#componentwillmount)
  state that the logic should be put in the constructor instead.
* There is no `componentWillUnmount` method - this one is replaced by the
  `componentDidUnmount` method. This is due to how the web components API works
  and is OK, because the DOM still exists and can be manipulated (it is only
  detached from the document), so cleaning up is still possible.
* The `render` method may return a hyperscript-like virtual DOM or an HTML
  string. In a real-world scenario, a transpiler would be used to convert
  HTML/JSX to virtual dom, because the calls to the virtual DOM API are not as
  convenient, and the HTML parser is slow, bulky and complicates
  bundling/demoing; converting an HTML string to virtual DOM also has some
  issues with flattening array in the DOM when new elements are inserted
  somewhere in the middle or the beginning - this is because the elements have
  no keys that identify them.
* There is no `this.props.children`, use the `slot` attribute in the client DOM
  and the `slot` elements in the shadow DOM (this is actually a more powerful
  feature that a single prop).
* The react element `refs` are provided by the component's `elements` property.
  Callback refs are not supported, as this would require custom virtual DOM
  implementation, and that is beyond the scope of this experiment.
* The components rely on the shadow DOM by default. This enables easy scoping
  of CSS without the need for the
  [CSS modules](https://github.com/css-modules/css-modules).
* Full server-side rendering is possible only for components that do not use
  the shadow DOM, as there is no way to serialize shadow DOM into a static HTML
  markup (yet).
* Browser support: at the time of writing this, the modern browsers are
  implementing support for
  [web components](http://caniuse.com/#feat=custom-elementsv1) and
  [shadow DOM](http://caniuse.com/#feat=shadowdomv1), the two **web standards**
  technologies that this experiment builds upon. Don't expect IE support since
  there will never be a new IE version past 11, but
  [polyfilling might be possible](https://www.webcomponents.org/polyfills/).

## Demo

1. clone the repository
2. run `npm i`
3. use a webserver to serve the project directory (most linux distros may use
   `python -m SimpleHTTPServer 8000` to run a python webserver on the 8000
   port)
4. open any of the HTML documents in the `demo` directory
