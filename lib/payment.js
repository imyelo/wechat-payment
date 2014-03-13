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

exports.Payment = Payment;
