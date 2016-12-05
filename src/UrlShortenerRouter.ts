import {Router, Request, Response, NextFunction} from 'express';
import * as logger from 'morgan';
import * as Promise from 'bluebird';

import UrlShortenerService from './UrlShortenerService';
var checkUrl = require('valid_url');
export class UrlShortenerRouter {
  router: Router

  /**
   * Initialize the UrlShortenerRouter
   */
  constructor() {
    this.router = Router();
    this.init();
    
  }
  
  /**
   * Processes the input entered in the InputBox
   */
  public processInput(req: Request, res: Response, next: NextFunction) {
    // Now that we have the URL the user has entered, 
    // if the URL has the current host name, then, we need to decompress, 
    // else we can compress the url
    var ip_addr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var requestedURL = req.body.inputurltext;
    var invalidInput = false;
    // check if the user input is a valid URI or not
    if(!checkUrl(requestedURL))
    {
      console.error('Input is an invalid url ' + requestedURL);
      res.render('index',{ inputurl:'', outputurl:'Please enter a valid URL'});
      invalidInput=true;
    }
    if(!invalidInput)
    {
      if(requestedURL.startsWith(process.env.SERVICE_DNS_NAME))
      {
        // The requested URL starts with the current host name, 
        // Should expand the URL
        var promise = UrlShortenerService.expandUrl(requestedURL, ip_addr);
        promise.then((url)=>{
          res.render('index',{ inputurl:requestedURL, outputurl:url});
        })
        .catch((err)=>{
          res.render('index',{ inputurl:requestedURL, outputurl:err.message});
        });
      }
      else
      {
        // Compress the URL
        var promise = UrlShortenerService.compressUrl(requestedURL, ip_addr);
        promise.then((url)=>{
          res.render('index',{ inputurl:requestedURL, outputurl:url});
        })
        .catch((err)=>{
          res.render('index',{ inputurl:requestedURL, outputurl:err.meesage});
        });
      }
      }
    
  }
  
  /**
   * returns the default view
   */
  public getDefault(req: Request, res: Response, next: NextFunction) {
    
    res.render('index',{ inputurl:'', outputurl:'' });
  }

  /**
   * processes the shortened URL and redirects the User to the page.
   */
  public redirectUserFromShortenedURl(req: Request, res: Response, next: NextFunction){
      var ip_addr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      var shortUrl = req.url;

     
      if(shortUrl.indexOf('favicon.ico')> -1)
      {
        console.log('favicon requested');
        res.sendStatus(200);
        //res.end();
      }

       console.log('redirect: '+ shortUrl);
      var promise = UrlShortenerService.expandUrl(shortUrl, ip_addr);
      promise.then((url)=>{
        //redirect to the URl here.
        res.redirect(url);
      })
      .catch((err)=>{
        res.render('index',{ inputurl:'', outputurl:err.message});
      });
  }

  /**
   * Take each handler, and attach to one of the Express.Router's
   * endpoints.
   */
  init() {
    // add routes
    this.router.post('/', this.processInput);
    this.router.get('/', this.getDefault);
    //this.router.get('/:shortId', this.redirectUserFromShortenedURl);
  }

}

// Create the UrlShortenerRouter, and export its configured Express.Router
const urlroutes = new UrlShortenerRouter();
urlroutes.init();

export default urlroutes.router;
