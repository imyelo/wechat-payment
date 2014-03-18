var chai = require('chai');
var expect = chai.expect;
var request = require('supertest');
var muk = require('muk');
var connect = require('connect');
var sinon = require('sinon');
var template = require('./supporter').template;

var app = connect();
app.use(connect.query());

var APPID = "wxd930ea5d5a258f4f";
var PAYSIGNKEY = "L8LrMqqeGRxST5reouB0K66CaYAWpqhAVsq7ggKkxHCOastWksvuX1uvmvQclxaHoYd3ElNBrNO2DHnnzgfVG9Qs473M3DTOZug5er46FhuGofumV8H2FVR9qkjSlC5K";
var PARTNERID = '1900090055';
var PARTNERKEY = '8934e7d15453e97507ef794cf7b0519d';

var middleware = require('../lib/middleware');
var Notify = middleware.Notify;

var errorHandler = function (err, req, res, next) {
  if (err) {
    console.error(err);
  }
  res.writeHead(403);
  res.end(err.message);
};

describe('notify', function () {
  var spy = sinon.spy();
  before(function () {
    app.use('/', Notify(APPID, PAYSIGNKEY, PARTNERID, PARTNERKEY)
      .done(function (message, req, res, next) {
        spy.apply(this, arguments);
        res.reply();
      })
    );
    app.use('/', errorHandler);
  });
  afterEach(function () {
    spy.reset();
  });
  it('success', function (done) {
    request(app)
      .post('/')
      .query({
        bank_billno: '206064184488',
        bank_type: '0',
        discount: '0',
        fee_type: '1',
        input_charset: 'GBK',
        notify_id: 'WE37gwCoFBcAKdkH34Y1nW94r_vao2ljmwE3oAHEeAP690xSVhRleOMfhsgjwVGDpluT -vdS79kbDbkDnjYg4qsmTdSjuJxl',
        out_trade_no: '843254536943809900',
        partner: '1900000109',
        product_fee: '1',
        sign_type: 'MD5',
        time_end: '20130606015331',
        total_fee: '1',
        trade_mode: '1',
        trade_state: '0',
        transaction_id: '1900000109201306060282555397',
        transport_fee: '0',
        sign: '9EBF3EFE9CEFAF3111020DB5CAD6EE82'
      })
      .send(template.require('notify'))
      .end(function (err, result) {
        expect(err).to.be.null;
        expect(result.text).to.be.deep.equal('success');
        expect(spy.args[0][0]).to.be.deep.equal({
          OpenId: '111222',
          AppId: 'wxd930ea5d5a258f4f',
          IsSubscribe: '1',
          TimeStamp: '1369743511',
          NonceStr: 'jALldRTHAFd5Tgs5',
          AppSignature: '4d117f7f0f4885a995a05eafbc9a405782d03bc5',
          SignMethod: 'sha1'
        });
        done();
      });
  });
});
