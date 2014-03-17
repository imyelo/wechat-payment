var _  = (function () {
  var exports = {};
  exports.isUndefined = function (obj) {
    return typeof obj === 'undefined';
  };
  exports.isString = function (obj) {
    return typeof obj === 'string';
  };
  exports.isArray = function (obj) {
    return obj instanceof Array;
  };
  exports.isFunction = function (obj) {
    return typeof obj === 'function';
  };
  exports.each = function (list, func) {
    var i, len;
    if (exports.isArray(list)) {
      for (i = 0, len = list.length; i < len; i++) {
        func(list[i], i, list);
      }
    } else {
      for (i in list) {
        func(list[i], i, list);
      }
    }
    return list;
  };
  exports.filter = function (obj, filter) {
    var result = {};
    exports.each(obj, function (val, key, obj) {
      if (filter(val, key, obj)) {
        result[key] = val;
      }
    });
    return result;
  };
  exports.assign = function (obj, source) {
    var result = {};
    exports.each(arguments, function (arg) {
      exports.each(arg, function (val, key) {
        result[key] = val;
      });
    });
    return result;
  };
  exports.defaults = function (options, defaults) {
    return exports.assign.apply(this, Array.prototype.reverse.apply(arguments));
  };
  // shallow clone
  exports.clone = function (src) {
    var result;
    if (exports.isArray(src)) {
      result = [];
      exports.each(src, function (val, key) {
        result.push(val)
      });
    } else {
      result = {};
      exports.each(src, function (val, key) {
        result[key] = val;
      });
    }
    return result;
  };
  return exports;
})();

module.exports = _;