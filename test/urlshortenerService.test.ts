import * as mocha from 'mocha';
import * as chai from 'chai';

// for local development, need a convinient way to set environment variables. The '.env' file is git ignored
require('dotenv').config({ silent: true });
var should = require("should");

import UrlShortenerService from '../src/UrlShortenerService';

const expect = chai.expect;
var assert = chai.assert;

describe('shorten a URL without protocol www.harman.com', () => {
  it('should return a shortened URL', () => {
  	 var shortIdPromise = UrlShortenerService.generateShortId('www.harman.com');
	 shortIdPromise.then((identifier)=>{
    	assert.isNotNull(identifier);
   	})
  })
});