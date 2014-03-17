var xml2js = require('xml2js');
var BufferHelper = require('bufferhelper');
var Payment = require('./payment').Payment;
var _ = require('./_');


/*!
 * 从微信的提交中提取XML文件
 * function cloned from JacksonTian/wechat
 * <https://github.com/node-webot/wechat/blob/master/lib/wechat.js>
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
 * function cloned from JacksonTian/wechat
 * <https://github.com/node-webot/wechat/blob/master/lib/wechat.js>
 */
var isEmpty = function (thing) {
  return typeof thing === "object" && (thing != null) && Object.keys(thing).length === 0;
};

/*!
 * 将xml2js解析出来的对象转换成直接可访问的对象
 * function cloned from JacksonTian/wechat
 * <https://github.com/node-webot/wechat/blob/master/lib/wechat.js>
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
 * 扩展对象，用于实现继承
 */
var extend = function (obj, exts) {
  _.each(Array.prototype.slice.call(arguments, 1), function (arg) {
    _.each(arg, function (val, key) {
      obj[key] = val;
    });
  });
  return obj;
};

/**
 * 中间件基础类
 * @class Basic
 * @constructor
 * @param {String} appid      
 * @param {String} paysignkey appkey
 * @param {String} partnerid  
 * @param {String} partnerkey 
 * @chainable
 */
var Basic = function (appid, paysignkey, partnerid, partnerkey) {
  this.payment = new Payment(appid, paysignkey, partnerid, partnerkey);
  return this;
};
/**
 * 预期的消息类型
 * @property types
 * @for Basic
 * @type {Array}
 */
Basic.prototype.types = [];
/**
 * 校验器
 * @property types
 * @for Basic
 * @type {Function}
 */
Basic.prototype.validator = function () {};
/**
 * 完成中间件配置，并返回中间件
 * @method done
 * @for Basic
 * @chainable
 * @param  {Function} [handler] 默认处理方法
 */
Basic.prototype.done = function (handler) {
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
      if (self.hasType(type = message.MsgType)) {
        if (typeof self.handler[type] === 'function') {
          return self.handler[type](message, req, res, next);
        }
      }
      if (typeof handler === 'undefined') {
        return next(new Error('Unexpect Message Type'));
      }
      handler(message, req, res, next);
    });
  };
};
/**
 * 校验AppSignature是否有效
 * @method checkAppSignature
 * @for Basic
 * @param  {Object} message json格式的消息对象
 * @return {Boolean} 
 */
Basic.prototype.checkAppSignature = function (message) {
  try {
    if (this.validator(message)) {
      return true;
    }
  } catch (e) {}
  return false;
};
/**
 * 校验是否为预期的消息类型
 * @method hasType
 * @for Basic
 * @param  {String}  type 输入的消息类型
 * @return {Boolean}
 */
Basic.prototype.hasType = function (type) {
  return this.types.indexOf(type) > -1;
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
  Basic.call(this, appid, paysignkey, partnerid, partnerkey);
  this.handler = [];
  return this;
};
/**
 * 预期的消息类型
 * @property types
 * @for PayFeedback
 * @type {Array}
 */
/**
 * 校验器
 * @property types
 * @for PayFeedback
 * @type {Function}
 */
/**
 * 完成中间件配置，并返回中间件
 * @method done
 * @for PayFeedback
 * @chainable
 * @param  {Function} [other] 非预期类型消息的处理方法
 */
/**
 * 校验AppSignature是否有效
 * @method checkAppSignature
 * @for PayFeedback
 * @param  {Object} message json格式的消息对象
 * @return {Boolean} 
 */
/**
 * 校验是否为预期的消息类型
 * @method hasType
 * @for PayFeedback
 * @param  {String}  type 输入的消息类型
 * @return {Boolean}
 */
extend(PayFeedback.prototype, Basic.prototype, {
  types: ['request', 'confirm', 'reject'],
  validator: function (message) {
    return this.payment.validatePayFeedBackAppSignature(message);
  }
});
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
_.each(PayFeedback.prototype.types, function (type) {
  PayFeedback.prototype[type] = function (handler) {
    this.handler[type] = handler;
    return this;
  };
});

/**
 * 原生支付回调商户获取订单Package中间件
 * @class BizPayGetPackage
 * @constructor
 * @param {String} appid      
 * @param {String} paysignkey appkey
 * @param {String} partnerid  
 * @param {String} partnerkey 
 * @chainable
 */
var BizPayGetPackage = function (appid, paysignkey, partnerid, partnerkey) {
  if (!(this instanceof BizPayGetPackage)) {
    return new BizPayGetPackage(appid, paysignkey, partnerid, partnerkey);
  }
  Basic.call(this, appid, paysignkey, partnerid, partnerkey);
  return this;
};

/**
 * 预期的消息类型
 * @property types
 * @for BizPayGetPackage
 * @type {Array}
 */
/**
 * 校验器
 * @property types
 * @for BizPayGetPackage
 * @type {Function}
 */
/**
 * 完成中间件配置，并返回中间件
 * @method done
 * @for BizPayGetPackage
 * @chainable
 * @param  {Function} [other] 默认处理方法
 */
/**
 * 校验AppSignature是否有效
 * @method checkAppSignature
 * @for BizPayGetPackage
 * @param  {Object} message json格式的消息对象
 * @return {Boolean} 
 */
/**
 * 校验是否为预期的消息类型
 * @method hasType
 * @for BizPayGetPackage
 * @param  {String}  type 输入的消息类型
 * @return {Boolean}
 */
extend(BizPayGetPackage.prototype, Basic.prototype, {
  types: [],
  validator: function (message) {
    return this.payment.validateNativePayGetPackage(message);
  }
});

var middleware = function (appid, paysignkey, partnerid, partnerkey) {
  return {
    getPayFeedback: function () {
      return new PayFeedback(appid, paysignkey, partnerid, partnerkey);
    },
    getBizPayGetPackage: function () {
      return new BizPayGetPackage(appid, paysignkey, partnerid, partnerkey);
    }
  }
};
middleware.PayFeedback = PayFeedback;
middleware.BizPayGetPackage = BizPayGetPackage;

module.exports = middleware;
