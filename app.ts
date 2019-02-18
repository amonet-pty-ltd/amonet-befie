import * as express from "express";
import * as promBundle from "express-prom-bundle";
import * as bodyParser from "body-parser";
import { HTTPCode } from "./modules/constants";
import * as highlightPoductsRouter from './modules/highlights/v1/router';
import * as dealsRouters from './modules/deals/v1/router';
import * as staticContentRouter from './modules/static-contents/v1/router';

const path = require('path');

class App {
  public app;

  constructor() {
    this.app = express();
    this.configHTTPParameters();
    this.mountRoutes();
  }

  private configHTTPParameters(): void {
    this.app.use(promBundle({
      includeMethod: true,
      includePath: true,
      promClient: {
        collectDefaultMetrics: {
          timeout: 5000
        }
      }
    }));
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.configurePublicPaths();
    this.mountRoutes()
  }

  private configurePublicPaths() {
    this.app.use(express.static(__dirname + '/public'));
    this.app.use(express.static(__dirname + '/public/images'));
 }

private mountRoutes(): void {
    this.app.use('/highlights', highlightPoductsRouter);
    this.app.use('/deals', dealsRouters);
    this.app.use('/static-contents', staticContentRouter);
    this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
      const err = {
        message: 'Not Found',
        status: HTTPCode.NotFound
      };
      next(err);
    });
    this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
       console.log("Error")
       res.status(err.status || HTTPCode.InternalError).json(new CommonError(err.message, null, []));
    });
  }
}

export class CommonError {
  message: string;
  referenceNumber: string;
  errors: Array<ErrorItem>;

  constructor(message, referenceNumber, errors = []) {
    this.message = message;
    this.referenceNumber = referenceNumber; // string
    this.errors = errors;                   // array of ErrorItem
  }
}

export class ErrorItem {
  key: string;
  field: string;
  message: string;

  constructor(key, field, message) {
    this.key = key;         // string
    this.field = field;     // string
    this.message = message; // string
  }
}

const expressAppInstance = new App().app
export default expressAppInstance;

export let imageDirectory = () => {
  const fileName =  path.join(__dirname + '/public/images/' );
  return fileName;
}