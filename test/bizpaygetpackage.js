var chai = require('chai');
var expect = chai.expect;
var request = require('supertest');
var muk = require('muk');
var connect = require('connect');
var sinon = require('sinon');
var template = require('./supporter').template;

var app = connect();

var APPID = "wxd930ea5d5a258f4f";
var PAYSIGNKEY = "L8LrMqqeGRxST5reouB0K66CaYAWpqhAVsq7ggKkxHCOastWksvuX1uvmvQclxaHoYd3ElNBrNO2DHnnzgfVG9Qs473M3DTOZug5er46FhuGofumV8H2FVR9qkjSlC5K";
var PARTNERID = '1900090055';
var PARTNERKEY = '8934e7d15453e97507ef794cf7b0519d';

var middleware = require('../lib/middleware');
var BizPayGetPackage = middleware.BizPayGetPackage;
var common = require('../lib/common');

var errorHandler = function (err, req, res, next) {
  if (err) {
    console.error(err);
  }
  res.writeHead(403);
  res.end(err.message);
};

describe('bizpaygetpackage', function () {
  var spy = sinon.spy();
  before(function () {
    app.use('/', BizPayGetPackage(APPID, PAYSIGNKEY, PARTNERID, PARTNERKEY)
      .done(function (message, req, res, next) {
        spy.apply(this, arguments);
        res.reply({
          bank_type: 'WX',
          fee_type: '1',
          body: 'XXX',
          input_charset: 'GBK',
          partner: '1900000109',
          total_fee: '1',
          spbill_create_ip: '127.0.0.1',
          out_trade_no: '16642817866003386000',
          notify_url: 'http://www.qq.com'
        }, {
          retcode: 0,
          reterrmsg: ''
        });
      })
    );
    app.use('/', errorHandler);
    muk(common, 'getTimestamp', function () {
      return "189026618";
    }),
    muk(common, 'getNonceStr', function () {
      return "adssdasssd13d";
    });
  });
  afterEach(function () {
    spy.reset();
  });
  after(function () {
    muk.restore();
  });
  it('defaults', function (done) {
    request(app)
      .post('/')
      .send(template.require('bizpaygetpackage'))
      .end(function (err, result) {
        expect(err).to.be.null;
        expect(result.text.trim()).to.be.deep.equal('\
<xml>\
<AppId><![CDATA[wxd930ea5d5a258f4f]]></AppId>\
<Package><![CDATA[bank_type=WX&body=XXX&fee_type=1&input_charset=GBK&notify_url=http%3a%2f%2fwww.qq.com&out_trade_no=16642817866003386000&partner=1900000109&spbill_create_ip=127.0.0.1&total_fee=1&sign=BEEF37AD19575D92E191C1E4B1474CA9]]></Package>\
<TimeStamp>189026618</TimeStamp>\
<NonceStr><![CDATA[adssdasssd13d]]></NonceStr>\
<RetCode>0</RetCode>\
<RetErrMsg><![CDATA[]]></RetErrMsg>\
<AppSignature><![CDATA[93419f8e3c6b433da66562d67af1a4abdb4e17ba]]></AppSignature>\
<SignMethod><![CDATA[sha1]]></SignMethod>\
</xml>'.trim());
        expect(spy.args[0][0]).to.be.deep.equal({
          OpenId: '111222',
          AppId: 'wxd930ea5d5a258f4f',
          IsSubscribe: '1',
          ProductId: '777111666',
          TimeStamp: '1369743908',
          NonceStr: 'YvMZOX28YQkoU1i4NdOnlXB1',
          AppSignature: 'a14032f7ada304378fa50e8d8d61dec95548b88a',
          SignMethod: 'sha1'
        });
        done();
      });
  });
});
