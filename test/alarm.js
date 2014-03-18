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
var Alarm = middleware.Alarm;
var common = require('../lib/common');

var errorHandler = function (err, req, res, next) {
  if (err) {
    console.error(err);
  }
  res.writeHead(403);
  res.end(err.message);
};

describe('alarm', function () {
  var spy = sinon.spy();
  before(function () {
    app.use('/', Alarm(APPID, PAYSIGNKEY, PARTNERID, PARTNERKEY)
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
  it('defaults', function (done) {
    request(app)
      .post('/')
      .send(template.require('alarm'))
      .end(function (err, result) {
        expect(err).to.be.null;
        expect(result.text).to.be.deep.equal('');
        expect(spy.args[0][0]).to.be.deep.equal({
          AppId: 'wxd930ea5d5a258f4f',
          ErrorType: '1001',
          Description: '错误描述',
          AlarmContent: '错误详情',
          TimeStamp: '1393860740',
          AppSignature: 'a7fdeb6930a2a070da542d2da9c674a55d10972c',
          SignMethod: 'sha1'
        });
        done();
      });
  });
});
