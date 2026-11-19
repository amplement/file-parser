# file-parser

`POST /upload` expects a `multipart/form-data` request with a file part named
`file`. If the request reaches the upload handler without a file, it returns
HTTP 400 with the message `missing "file" field`.

Run the upload regression tests with `npm test`.

From Google cloud plateform
```
npm i
npm run deploy
```

To tail log files : `gcloud app logs tail`
