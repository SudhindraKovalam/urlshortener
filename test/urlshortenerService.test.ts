import * as mocha from 'mocha';
import * as chai from 'chai';

// for local development, need a convinient way to set environment variables. The '.env' file is git ignored
require('dotenv').config({ silent: true });

import UrlShortenerService from '../src/UrlShortenerService';
import chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
const expect = chai.expect;
var assert = chai.assert;
var should = chai.should();

describe('generate short ID tests', () => {
  it('generateShortId www.harman.com should return shortened id Nfi7quFT', () => {
		var generateShortIdPromise = UrlShortenerService.generateShortId('www.harman.com');
		expect(generateShortIdPromise).to.eventually.equal('Nfi7quFT');
  		return generateShortIdPromise;
  });
  it('generateShortId http://www.harman.com should return shortened id SsB2YIY/', () => {
		var generateShortIdPromise = UrlShortenerService.generateShortId('http://www.harman.com');
		expect(generateShortIdPromise).to.eventually.equal('SsB2YIY/');
		expect(generateShortIdPromise).to.eventually.not.equal('Nfi7quFT');
  		return generateShortIdPromise;
  });
});

describe('get URl From Short ID tests', () => {
  it('getURlFromShortId Nfi7quFT  should return URL www.harman.com', () => {
		var getURlFromShortIdPromise = UrlShortenerService.getURlFromShortId('Nfi7quFT');  
		expect(getURlFromShortIdPromise).to.eventually.equal('www.harman.com');
  		return getURlFromShortIdPromise;
  });
  it('getURlFromShortId SsB2YIY/  should return URL http://www.harman.com ', () => {
		var getURlFromShortIdPromise = UrlShortenerService.getURlFromShortId('SsB2YIY/');
		expect(getURlFromShortIdPromise).to.eventually.equal('http://www.harman.com');
		expect(getURlFromShortIdPromise).to.eventually.not.equal('www.harman.com');
  		return getURlFromShortIdPromise;
  });
});

describe('compress URL tests', () => {
  it('compressUrl www.harman.com should return shortened URL Nfi7quFT', () => {
		var compressUrlPromise = UrlShortenerService.compressUrl('www.harman.com','chai_test');
		expect(compressUrlPromise).to.eventually.equal('http://urlshortenlinux.azurewebsites.net/Nfi7quFT');
  		return compressUrlPromise;
  });
  it('compressUrl http://www.harman.com should return shortened URL SsB2YIY/', () => {
		var compressUrlPromise = UrlShortenerService.compressUrl('http://www.harman.com', 'chai_test');
		expect(compressUrlPromise).to.eventually.equal('http://urlshortenlinux.azurewebsites.net/SsB2YIY/');
		expect(compressUrlPromise).to.eventually.not.equal('http://urlshortenlinux.azurewebsites.net/Nfi7quFT');
  		return compressUrlPromise;
  });
});


describe('expand URL tests', () => {
  it('expandUrl http://urlshortenlinux.azurewebsites.net/Nfi7quFT should return URl  www.harman.com', () => {
		var expandUrlPromise = UrlShortenerService.expandUrl('http://urlshortenlinux.azurewebsites.net/Nfi7quFT','chai_test');
		expect(expandUrlPromise).to.eventually.equal('www.harman.com');
  		return expandUrlPromise;
  });
  it('expandUrl http://urlshortenlinux.azurewebsites.net/SsB2YIY/ should return URl http://www.harman.com', () => {
		var expandUrlPromise = UrlShortenerService.expandUrl('http://urlshortenlinux.azurewebsites.net/SsB2YIY/', 'chai_test');
		expect(expandUrlPromise).to.eventually.equal('http://www.harman.com');
		expect(expandUrlPromise).to.eventually.not.equal('www.harman.com');
  		return expandUrlPromise;
  });
});