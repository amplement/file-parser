import fs from 'fs';
import express from 'express';
import multer from 'multer';
import csv from 'fast-csv';
import raven from 'raven';

const EMAIL_REGEX = /([a-zA-Z0-9._+-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
const noop = () => {};

const app = express();

const sentryUrl = 'https://c0e15ef475fc4863a6651aa0cf681a4e@sentry.io/1252503';

raven
.config(sentryUrl, { captureUnhandledRejections: true })
.install();

app.use(raven.requestHandler());

const storage = multer.diskStorage({
    destination: (req, file, callback) => {

        callback(null, '.');

    },
    filename: (req, file, callback) => {

        callback(null, `${file.originalname}-${Date.now()}`);

    }
});

const parseEmails = payload => (
    payload && typeof (payload) === 'string'
    && payload.match(EMAIL_REGEX));

const upload = multer({ storage });

const deleteFile = (path, callback) => {

    fs.unlink(path, callback);

};

app.post('/upload', upload.single('file'), (req, res) => {

    const fileRows = [];

    csv.fromPath(req.file.path)
    .validate(fields => parseEmails(fields[0]))
    .on('data', fields => fileRows.push(fields[0]))
    .on('end', () => {

        deleteFile(req.file.path, noop);
        res.send({
            data: fileRows
        });

    });

});

raven.setContext({
    tags: {
        errorType: 'uncaught'
    }
});
app.use(raven.errorHandler());

app.use((err, req, res) => {

    console.error(err.stack);
    res.status(500).send('Internal server error');

    raven.setContext({
        tags: {
            errorType: 'caught'
        }
    });

    throw err;

});

app.listen(process.env.PORT);
