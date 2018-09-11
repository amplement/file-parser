import express from 'express';
import Multer from 'multer';
import csv from 'fast-csv';
import stream from 'stream';

const EMAIL_REGEX = /([a-zA-Z0-9._+-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;

const parseEmails = payload => (
    payload && typeof (payload) === 'string'
    && payload.match(EMAIL_REGEX));

const multer = Multer({
    storage: Multer.MemoryStorage,
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

    const fileRows = [];
    const csvStream = csv()
    .validate(fields => parseEmails(fields[0]))
    .on('data', fields => fileRows.push(fields[0]))
    .on('end', () => {

        res.send({
            data: fileRows
        });

    });

    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);
    bufferStream.pipe(csvStream);

});

export default routes;
