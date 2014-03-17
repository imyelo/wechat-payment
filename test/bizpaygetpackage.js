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
        res.end('');
      })
    );
    app.use('/', errorHandler);
  });
  afterEach(function () {
    spy.reset();
  });
  it('request', function (done) {
    request(app)
      .post('/')
      .send(template.require('bizpaygetpackage'))
      .end(function (err, result) {
        expect(err).to.be.null;
        expect(result.text).to.be.empty;
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
