import {Router, Request, Response, NextFunction} from 'express';
import * as logger from 'morgan';
import * as azureStorage from 'azure-storage'; 

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
    //console.log(req.headers);
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    //console.log(req.ip);
    //console.log(new Date().getTime());
    
    var tableClient = azureStorage.createTableService(process.env.AzureStorageConnectionString).withFilter(new azureStorage.ExponentialRetryPolicyFilter());

    res.render('index',{ inputurl:'', outputurl:req.body.inputurltext });
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
