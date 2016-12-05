import * as mocha from 'mocha';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
// for local development, need a convinient way to set environment variables. The '.env' file is git ignored
require('dotenv').config({ silent: true });
import app from '../src/App';
import chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
chai.use(chaiHttp);
const expect = chai.expect;

describe('base Tests', () => {
  it('returns the default view, should be HTML', () => {
    chai.request(app).get('/')
    .end((err,res) => {
      expect(res.type).to.eql('text/html');
      expect(res).to.be.html;
    });
  });

  it('should redirect the browser to expanded url', () => {
    chai.request(app).get('/cgbNn34x')
    .end((err,res) => {
      expect(res.status).to.eql(304);
    });
  });

  it('should return a html view with shortened url: http://www.google.com', () => {
    chai.request(app).post('/')
    .set('content-type', 'application/x-www-form-urlencoded')
    .send({inputurltext: 'http://urlshortenlinux.azurewebsites.net/cgbNn34x'})
    .end((err,res) => {
      expect(res.type).to.eql('text/html');
      expect(res.body).to.contain('http://www.google.com');
    });
  });

  it('should return a html view with shortened url:http://urlshortenlinux.azurewebsites.net/cgbNn34x', () => {
    chai.request(app).post('/')
    .set('content-type', 'application/x-www-form-urlencoded')
    .send({inputurltext: 'http://www.google.com'})
    .end((err,res) => {
      expect(res.type).to.eql('text/html');
      expect(res.body).to.contain('http://urlshortenlinux.azurewebsites.net/cgbNn34x');
    });
  })
});


describe('Invalid input ', () => {
  it('Empty input : should return the view with text :: Please enter a valid URL.', () => {
    chai.request(app).post('/')
    .set('content-type', 'application/x-www-form-urlencoded')
    .send({inputurltext: ' '})
    .end((err,res) => {
      expect(res.type).to.eql('text/html');
      expect(res.body).to.contain('Please enter a valid URL');
    })
   });

  it('Non URL input: should return the view with text :: Please enter a valid URL.', () => {
    chai.request(app).post('/')
    .set('content-type', 'application/x-www-form-urlencoded')
    .send({inputurltext: ' This is an invalid entry'})
    .end((err,res) => {
      expect(res.type).to.eql('text/html');
      expect(res.body).to.contain('Please enter a valid URL');
    })
  });
});
