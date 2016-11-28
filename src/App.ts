import * as path from 'path';
import * as express from 'express';
import * as logger from 'morgan'
import * as bodyParser from 'body-parser';
import * as errorHandler from 'errorhandler';

import UrlShortenerRouter from './UrlShortenerRouter';

// Creates and configures an ExpressJS web server.
class App {

  // ref to Express instance
  public express: express.Application;

  //Run configuration methods on the Express instance.
  constructor() {
    this.express = express();
    this.middleware();
    this.routes();
  }

  // Configure Express middleware.
  private middleware(): void {
    this.express.set('views', __dirname + '/views');
    this.express.set('view engine', 'pug');
    this.express.set('view options', { layout: true });
   
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
    var env = process.env.NODE_ENV || 'development';
    if (env === 'development') {
      this.express.use(logger('dev'));
      this.express.use(errorHandler());
   }
  }

  // Configure API endpoints.
  private routes(): void {
    /* This is just to get up and running, and to make sure what we've got is
     * working so far. This function will change when we start to add more
     * API endpoints */
    let router = express.Router();
    // placeholder route handler
    router.get('/', (req, res, next) => {
      res.render('index',{ inputurl:'', outputurl:'' });
    });
    this.express.use('/', UrlShortenerRouter);
    //this.express.use('/v1/urls', UrlShortenerRouter);
  }
}

export default new App().express;