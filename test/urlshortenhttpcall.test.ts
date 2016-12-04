import * as mocha from 'mocha';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
// for local development, need a convinient way to set environment variables. The '.env' file is git ignored
require('dotenv').config({ silent: true });

import app from '../src/App';

chai.use(chaiHttp);
const expect = chai.expect;

describe('shorten URL http://www.google.com', () => {
  it('should return a html view with shortened url:http://urlshortenlinux.azurewebsites.net/cgbNn34x', () => {
    chai.request(app).post('/')
    .set('content-type', 'application/x-www-form-urlencoded')
    .send({inputurltext: 'http://www.google.com'})
    .then(res => {
      expect(res.type).to.eql('text/html');
      expect(res.body).to.contain('http://urlshortenlinux.azurewebsites.net/cgbNn34x');
    });
  })
});