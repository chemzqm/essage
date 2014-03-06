
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("essage/index.js", Function("exports, require, module",
"/* Essage - a more elegant way to show message\n\
 * https://github.com/sofish/essage\n\
 */\n\
var Utils = {\n\
\n\
  is: function(obj, type) {\n\
    return Object.prototype.toString.call(obj).slice(8, -1) === type;\n\
  },\n\
\n\
  copy: function(defaults, source) {\n\
    for(var p in source) {\n\
      if(source.hasOwnProperty(p)) {\n\
        var val = source[p];\n\
        defaults[p] = this.is(val, 'Object') ? this.copy({}, val) :\n\
          this.is(val, 'Array') ? this.copy([], val) : val;\n\
      }\n\
    }\n\
    return defaults;\n\
  }\n\
}\n\
\n\
var Essage = function() {\n\
  var self = this;\n\
\n\
  this.defaults = {\n\
    placement: 'top',\n\
    status: 'normal'\n\
  }\n\
\n\
  this.el = document.createElement('div');\n\
  this.el.className = 'essage';\n\
\n\
  this.close = '<span class=\"close\">&times;</span>';\n\
\n\
  this.el.onclick = function(e) {\n\
    var e = e || win.event\n\
      , target = e.target || e.srcElement;\n\
    if(target.className === 'close') self.hide();\n\
  }\n\
\n\
  // placement of the message, by default is `top`\n\
  this.placement = 'top';\n\
\n\
  document.body.appendChild(this.el);\n\
  this.el.top = -this._height();\n\
\n\
  return this;\n\
};\n\
\n\
Essage.prototype._height = function() {\n\
  return this.el.offsetHeight || this.el.clientHeight;\n\
};\n\
\n\
Essage.prototype._class = function(classname, isRemove) {\n\
  var el = this.el;\n\
\n\
  if(el.classList) {\n\
    el.classList[isRemove ? 'remove' : 'add'](classname);\n\
  } else {\n\
    var defaultclass= el.className\n\
      , reg = new RegExp('\\\\b' + classname + '\\\\b', 'g');\n\
\n\
    el.className = isRemove ? defaultclass.replace(reg, '') :\n\
      defaultclass.match(reg) ? defaultclass : (defaultclass + ' ' + classname);\n\
  }\n\
\n\
  return el;\n\
};\n\
\n\
Essage.prototype.set = function(message) {\n\
\n\
  message = typeof message === 'string' ? { message: message } : message;\n\
\n\
  // copy for each message\n\
  this.config = Utils.copy({}, this.defaults);\n\
  this.config = Utils.copy(this.config, message);\n\
\n\
  // placement check\n\
  !this.config.placement.match(/^(?:top|bottom)$/) && (this.config.placement = 'top');\n\
\n\
  // adjust placement\n\
  this.el.style[this.config.placement === 'top' ? 'bottom' : 'top'] = 'auto';\n\
\n\
  // set status(className)\n\
  this.el.className = 'essage';\n\
  this._class('essage-' + this.config.status);\n\
\n\
  return this;\n\
};\n\
\n\
Essage.prototype.show = function(message, duration) {\n\
  var el = this.el\n\
    , self = this.set(message)\n\
    , interval, timeout;\n\
\n\
  // set message\n\
  el.innerHTML = this.close + this.config.message;\n\
\n\
  var top = -this._height();\n\
\n\
  // disppear automaticlly\n\
  if(this._timeout) clearTimeout(this._timeout);\n\
  duration && (timeout = function() {\n\
    return setTimeout(function() {\n\
      self.hide();\n\
    }, duration);\n\
  });\n\
\n\
  interval = setInterval(function() {\n\
    if(top === 0) {\n\
      self._timeout = timeout && timeout();\n\
      return clearInterval(interval);\n\
    }\n\
    el.style[self.config.placement] = (top += 1) + 'px';\n\
  }, 3);\n\
\n\
  return this;\n\
};\n\
\n\
Essage.prototype.hide = function() {\n\
  var top = +this.el.style[this.config.placement].slice(0, -2)\n\
    , dest = -this._height()\n\
    , self = this\n\
    , interval;\n\
\n\
  interval = setInterval(function() {\n\
    if(top === dest) return interval && clearInterval(interval);\n\
    self.el.style[self.config.placement] = (top -= 1) + 'px';\n\
  }, 3);\n\
  return this;\n\
}\n\
\n\
module.exports = new Essage();\n\
\n\
//@ sourceURL=essage/index.js"
));
require.alias("essage/index.js", "essage/index.js");