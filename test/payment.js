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
      }),
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
      }),
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
});
