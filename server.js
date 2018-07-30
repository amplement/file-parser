import fs from 'fs';
import express from 'express';
import multer from 'multer';
import csv from 'fast-csv';

const EMAIL_REGEX = /([a-zA-Z0-9._+-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
const noop = () => {};

const app = express();

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

app.listen(8000);
