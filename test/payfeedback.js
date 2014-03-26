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
var PayFeedback = middleware.PayFeedback;

var errorHandler = function (err, req, res, next) {
  if (err) {
    console.error(err);
  }
  res.writeHead(403);
  res.end(err.message);
};

describe('payfeedback', function () {
  var spies = {
    request: sinon.spy(),
    confirm: sinon.spy(),
    reject: sinon.spy(),
    other: sinon.spy()
  };
  before(function () {
    app.use('/', PayFeedback(APPID, PAYSIGNKEY, PARTNERID, PARTNERKEY)
      .request(function (message, req, res, next) {
        spies.request.apply(this, arguments);
        res.reply();
      })
      .confirm(function (message, req, res, next) {
        spies.confirm.apply(this, arguments);
        res.reply();
      })
      .reject(function (message, req, res, next) {
        spies.reject.apply(this, arguments);
        res.reply();
      })
      .done(function (message, req, res, next) {
        spies.other.apply(this, arguments);
        res.reply();
      })
    );
    app.use('/', errorHandler);
  });
  afterEach(function () {
    spies.request.reset();
    spies.confirm.reset();
    spies.reject.reset();
    spies.other.reset();
  });
  it('request', function (done) {
    request(app)
      .post('/')
      .send(template.require('request'))
      .end(function (err, result) {
        expect(err).to.be.null;
        expect(result.text).to.be.empty;
        expect(spies.request.args[0][0]).to.be.deep.equal({
          OpenId: '111222',
          AppId: 'wxd930ea5d5a258f4f',
          TimeStamp: '1369743511',
          MsgType: 'request',
          FeedBackId: '5883726847655944563',
          TransId: '10123312412321435345',
          Reason: '商品质量有问题',
          Solution: '补发货给我',
          ExtInfo: '明天六点前联系我 18610847266',
          AppSignature: 'b6f95a2368dd81952c4d7198e5102acd1fdd601a',
          SignMethod: 'sha1'
        });
        expect(spies.confirm.called).to.be.false;
        expect(spies.reject.called).to.be.false;
        expect(spies.other.called).to.be.false;
        done();
      });
  });
  it('confirm', function (done) {
    request(app)
      .post('/')
      .send(template.require('confirm'))
      .end(function (err, result) {
        expect(err).to.be.null;
        expect(result.text).to.be.empty;
        expect(spies.request.called).to.be.false;
        expect(spies.confirm.args[0][0]).to.be.deep.equal({
          OpenId: '111222',
          AppId: 'wxd930ea5d5a258f4f',
          TimeStamp: '1369743511',
          MsgType: 'confirm',
          FeedBackId: '5883726847655944563',
          Reason: '商品质量有问题',
          AppSignature: 'b6f95a2368dd81952c4d7198e5102acd1fdd601a',
          SignMethod: 'sha1'
        });
        expect(spies.reject.called).to.be.false;
        expect(spies.other.called).to.be.false;
        done();
      });
  });
  it('reject', function (done) {
    request(app)
      .post('/')
      .send(template.require('reject'))
      .end(function (err, result) {
        expect(err).to.be.null;
        expect(result.text).to.be.empty;
        expect(spies.request.called).to.be.false;
        expect(spies.confirm.called).to.be.false;
        expect(spies.reject.args[0][0]).to.be.deep.equal({
          OpenId: '111222',
          AppId: 'wxd930ea5d5a258f4f',
          TimeStamp: '1369743511',
          MsgType: 'reject',
          FeedBackId: '5883726847655944563',
          Reason: '商品质量有问题',
          AppSignature: 'b6f95a2368dd81952c4d7198e5102acd1fdd601a',
          SignMethod: 'sha1'
        });
        expect(spies.other.called).to.be.false;
        done();
      });
  });
  it('other_feedback', function (done) {
    request(app)
      .post('/')
      .send(template.require('other_feedback'))
      .end(function (err, result) {
        expect(err).to.be.null;
        expect(result.text).to.be.empty;
        expect(spies.request.called).to.be.false;
        expect(spies.confirm.called).to.be.false;
        expect(spies.reject.called).to.be.false;
        expect(spies.other.args[0][0]).to.be.deep.equal({
          OpenId: '111222',
          AppId: 'wxd930ea5d5a258f4f',
          TimeStamp: '1369743511',
          MsgType: 'foobar',
          AppSignature: 'b6f95a2368dd81952c4d7198e5102acd1fdd601a',
          SignMethod: 'sha1'
        });
        done();
      });
  });
  it('unexpect_feedback', function (done) {
    request(app)
      .post('/')
      .send(template.require('unexpect_feedback'))
      .end(function (err, result) {
        expect(err).to.be.null;
        expect(result.text).to.be.equal('Invalid signature');
        expect(spies.request.called).to.be.false;
        expect(spies.confirm.called).to.be.false;
        expect(spies.reject.called).to.be.false;
        expect(spies.other.called).to.be.false;
        done();
      });
  });
});
