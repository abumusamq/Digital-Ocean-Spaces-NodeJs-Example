const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();
const multer  = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');

const SPACES_ENDPOINT = 'nyc3.digitaloceanspaces.com';
const API_KEY = '';
const API_SECRET = '';
const BUCKET_NAME = '';

let space = new AWS.S3({
  //Get the endpoint from the DO website for your space
  endpoint: SPACES_ENDPOINT,
  useAccelerateEndpoint: false,
  //Create a credential using DO Spaces API key (https://cloud.digitalocean.com/account/api/tokens)
  credentials: new AWS.Credentials(API_KEY, API_SECRET, null)
});

const upload = multer({
  storage: multerS3({
    s3: space,
    bucket: BUCKET_NAME,
    acl: 'public-read',
    cacheControl: 'max-age=31536000',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (request, file, cb) {
      console.log(file);
      cb(null, 'from_node/' + file.originalname);
    }
  })
}).array('upload', 1);

router.get('/upload-from-local', (req, res, next) => {
  const filename = path.resolve('./bin/example_image.jpg');
  console.log(filename);
  const fileContent = fs.readFileSync(filename);
  const params = {
    Bucket: BUCKET_NAME,
    Key: 'from_node/awesome.jpg',
    Body: fileContent,
    CacheControl: 'max-age=31536000',
    ACL: 'public-read',
    ContentType: 'image/jpeg',
  };

  space.upload(params, (err, data) => {
      if (err) {
        console.error(err);
        return res.send('Failed!!')
      }
      console.log(`File uploaded successfully. ${data.Location}`);
      res.send('Uploaded!')
  });
});

router.post('/upload', (req, res, next) => {
  upload(req, res, function (error) {
    if (error) {
      console.log(error);
      return res.redirect("/error");
    }
    console.log('File uploaded successfully.');
    res.redirect("/success");
  });
});


/* Returns the uploaded file */
router.get('/:folder/:filename', (req, res, next) => {
  console.log('querying ' + req.params.folder + '/' + req.params.filename);
  let downloadParameters = {
    Bucket: BUCKET_NAME,
    Key: req.params.folder + '/' + req.params.filename,
  };

  space.getObject(downloadParameters, function(error, data) {
    if (error){
      console.error(error);
      res.sendStatus(500);
      return;
    }
    res.contentType(data.ContentType);
    res.end(data.Body, 'binary');
  });
});

module.exports = router;
