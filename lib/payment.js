var md5 = require('md5');
var sha1 = require('sha1');
var _ = require('./_');
var cm = require('./common');

var Payment = function (appId, paySignKey, partnerId, partnerKey) {
  this.appId = appId;
  this.paySignKey = paySignKey;
  this.partnerId = partnerId;
  this.partnerKey = partnerKey;
  return this;
};

Payment.prototype.autoFill = function (obj) {
  return cm.autoFillString(obj, {
    appid: this.appId,
    appId: this.appId,
    appkey: this.paySignKey,
    appKey: this.paySignKey,
    partnerid: this.partnerId,
    timestamp: cm.getTimestamp,
    timeStamp: cm.getTimestamp,
    noncestr: cm.getNonceStr,
    nonceStr: cm.getNonceStr,
    signtype: 'SHA1',
    signType: 'SHA1',
    signmethod: 'sha1',
    sign_method: 'sha1',
  });
};

Payment.prototype.getPackage = function (params, options) {
  options = _.defaults((options = options || {}), {
    signOnly: false
  });
  var sorted = cm.sortByKeyCap(params);
  var sign = md5(cm.gbk(cm.toQuerystring(sorted) + '&key=' + this.partnerKey)).toUpperCase();
  return options.signOnly ? sign : cm.toQuerystring(sorted, {
    value: cm.encodeURIComponentWithLowerCase
  }) + '&sign=' + sign;
};

Payment.prototype.getPaySign = function (params, options) {
  var tmp;
  options = _.defaults((options = options || {}), {
    querystring: true
  });
  tmp = this.autoFill(params);
  tmp = cm.sortByKeyCap(tmp);
  if (options.querystring) {
    tmp = cm.toQuerystring(tmp, {
      'key': cm.lowerCase
    });
  }
  return sha1(tmp);
};

// reference to payment api document 2.5
Payment.prototype.getWCPayRequest = function (order) {
  var result;
  cm.required(order, [
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
  result['paySign'] = this.getPaySign(_.assign(result, {appKey: true}));
  return this.autoFill(_.assign(result, {signType: true}));
};

// reference to payment api document 3.4
Payment.prototype.getNativePayRequest = function (productId) {
  var result;
  result = this.autoFill({
    productid: productId,
    appid: true,
    timestamp: true,
    noncestr: true
  });
  result['sign'] = this.getPaySign(_.assign(result, {appkey: true}));
  return result;
};

// reference to payment api document 3.6 (1)
// beta
Payment.prototype.validateNativePayGetPackage = function (params) {
  var keys = [
    'appid',
    'productid',
    'timestamp',
    'noncestr',
    'openid',
    'issubscribe'
  ];
  var lows = cm.toLowerCaseKeys(params);
  var result;
  cm.required(lows, keys);
  result = cm.filterByKeys(lows, keys);
  return lows['appsignature'] === this.getPaySign(_.assign(result, {appkey: true}));
};

// reference to payment api document 3.6 (2)
// beta
Payment.prototype.responseNativePayGetPackage = function (order, ret) {
  var result;
  cm.required(order, [
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
  cm.required(ret, [
    'retcode',
    'reterrmsg',
    ]);
  result = this.autoFill(_.assign(ret, {
    appid: true,
    timestamp: true,
    noncestr: true
  }));
  result['package'] = this.getPackage(order);
  result['appsignature'] = this.getPaySign(_.assign(result, {appkey: true}));
  return this.autoFill(_.assign(result, {signmethod: true}));
};

// reference to payment api document 4.3
// beta
Payment.prototype.validateNotifyAppSignature = function (params) {
  var keys = [
    'appid',
    'timestamp',
    'noncestr',
    'openid',
    'issubscribe'
  ];
  var lows = cm.toLowerCaseKeys(params);
  var result;
  cm.required(lows, keys);
  result = cm.filterByKeys(lows, keys);
  return lows['appsignature'] === this.getPaySign(_.assign(result, {appkey: true}));
};

// reference to payment api document 4.5
// beta
Payment.prototype.validateNotifySign = function (params) {
  var noEmpty = _.filter(params, function (val, key) {
    return !!val && key !== 'sign';
  });
  return params['sign'] === this.getPackage(noEmpty, {signOnly: true});
};

// reference to payment api document 5.3.1
// beta
Payment.prototype.getDeliverNotify = function (params) {
  var result = {};
  cm.required(params, [
    'openid',
    'transid',
    'out_trade_no',
    'deliver_timestamp',
    'deliver_status',
    'deliver_msg',
    ]);
  result = this.autoFill(_.assign(params, {
    appid: true,
  }));
  result['app_signature'] = this.getPaySign(_.assign(result, {appkey: true}));
  return this.autoFill(_.assign(result, {sign_method: true}));
};

// reference to payment api document 5.3.2
// beta
Payment.prototype.getOrderQuery = function (orderId) {
  var result = {};
  result = this.autoFill({
    appid: true,
    timestamp: true
  });
  result['package'] = this.getPackage(this.autoFill(_.assign({
    out_trade_no: orderId
  }, {partnerId: true})));
  result['app_signature'] = this.getPaySign(_.assign(result, {appkey: true}));
  return this.autoFill(_.assign(result, {sign_method: true}));
};

// reference to payment api document 5.3.3
// beta
Payment.prototype.validateAlarmAppSignature = function (params) {
  var keys = [
    'appid',
    'errortype',
    'description',
    'alarmcontent',
    'timestamp',
    ];
  var lows = cm.toLowerCaseKeys(params);
  var result;
  cm.required(lows, keys);
  result = cm.filterByKeys(lows, keys);
  return lows['appsignature'] === this.getPaySign(_.assign(result, {appkey: true}));
};

// reference to payment kf api document 2.2
Payment.prototype.validatePayFeedBackAppSignature = function (params) {
  var keys = [
    'appid',
    'timestamp',
    'openid'
  ];
  var lows = cm.toLowerCaseKeys(params);
  var result;
  cm.required(lows, keys);
  result = cm.filterByKeys(lows, keys);
  return lows['appsignature'] === this.getPaySign(_.assign(result, {appkey: true}));
};

// reference to payment app api document 
Payment.prototype.getAppPayRequest = function (prepayId) {
  var result;
  result = this.autoFill({
    prepayid: prepayId,
    appid: true,
    timestamp: true,
    noncestr: true,
    partnerid: true,
    package: 'Sign=WXPay',
  });
  result['app_signature'] = this.getPaySign(_.assign(result, {appkey: true}));
  return result;
};


exports.Payment = Payment;
