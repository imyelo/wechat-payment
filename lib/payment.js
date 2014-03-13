var md5 = require('MD5');
var sha1 = require('sha1');

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
  exports.defaults = function (options, defaults) {
    var result = {};
    exports.each(defaults, function (val, key) {
      result[key] = val;
    });
    exports.each(options, function (val, key) {
      result[key] = val;
    });
    return result;
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
 *   toQueryString({
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
  // return "189026618";
  return +(new Date()) + '';
};

/**
 * get nonce string
 * @param {number} [length=32] the string length
 * @return {string}
 */
var getNonceStr = function (length) {
  // return "adssdasssd13d";
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var maxPos = chars.length;
  var noceStr = "";
  var i;
  for (i = 0; i < (length || 32); i++) {
      noceStr += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return noceStr;
};

var getPackage = function (params, partnerKey) {
  var sorted = sortByKeyCap(params)
  var sign = md5(toQuerystring(sorted) + '&key=' + partnerKey).toUpperCase();
  return toQuerystring(sorted, {
    value: encodeURIComponentWithLowerCase
  }) + '&sign=' + sign;
};

var Payment = function (appId, paySignKey, partnerKey) {
  this.appId = appId;
  this.paySignKey = paySignKey;
  this.partnerKey = partnerKey;
  return this;
};

Payment.prototype.getPackage = function (params, options) {
  var sorted = sortByKeyCap(params)
  var sign = md5(toQuerystring(sorted) + '&key=' + this.partnerKey).toUpperCase();
  return toQuerystring(sorted, {
    value: encodeURIComponentWithLowerCase
  }) + '&sign=' + sign;
};

Payment.prototype.autoFill = function (obj) {
  return autoFillString(obj, {
    appId: this.appId,
    appKey: this.paySignKey,
    timeStamp: getTimestamp,
    nonceStr: getNonceStr,
    signType: 'SHA1'
  });
};

Payment.prototype.getPayRequest = function (order) {
  var result;
  required(order, [
    'bank_type',
    'body',
    'partner',
    'out_trade_no',
    'total_fee',
    'fee_type',
    'notify_url',
    'spbill_create_ip',
    'input_charset'
    ]);
  result = this.autoFill({
    appId: true,
    timeStamp: true,
    nonceStr: true
  });
  result['package'] = this.getPackage(order);
  result['paySign'] = this.getPaySign(_.defaults(result, {appKey: true}));
  return this.autoFill(_.defaults(result, {signType: true}));
};

Payment.prototype.getPaymentRequestPackage = function (params) {
  required(params, [
    'bank_type',
    'body',
    'partner',
    'out_trade_no',
    'total_fee',
    'fee_type',
    'notify_url',
    'spbill_create_ip',
    'input_charset'
    ]);
  return this.getPackage(params, this.partnerKey);
};

Payment.prototype.getPaySign = function (params, options) {
  var tmp;
  options = _.defaults((options = options || {}), {
    querystring: true
  });
  tmp = this.autoFill(params);
  tmp = sortByKeyCap(tmp);
  if (options.querystring) {
    tmp = toQuerystring(tmp, {
    'key': lowerCase
    });
  }
  return sha1(tmp);
};

var order = {
  bank_type: 'WX',
  fee_type: '1',
  body: 'XXX',
  input_charset: 'GBK',
  partner: '1900000109',
  total_fee: '1',
  spbill_create_ip: '127.0.0.1',
  out_trade_no: '16642817866003386000',
  notify_url: 'http://www.qq.com'
};
// var info = {
//   "appId":"wxf8b4f85f3a794e77",
//   "timeStamp":"189026618",
//   "nonceStr":"adssdasssd13d",
//   // "package":"bank_type=WX&body=XXX&fee_type=1&input_charset=GBK&notify_url=http%3a%2f%2fwww.qq.com&out_trade_no=16642817866003386000&partner=1900000109&spbill_create_ip=127.0.0.1&total_fee=1&sign=BEEF37AD19575D92E191C1E4B1474CA9",
//   "appKey":"2Wozy2aksie1puXUBpWD8oZxiD1DfQuEaiC7KcRATv1Ino3mdopKaPGQQ7TtkNySuAmCaDCrw4xhPY5qKTBl7Fzm0RgR3c0WaVYIXZARsxzHV2x7iwPPzOz94dnwPWSn"
// };
// console.log(info['package'] = getPackage(order, '8934e7d15453e97507ef794cf7b0519d'));
// console.log(getPaySign(info));

var payment = new Payment(
  'wxf8b4f85f3a794e77',
  '2Wozy2aksie1puXUBpWD8oZxiD1DfQuEaiC7KcRATv1Ino3mdopKaPGQQ7TtkNySuAmCaDCrw4xhPY5qKTBl7Fzm0RgR3c0WaVYIXZARsxzHV2x7iwPPzOz94dnwPWSn',
  '8934e7d15453e97507ef794cf7b0519d'
  );
var info = {
  'appId': true,
  'timeStamp': "189026618",
  'nonceStr': "adssdasssd13d",
  'package': payment.getPackage(order),
  'appKey': true
};

console.log(payment.getPayRequest(order));

exports._ = _;
exports.sortByKeyCap = sortByKeyCap;
