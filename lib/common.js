var _ = require('./_');

/**
 * throw error when u miss the required item
 * @param  {object} obj  
 * @param  {array} keys required keys
 */
var required = function (obj, keys) {
  _.each(keys, function (k) {
    if (_.isUndefined(obj[k])) {
      throw new Error(k + ' is required');
    }
  });
};

var toLowerCaseKeys = function (obj) {
  var result = {};
  _.each(obj, function (val, key) {
    result[key.toLowerCase()] = val;
  });
  return result;
};

/**
 * filter object by keys name
 * @param  {object} obj  
 * @param  {array} keys 
 * @return {object}      
 */
var filterByKeys = function (obj, keys) {
  return _.filter(obj, function (val, key) {
    return keys.indexOf(key) > 1;
  });
};

/**
 * automatic filling string
 * @param {object} obj the key-value dict which has been filled manually
 * @param {object} defaults the default items which will be filled automatically
 * 
 * @example
 *   ```
 *   autoFillString({
 *     appKey: true,
 *     foo: 'bar',
 *     timestamp: true
 *   }, {
 *     appKey: 'abcdefg',
 *     timestamp: function () {
 *       return +new Date() + '';
 *     }
 *   });
 *   ```
 * 
 *   will be:
 *   ```
 *   {
 *     appKey: 'abcdefg',
 *     foo: 'bar',
 *     timestamp: '1394678278916'
 *   }
 *   ```
 */
var autoFillString = function (obj, defaults) {
  var result = {};
  var defVal;
  _.each(obj, function (val, key) {
    if (val === true && !_.isUndefined(defVal = defaults[key])) {
      result[key] = _.isFunction(defVal) ? defVal() : defVal;
    } else {
      result[key] = val;
    }
  });
  return result;
};

/**
 * sort the key-value dict by the capital of key
 * @param  {object} obj source dict
 * @return {object}     sorted dict
 */
var sortByKeyCap = function (obj) {
  var result = {};

  var keys = (function () {
    var result = [];
    _.each(obj, function (value, key) {
      result.push(key);
    });
    return result;
  })().sort(function (l, r) {
    return l > r ? 1 : -1;
  });

  _.each(keys, function (k) {
    result[k] = obj[k];
  });

  return result;
};

/**
 * encodeURICompent with lower case
 * @param  {string} str source string
 * @return {string}     encoded string
 * @example
 *   ```
 *   encodeURIComponentWithLowerCase('http://FOO.bar');
 *   ```
 *   will be:
 *   ```
 *   "http%3a%2f%2fFOO.bar"
 *   ```
 */
var encodeURIComponentWithLowerCase = function (str) {
  return encodeURIComponent(str).replace(/\%[0-9A-F]{2}/g, function (s) {
    return s.replace(/[A-F]/g, function (c) {
      return String.fromCharCode(c.charCodeAt(0) + 32);
    });
  });
};

/**
 * querystring with wrapper methods for key and value
 * @param  {object} obj     the source key-value dict
 * @param  {object} wrapper include two function: key, value
 * @return {string}         result
 * @example
 *   ```
 *   toQuerystring({
 *     abc: 'foo*bar'
 *   }, {
 *     key: function (str) {
 *       return str.toUpperCase();
 *     },
 *     value: encodeURIComponent
 *   });
 *   ```
 *   will be:
 *   ```
 *   "ABC=foo%3Abar"
 *   ```
 */
var toQuerystring = function (obj, wrapper) {
  var result = '';
  var key;
  wrapper = _.defaults((wrapper = wrapper || {}), {
    key: null,
    value: null
  });
  _.each(obj, function (val, key) {
    result += [
      _.isFunction(wrapper.key) ? wrapper.key(key) : key,
     '=',
     _.isFunction(wrapper.value) ? wrapper.value(val) : val,
     '&',
     ].join('');
  })
  return result.slice(0, -1);
};

/**
 * get lower case of string
 * @param  {string} str 
 * @return {string}     result
 */
var lowerCase = function (str) {
  return str.toLowerCase();
};

/**
 * get timestamp
 * @return {string} 
 * @example
 *   ```
 *   getTimestamp();
 *   ```
 *   will be:
 *   ```
 *   "1394679552902"
 *   ```
 */
var getTimestamp = function () {
  return +(new Date()) + '';
};

/**
 * get nonce string
 * @param {number} [length=32] the string length
 * @return {string}
 */
var getNonceStr = function (length) {
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var maxPos = chars.length;
  var noceStr = "";
  var i;
  for (i = 0; i < (length || 32); i++) {
      noceStr += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return noceStr;
};

exports.required = required;
exports.autoFillString = autoFillString;
exports.sortByKeyCap = sortByKeyCap;
exports.encodeURIComponentWithLowerCase = encodeURIComponentWithLowerCase;
exports.toQuerystring = toQuerystring;
exports.lowerCase = lowerCase;
exports.getTimestamp = getTimestamp;
exports.getNonceStr = getNonceStr;
