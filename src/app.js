import express from 'express';
import environment from './config/environment';
import logger from 'morgan';
import errorsMiddleware from './middlewares/errors';
import routes from './routes';
import helmet from 'helmet';
import cors from 'cors';
import xss from 'xss-clean';
import rateLimiter from 'express-rate-limit';
import path from 'path';
import 'express-async-errors';
import rootUserInit from './config/rootUserInit';

export default class App {
  constructor() {
    this.app = express();
    this.app.use(
      logger('dev', { skip: (req, res) => environment.nodeEnv === 'test' })
    );
    this.app.use(cors());
    this.app.use(express.static(path.join(__dirname, 'public')));
    this.app.use(
      '/fastq',
      express.static(path.join(__dirname, '..', 'node_modules/fastq'))
    );

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    rootUserInit();
    this.setSecurity();
    this.setRoutes();
  }

  setRoutes() {
    this.app.use('/', routes);
    this.app.use(errorsMiddleware);
  }

  setSecurity() {
    this.app.use(helmet());
    this.app.use(xss());
    this.app.use(rateLimiter({ windowMs: 60 * 1000, max: 60 }));
  }

  getApp() {
    return this.app;
  }

  listen() {
    const { port } = environment;
    this.app.listen(port, () => {
      console.log(`Listening at port ${port}`);
    });
  }
}
