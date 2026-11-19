const assert = require('assert');
const { PassThrough } = require('stream');
const multer = require('multer');
const routes = require('../dist/upload').default;

function upload(contents) {
    const boundary = 'upload-test-boundary';
    const parts = contents === undefined ? [] : [
        `--${boundary}\r\n`,
        'Content-Disposition: form-data; name="file"; filename="emails.csv"\r\n',
        'Content-Type: text/csv\r\n\r\n',
        contents,
        '\r\n'
    ];
    const body = Buffer.from(parts.concat(`--${boundary}--\r\n`).join(''));
    const req = new PassThrough();
    req.method = 'POST';
    req.url = '/upload';
    req.headers = {
        'content-type': `multipart/form-data; boundary=${boundary}`,
        'content-length': body.length
    };

    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Upload did not finish')), 2000);
        const res = {
            send(data) {
                clearTimeout(timeout);
                resolve(data);
            }
        };
        routes.handle(req, res, (err) => {
            clearTimeout(timeout);
            reject(err || new Error('Upload route did not handle the request'));
        });
        req.end(body);
    });
}

async function expectUploadError(contents, pattern) {
    const error = await upload(contents).then(() => null, err => err);
    assert(error instanceof Error);
    assert(pattern.test(error.message), error.message);
}

async function testUploads() {
    assert.deepStrictEqual(await upload('first@example.com,list\ninvalid\nlast@example.org'), {
        data: ['first@example.com', 'last@example.org']
    });
    assert.deepStrictEqual(await upload(''), { data: [] });
    await expectUploadError(undefined, /^missing "file" field$/);
    await expectUploadError('"unclosed@example.com', /^Parse Error/);

    const storage = Object.getPrototypeOf(multer.memoryStorage());
    const handleFile = storage._handleFile;
    storage._handleFile = (req, file, callback) => {
        file.stream.resume();
        file.stream.once('end', () => callback(null, { buffer: {}, size: 1 }));
    };
    try {
        await expectUploadError('x', /^invalid uploaded file buffer$/);
    } finally {
        storage._handleFile = handleFile;
    }
}

testUploads().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
