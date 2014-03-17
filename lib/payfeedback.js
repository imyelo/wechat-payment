var xml2js = require('xml2js');
var BufferHelper = require('bufferhelper');
var Payment = require('./payment').Payment;
var _ = require('./_');

var TYPES = ['request', 'confirm', 'reject'];

/**
 * basic functions from JacksonTian/wechat
 * <https://github.com/node-webot/wechat/blob/master/lib/wechat.js>
 */
/*!
 * 从微信的提交中提取XML文件
 */
var getMessage = function (stream, callback) {
  var buf = new BufferHelper();
  buf.load(stream, function (err, buf) {
    if (err) {
      return callback(err);
    }
    var xml = buf.toString('utf-8');
    xml2js.parseString(xml, {trim: true}, callback);
  });
};

/*!
 * 检查对象是否为空，对xml2js的workaround
 */
var isEmpty = function (thing) {
  return typeof thing === "object" && (thing != null) && Object.keys(thing).length === 0;
};

/*!
 * 将xml2js解析出来的对象转换成直接可访问的对象
 */
var formatMessage = function (result) {
  var message = {};
  for (var key in result.xml) {
    var val = result.xml[key][0];
    message[key] = (isEmpty(val) ? '' : val).trim();
  }
  return message;
};

/**
 * 用户维权通知接口中间件
 * @class PayFeedback
 * @constructor
 * @param {String} appid      
 * @param {String} paysignkey appkey
 * @param {String} partnerid  
 * @param {String} partnerkey 
 * @chainable
 */
var PayFeedback = function (appid, paysignkey, partnerid, partnerkey) {
  if (!(this instanceof PayFeedback)) {
    return new PayFeedback(appid, paysignkey, partnerid, partnerkey);
  }
  this.payment = new Payment(appid, paysignkey, partnerid, partnerkey);
  this.handler = [];
  return this;
};

/**
 * 完成中间件配置
 * @method done
 * @for PayFeedback
 * @chainable
 * @param  {Function} [other] 非预期类型消息的处理方法
 */
PayFeedback.prototype.done = function (other) {
  var self = this;
  return function (req, res, next) {
    if (req.method !== 'POST') {
      return next(new Error('Not Implemented'));
    }
    getMessage(req, function (err, result) {
      var message, type;
      if (err) {
        err.name = 'BadMessage' + err.name;
        return next(err);
      }
      message = formatMessage(result);
      if (message.AppId !== self.payment.appId) {
        return next(new Error('Unexpect AppId'));
      }
      if (!self.checkAppSignature(message)) {
        return next(new Error('Invalid signature'));
      }
      res.wechat = message;
      if (TYPES.indexOf(type = message.MsgType) > -1) {
        return self.handler[type](message, req, res, next);
      }
      if (typeof other === 'undefined') {
        return next(new Error('Unexpect Message Type'));
      }
      other(message, req, res, next);
    });
  };
  return this;
};

/**
 * 校验AppSignature是否有效
 * @method checkAppSignature
 * @for PayFeedback
 * @param  {Object} message json格式的消息对象
 * @return {Boolean} 
 */
PayFeedback.prototype.checkAppSignature = function (message) {
  try {
    if (this.payment.validatePayFeedBackAppSignature(message)) {
      return true;
    }
  } catch (e) {
  }
  // return true;
  return false;
};

/**
 * 配置新增投诉的中间件
 * @method request
 * @for PayFeedback
 * @chainable
 * @param  {Function} handler 接收到新增投诉的处理方法
 */
/**
 * 配置用户确认消除投诉的中间件
 * @method confirm
 * @for PayFeedback
 * @chainable
 * @param  {Function} handler 接收到用户确认消除投诉的处理方法
 */
 /**
 * 配置用户拒绝消除投诉的中间件
 * @method reject
 * @for PayFeedback
 * @chainable
 * @param  {Function} handler 接收到用户拒绝消除投诉的处理方法
 */
_.each(TYPES, function (type) {
  PayFeedback.prototype[type] = function (handler) {
    this.handler[type] = handler;
    return this;
  };
});

module.exports = PayFeedback;
