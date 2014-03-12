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
  return exports;
})();

var required = function (obj, keys) {
  _.each(keys, function (k) {
    if (isUndefined(obj[key])) {
      throw new Error(k + 'is required');
    }
  });
};

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

var encodeURIComponentWithLowerCase = function (str) {
  return encodeURIComponent(str).replace(/\%[0-9A-F]{2}/g, function (s) {
    return s.replace(/[A-F]/g, function (c) {
      return String.fromCharCode(c.charCodeAt(0) + 32);
    });
  });
};

var toQuerystring = function (obj, wrapper) {
  var result = '';
  var key;
  wrapper = _.defaults((wrapper = wrapper || {}), {
    key: null,
    value: null
  });
  exports.each(obj, function (val, key) {
    result += [
      _.isFunction(wrapper.key) ? wrapper.key(key) : key,
     '=',
     _.isFunction(wrapper.value) ? wrapper.value(val) : val,
     '&',
     ].join('');
  })
  return result.slice(0, -1);
};

var lowerCase = function (str) {
  return str.toLowerCase();
};

var getTimestamp = function () {
  return +(new Date()) + '';
};

var getNonceStr = function () {
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var maxPos = chars.length;
  var noceStr = "";
  var i;
  for (i = 0; i < 32; i++) {
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

var getPaySign = function (params) {
  return sha1(toQuerystring(sortByKeyCap(params), {
    key: lowerCase
  }));
};

var Payment = function (appId, paySignKey, partnerKey) {
  this.appId = appId;
  this.paySignKey = paySignKey;
  this.partnerKey = partnerKey;
  return this;
};

Payment.prototype.getPackage = function (params) {
  required(params, [
    'bank_type',
    'body',
    'parnter',
    'out_trade_no',
    'total_fee',
    'fee_type',
    'notify_url',
    'spbill_create_ip',
    'input_charset'
    ]);
  return getPackage(params, this.partnerKey);
};

Payment.prototype.getPaySign = function (params) {
  return getPaySign(params);
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
}
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
  'appId': payment.appId,
  'timeStamp': getTimestamp(),
  'nonceStr': getNonceStr(),
  'package': payment.getPackage(order),
  'appKey': payment.appKey
};


exports._ = _;
exports.sortByKeyCap = sortByKeyCap;
