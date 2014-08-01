var chai = require('chai');
var expect = chai.expect;
var muk = require('muk');

var Payment = require('../lib/payment').Payment;
var common = require('../lib/common');

describe('case', function () {
  describe('getWCPayRequest', function () {
    before(function () {
      muk(common, 'getTimestamp', function () {
        return "189026618";
      });
      muk(common, 'getNonceStr', function () {
        return "adssdasssd13d";
      });
    });
    after(function () {
      muk.restore();
    });
    it('should work', function () {
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
      var payment = new Payment(
        'wxf8b4f85f3a794e77',
        '2Wozy2aksie1puXUBpWD8oZxiD1DfQuEaiC7KcRATv1Ino3mdopKaPGQQ7TtkNySuAmCaDCrw4xhPY5qKTBl7Fzm0RgR3c0WaVYIXZARsxzHV2x7iwPPzOz94dnwPWSn',
        '1900090055',
        '8934e7d15453e97507ef794cf7b0519d'
        );
      expect(payment.getWCPayRequest(order)).to.be.deep.equal({
        'appId': 'wxf8b4f85f3a794e77',
        'timeStamp': '189026618',
        'nonceStr': 'adssdasssd13d',
        'package': 'bank_type=WX&body=XXX&fee_type=1&input_charset=GBK&notify_url=http%3a%2f%2fwww.qq.com&out_trade_no=16642817866003386000&partner=1900000109&spbill_create_ip=127.0.0.1&total_fee=1&sign=BEEF37AD19575D92E191C1E4B1474CA9',
        'paySign': '7717231c335a05165b1874658306fa431fe9a0de',
        'signType': 'SHA1'
      });
    });
  });
  describe('getNativePayRequest', function () {
    before(function () {
      muk(common, 'getTimestamp', function () {
        return "189026618";
      });
      muk(common, 'getNonceStr', function () {
        return "adssdasssd13d";
      });
    });
    after(function () {
      muk.restore();
    });
    it('should work', function () {
      var productId = "123456";
      var payment = new Payment(
        'wxf8b4f85f3a794e77',
        '2Wozy2aksie1puXUBpWD8oZxiD1DfQuEaiC7KcRATv1Ino3mdopKaPGQQ7TtkNySuAmCaDCrw4xhPY5qKTBl7Fzm0RgR3c0WaVYIXZARsxzHV2x7iwPPzOz94dnwPWSn',
        '1900090055',
        '8934e7d15453e97507ef794cf7b0519d'
        );
      expect(payment.getNativePayRequest(productId)).to.be.deep.equal({
        'productid': '123456',
        'appid': 'wxf8b4f85f3a794e77',
        'timestamp': '189026618',
        'noncestr': 'adssdasssd13d',
        'sign': '18c6122878f0e946ae294e016eddda9468de80df'
      });
    });
  });
  describe.only('getAppPayRequest', function () {
    before(function () {
      muk(common, 'getTimestamp', function () {
        return "1403603502";
      });
      muk(common, 'getNonceStr', function () {
        return "2014062465651751380051";
      });
    });
    after(function () {
      muk.restore();
    });
    it('sign should be 72CDBA945C97E13C18A9CA5B01EDCAD2 (gbk)', function () {
      var order = {
        bank_type: 'WX',
        fee_type: '1',
        body: '可乐1杯',
        input_charset: 'GBK',
        partner: '1900090055',
        total_fee: '300',
        spbill_create_ip: '192.168.1.1',
        out_trade_no: '201408010123456789',
        notify_url: 'http://foo.bar/path/to'
      };
      var payment = new Payment(
        'wxf8b4f85f3a794e77',
        '2Wozy2aksie1puXUBpWD8oZxiD1DfQuEaiC7KcRATv1Ino3mdopKaPGQQ7TtkNySuAmCaDCrw4xhPY5qKTBl7Fzm0RgR3c0WaVYIXZARsxzHV2x7iwPPzOz94dnwPWSn',
        '1900090055',
        '8934e7d15453e97507ef794cf7b0519d'
        );
      expect(payment.getPackage(order, {signOnly: true})).to.be.equal('72CDBA945C97E13C18A9CA5B01EDCAD2');
    });
    it('should work', function () {
      var order = {
        bank_type: 'WX',
        fee_type: '1',
        body: '可乐1杯',
        input_charset: 'GBK',
        partner: '1900090055',
        total_fee: '300',
        spbill_create_ip: '192.168.1.1',
        out_trade_no: '201408010123456789',
        notify_url: 'http://foo.bar/path/to'
      };
      var payment = new Payment(
        'wxf8b4f85f3a794e77',
        '2Wozy2aksie1puXUBpWD8oZxiD1DfQuEaiC7KcRATv1Ino3mdopKaPGQQ7TtkNySuAmCaDCrw4xhPY5qKTBl7Fzm0RgR3c0WaVYIXZARsxzHV2x7iwPPzOz94dnwPWSn',
        '1900090055',
        '8934e7d15453e97507ef794cf7b0519d'
        );
      expect(payment.getAppPayRequest('581914', order)).to.be.deep.equal({
        'appid': 'wxf8b4f85f3a794e77',
        'noncestr': '2014062465651751380051',
        'package': 'Sign=WXPay',
        'app_signature': '22542411bbfd8c9c6932314cdf111a329a49263d',
        'partnerid': '1900090055',
        'prepayid': '581914',
        'timestamp': '1403603502'
      });
    });
  });
  describe.skip('validateNativePayGetPackage', function () {
    it('should work', function () {
      var params = {
        OpenId: '111222',
        AppId: 'wxf8b4f85f3a794e77',
        IsSubscribe: '1',
        ProductId: '777111666',
        TimeStamp: '1369743908',
        NonceStr: 'YvMZOX28YQkoU1i4NdOnlXB1',
        AppSignature: 'a9274e4032a0fec8285f147730d88400392acb9e'
      };
      var payment = new Payment(
        'wxf8b4f85f3a794e77',
        '2Wozy2aksie1puXUBpWD8oZxiD1DfQuEaiC7KcRATv1Ino3mdopKaPGQQ7TtkNySuAmCaDCrw4xhPY5qKTBl7Fzm0RgR3c0WaVYIXZARsxzHV2x7iwPPzOz94dnwPWSn',
        '1900090055',
        '8934e7d15453e97507ef794cf7b0519d'
        );
      expect(payment.validateNativePayGetPackage(params)).to.be.true;
    });
  });
  describe.skip('getDeliverNotify', function () {
    it('should work', function () {
      var params = {
        "openid" : "oX99MDgNcgwnz3zFN3DNmo8uwa-w",
        "transid" : "111112222233333",
        "out_trade_no" : "555666uuu",
        "deliver_timestamp" : "1369745073",
        "deliver_status" : "1",
        "deliver_msg" : "ok",
      };
      var payment = new Payment(
        'wwwwb4f85f3a797777',
        '2Wozy2aksie1puXUBpWD8oZxiD1DfQuEaiC7KcRATv1Ino3mdopKaPGQQ7TtkNySuAmCaDCrw4xhPY5qKTBl7Fzm0RgR3c0WaVYIXZARsxzHV2x7iwPPzOz94dnwPWSn',
        '1900090055',
        '8934e7d15453e97507ef794cf7b0519d'
        );
      expect(payment.getDeliverNotify(params)['app_signature']).to.be.equal('53cca9d47b883bd4a5c85a9300df3da0cb48565c');
    });
  });
  describe.skip('validateAlarmAppSignature', function () {
    it('should work', function () {
      var params = {
        AppId: 'wxf8b4f85f3a794e77',
        ErrorType: '1001',
        Description: '错误描述',
        AlarmContent: '错误详情',
        TimeStamp: '1393860740',
        AppSignature: 'f8164781a303f4d5a944a2dfc68411a8c7e4fbea',
        SignMethod: 'sha1'
      };
      var payment = new Payment(
        'wxf8b4f85f3a794e77',
        '2Wozy2aksie1puXUBpWD8oZxiD1DfQuEaiC7KcRATv1Ino3mdopKaPGQQ7TtkNySuAmCaDCrw4xhPY5qKTBl7Fzm0RgR3c0WaVYIXZARsxzHV2x7iwPPzOz94dnwPWSn',
        '1900090055',
        '8934e7d15453e97507ef794cf7b0519d'
        );
      expect(payment.validateAlarmAppSignature(params)).to.be.true;
    });
  });
});
