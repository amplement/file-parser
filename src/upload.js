import express from 'express';
import Multer from 'multer';
import csv from 'fast-csv';

const EMAIL_REGEX = /([a-zA-Z0-9._+-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;

const parseEmails = payload => (
    payload && typeof (payload) === 'string'
    && payload.match(EMAIL_REGEX));

const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // no larger than 5mb
    }
});

const routes = express.Router();

routes.post('/upload', multer.single('file'), (req, res, next) => {

    if (!req.file) {

        next(new Error('missing "file" field'));
        return;

    }

    const { buffer } = req.file;
    if (!Buffer.isBuffer(buffer)) {
        next(new TypeError('invalid uploaded file buffer'));
        return;
    }

    const fileRows = [];
    const csvStream = csv()
    .validate(fields => parseEmails(fields[0]))
    .on('data', fields => fileRows.push(fields[0]))
    .on('error', next)
    .on('end', () => {

        res.send({
            data: fileRows
        });

    });

    csvStream.end(buffer);

});

export default routes;
