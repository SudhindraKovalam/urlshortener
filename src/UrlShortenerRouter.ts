import {Router, Request, Response, NextFunction} from 'express';
import * as logger from 'morgan';
import * as Promise from 'bluebird';

import UrlShortenerService from './UrlShortenerService';

export class UrlShortenerRouter {
  router: Router

  /**
   * Initialize the UrlShortenerRouter
   */
  constructor() {
    this.router = Router();
    this.init();
    
  }
  
  public processInput(req: Request, res: Response, next: NextFunction) {
    // Now that we have the URL the user has entered, 
    // if the URL has the current host name, then, we need to decompress, 
    // else we can compress the url
    var ip_addr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var requestedURL = req.body.inputurltext;

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
  
  public getDefault(req: Request, res: Response, next: NextFunction) {
    res.render('index',{ inputurl:'', outputurl:'' });
  }

  /**
   * Take each handler, and attach to one of the Express.Router's
   * endpoints.
   */
  init() {
    // add routes
    this.router.post('/', this.processInput);
    this.router.get('/', this.getDefault);
  }
}

// Create the UrlShortenerRouter, and export its configured Express.Router
const urlroutes = new UrlShortenerRouter();
urlroutes.init();

export default urlroutes.router;
