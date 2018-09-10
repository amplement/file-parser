import express from 'express';
import raven from 'raven';
import cors from 'cors';
import routes from './upload';

const app = express();

const sentryUrl = 'https://c0e15ef475fc4863a6651aa0cf681a4e@sentry.io/1252503';

raven
.config(sentryUrl, { captureUnhandledRejections: true })
.install();

app.use(cors());
app.use(raven.requestHandler());

app.use('/', routes);

raven.setContext({
    tags: {
        errorType: 'uncaught'
    }
});
app.use(raven.errorHandler());

app.use((err, req, res, next) => {

    res.status(500);
    res.end();
    next();

});

const port = process.env.PORT || 8080;
app.listen(port, () => {

    console.log('listening to', port);

});
