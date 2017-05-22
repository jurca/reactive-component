# reactive-component

This repository is a technical experiment: what might React look like if it was
based on the Web Components (v1) API?

The point of this experiment is to create a base class for web components with
as close-to-react as possible API and behavior.

## Motivation

The web components API has been described as a native alternative to libraries
such as React, Angular and Polymer. The API itself, however, is pretty
low-level and there are various nice features we (the web developers ) got used
to that the web components API does not provide.

This experiments explores these differences through an attempt to create a
base class for a React-like web component, with rendering through describing
the whole component's UI and using DOM-diffing, and following some of the
patterns that got popular in the React community.

## Differences from React

There are some simplifications and differences in place though:

* No component has an internal state - this experiment follows the "one global
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
* Higher-order components cannot be composed in the HTML without exposing them
  in the markup.
* Browser support: at the time of writing this, the modern browsers are
  implementing support for
  [web components](http://caniuse.com/#feat=custom-elementsv1) and
  [shadow DOM](http://caniuse.com/#feat=shadowdomv1), the two **web standards**
  technologies that this experiment builds upon. Don't expect IE support since
  there will never be a new IE version past 11, but
  [polyfilling might be possible](https://www.webcomponents.org/polyfills/).
* There is no "React Dev Tools" needed here. Since your components are custom
  elements, it is clear where each component begins, and its props and can be
  explored through the elements navigator (the Properties tab in Chrome).

## "Polyfilling" the shadow DOM in HTML markup

Currently, there is no way to specify shadow DOM in HTML markup. This, however,
might be "polyfilled" using a custom element, e.g. `<shadow-dom>`.

Such a component should slot all its children into its shadow DOM, and provide
JS properties to render into its shadow DOM by the wrapping custom element
using it.

Another approach would be using the `<shadow-dom>` element as a simple marker
of the part of the custom element's client DOM that should be considered its
initial shadow DOM content.

## Demo

1. clone the repository
2. run `npm i`
3. use a webserver to serve the project directory (most linux distros may use
   `python -m SimpleHTTPServer 8000` to run a python webserver on the 8000
   port)
4. open any of the HTML documents in the `demo` directory

## Conclusion

While it is certainly possible to replace React/Angular/Polymer with native web
components, having at least some "convenience layer" is handy. The web
components have the potential to become a building block for libraries like
these, but adding a native support for shadow DOM in the HTML markup might be
needed to support proper server-side rendering.

Adding some form of virtual DOM (with XML-like syntax and keys for nodes) to JS
itself could be also helpful to support more declarative form of rendering. The
client-side JS could also use a support for "smart" patching of existing DOM
tree using either a virtual DOM tree or a detached DOM tree.

All of this is, however, based on the assumption that a virtual DOM would be a
longer-living concept than `Object.observe()` ever was.
