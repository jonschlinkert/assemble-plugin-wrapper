/*!
 * assemble-plugin-wrapper <https://github.com/doowb/assemble-plugin-wrapper>
 *
 * Copyright (c) 2015, Brian Woodward, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var path = require('path');

function wrapPlugin(pluginType, fn) {
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

function extendCollection(obj, fn) {
  obj.options.extendViews = function (collection) {
    fn.call(collection, collection);
    return collection;
  };
}

function extendViews(obj, fn) {
  var orig = obj.extendView;
  obj.define('extendView', function () {
    var view = orig.apply(this, arguments);
    extendSelf.call(view, view, fn);
    return view;
  });
}

function extendSelf(self, fn) {
  fn.call(self, self);
}

/**
 * Expose `wrapPlugin`
 */

module.exports = wrapPlugin;
