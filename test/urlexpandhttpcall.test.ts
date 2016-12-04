import * as mocha from 'mocha';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
// for local development, need a convinient way to set environment variables. The '.env' file is git ignored
require('dotenv').config({ silent: true });

import app from '../src/App';

chai.use(chaiHttp);
const expect = chai.expect;

describe('expand URL :: http://urlshortenlinux.azurewebsites.net/cgbNn34x', () => {
  it('should return a html view with shortened url: http://www.google.com', () => {
    chai.request(app).post('/')
    .set('content-type', 'application/x-www-form-urlencoded')
    .send({inputurltext: 'http://urlshortenlinux.azurewebsites.net/cgbNn34x'})
    .then(res => {
      expect(res.type).to.eql('text/html');
      expect(res.body).to.contain('http://www.google.com');
    });
  })
});
