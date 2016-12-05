import * as mocha from 'mocha';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
// for local development, need a convinient way to set environment variables. The '.env' file is git ignored
require('dotenv').config({ silent: true });
import app from '../src/App';

chai.use(chaiHttp);
const expect = chai.expect;

describe('baseRoute', () => {
  it('should be html', () => {
    chai.request(app).get('/')
    .then(res => {
      expect(res.type).to.eql('text/html');
      expect(res).to.be.html;
    });
  });

});

describe('shorten url with empty input URL', () => {
  it('should return the view with text :: Please enter a valid URL.', () => {
    chai.request(app).post('/')
    .set('content-type', 'application/x-www-form-urlencoded')
    .send({inputurltext: ' '})
    .then(res => {
      expect(res.type).to.eql('text/html');
      expect(res.body).to.contain('Please enter a valid URL');
    })
    .catch(err => {
      // error handling
    });
  });
});

describe('shorten url with invalid input URL', () => {
  it('should return the view with text :: Please enter a valid URL.', () => {
    chai.request(app).post('/')
    .set('content-type', 'application/x-www-form-urlencoded')
    .send({inputurltext: ' This is an invalid entry'})
    .then(res => {
      expect(res.type).to.eql('text/html');
      expect(res.body).to.contain('Please enter a valid URL');
    })
    .catch(err => {
      // error handling
    });
  });
});