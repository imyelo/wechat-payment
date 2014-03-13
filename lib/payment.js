var md5 = require('MD5');
var sha1 = require('sha1');
var _ = require('./_');
var cm = require('./common');

var getPackage = function (params, partnerKey) {
  var sorted = cm.sortByKeyCap(params)
  var sign = md5(cm.toQuerystring(sorted) + '&key=' + partnerKey).toUpperCase();
  return cm.toQuerystring(sorted, {
    value: cm.encodeURIComponentWithLowerCase
  }) + '&sign=' + sign;
};

var Payment = function (appId, paySignKey, partnerKey) {
  this.appId = appId;
  this.paySignKey = paySignKey;
  this.partnerKey = partnerKey;
  return this;
};

Payment.prototype.getPackage = function (params, options) {
  var sorted = cm.sortByKeyCap(params)
  var sign = md5(cm.toQuerystring(sorted) + '&key=' + this.partnerKey).toUpperCase();
  return cm.toQuerystring(sorted, {
    value: cm.encodeURIComponentWithLowerCase
  }) + '&sign=' + sign;
};

Payment.prototype.autoFill = function (obj) {
  return cm.autoFillString(obj, {
    appId: this.appId,
    appKey: this.paySignKey,
    timeStamp: cm.getTimestamp,
    nonceStr: cm.getNonceStr,
    signType: 'SHA1'
  });
};

Payment.prototype.getPayRequest = function (order) {
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

Payment.prototype.getPaymentRequestPackage = function (params) {
  cm.required(params, [
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
  tmp = cm.sortByKeyCap(tmp);
  if (options.querystring) {
    tmp = cm.toQuerystring(tmp, {
    'key': cm.lowerCase
    });
  }
  return sha1(tmp);
};

exports.Payment = Payment;
