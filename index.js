/*!
 * assemble-plugin-wrapper <https://github.com/doowb/assemble-plugin-wrapper>
 *
 * Copyright (c) 2015, Brian Woodward, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var path = require('path');

/**
 * Wrap a plugin function to easily use it with the specified type (e.g. app, collection, view, or any)
 *
 * ```js
 * app.use(wrapper('any', function () {
 *   this.foo = function (str) {
 *     return 'foo-' + str;
 *   };
 * }));
 *
 * app.foo('bar');
 * //=> 'foo-bar'
 * ```
 *
 * @param  {String} `pluginType` The type specifying where this plugin should be use.
 * @param  {String} `pluginType.app` Only use on the `app`
 * @param  {String} `pluginType.collection` Only use on view collections.
 * @param  {String} `pluginType.view` Only use on view instances.
 * @param  {String} `pluginType.any` Use with any of the plugin types.
 * @param  {Function} `fn` Function to use as the plugin. This will be executed in the context of the specified plugin type object (e.g. app, collection, view)
 * @return {Function} Plugin function that may be passed to `.use` methods on app, collection, and/or view instances
 * @api public
 */

function wrapper(pluginType, fn) {
  if (typeof pluginType === 'function') {
    fn = pluginType;
    pluginType = 'any';
  }

  pluginType = pluginType || 'any';

  return function (obj) {
    /**
     * App plugin
     */

    if ((pluginType === 'app' || pluginType === 'any') && obj.isApp) {
      extendSelf.call(this, obj, fn);
    }

    /**
     * Collection plugin
     */

    if (pluginType === 'collection' || pluginType === 'any') {
      if (obj.isApp) {
        extendCollection.call(this, obj, fn);
      }
      if (obj.isCollection) {
        extendSelf.call(this, obj, fn);
      }
    }

    /**
     * View plugin
     */

    if (pluginType === 'view' || pluginType === 'any') {
      if (obj.isApp || obj.isCollection) {
        extendViews.call(this, obj, fn);
      }
      if (obj.isView) {
        extendSelf.call(this, obj, fn);
      }
    }
  };
}

/**
 * Adds an `extendViews` method on the app options to enable using plugins on `Views` instances.
 *
 * @param  {Object} `obj` App to extend
 * @param  {Function} `fn` Plugin function to use
 */

function extendCollection(obj, fn) {
  obj.options.extendViews = function (collection) {
    fn.call(collection, collection);
    return collection;
  };
}

/**
 * Adds an `extendView` method to the app or collection instance to enable using plugins on `View` instances.
 *
 * @param  {Object} `obj` App or collection instance to extend.
 * @param  {Function} `fn` Plugin function to use
 */

function extendViews(obj, fn) {
  var orig = obj.extendView;
  obj.define('extendView', function () {
    var view = orig.apply(this, arguments);
    extendSelf.call(view, view, fn);
    return view;
  });
}

/**
 * Execute a plugin function in the context of the speificed object (e.g. app, collection, and/or view).
 *
 * @param  {Object} `self` Object to use as the `this`
 * @param  {Function} `fn` Plugin function to execute
 */

function extendSelf(self, fn) {
  fn.call(self, self);
}

/**
 * Expose `wrapper`
 */

module.exports = wrapper;
