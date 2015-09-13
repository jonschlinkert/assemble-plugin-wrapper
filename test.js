require('mocha');
var assert = require('assert');
var assemble = require('assemble');
var wrapper = require('./');
var plugin;

describe('plugin defaults', function () {
  beforeEach(function () {
    plugin = function (type) {
      return wrapper(type, function () {
        this.foo = function (str) {
          return str + 'foo';
        };
      });
    };
  })

  it('should work as an app plugin:', function () {
    var app = assemble()
      .use(plugin());

    assert(app.foo('bar') === 'barfoo');
  });

  it('should work on collections as an app plugin:', function () {
    var app = assemble()
      .use(plugin('collection'));

    app.create('posts');
    assert(app.posts.foo('bar') === 'barfoo');
  });

  it('should work on views as an app plugin:', function () {
    var app = assemble()
      .use(plugin('view'));

    app.create('posts');
    app.post('aaa', {content: '...'});
    assert(app.views.posts.aaa.foo('bar') === 'barfoo');
  });

  it('should work on app, collections and views as an app plugin:', function () {
    var app = assemble()
      .use(plugin());

    app.create('posts');
    app.post('aaa', {content: '...'});
    assert(app.foo('bar') === 'barfoo');
    assert(app.posts.foo('bar') === 'barfoo');
    assert(app.views.posts.aaa.foo('bar') === 'barfoo');
  });

  it('should work as a create plugin:', function () {
    var app = assemble();
    app.create('pages')
      .use(plugin());

    app.pages('aaa', {content: '...'});
    assert(app.pages.foo('bar') === 'barfoo');
  });


  it('should work as a collection plugin:', function () {
    var app = assemble();
    app.create('pages')
    app.pages.use(plugin());

    app.pages('aaa', {content: '...'});
    assert(app.pages.foo('bar') === 'barfoo');
  });

  it('should work on collections and views as a collection plugin:', function () {
    var app = assemble();
    app.create('pages')
      .use(plugin('any'))

    app.pages('aaa', {content: '...'});
    assert(app.pages.foo('bar') === 'barfoo');
    assert(app.views.pages.aaa.foo('bar') === 'barfoo');
  });

  it('should work as a view plugin:', function () {
    var app = assemble();
    app.create('pages');

    app.page('aaa', {content: '...'})
      .use(plugin());

    assert(app.pages.views.aaa.foo('bar') === 'barfoo');
  });

  // it('should throw an error:', function () {
  //   (function () {
  //     plugin();
  //   }).should.throw('plugin expects valid arguments');
  // });
});
