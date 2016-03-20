'use strict';

module.exports = (router) => {
let File = require(__dirname + '/../models/files-model');
let User = require(__dirname + '/../models/users-model');
let AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';
let s3 = new AWS.S3();

  router.route('/files/:file')
    .get((req, res) => {
      File.findById(req.params.file, (err, file) => {
        res.json(file);
        res.end();
      });
    })
    .put((req, res) => {
      File.findById(req.params.file, (err, file) => {
        s3.upload({Bucket: '401-' + file.bucketId, Key: file.name, Body: req.body.content}, (err, data) => {
          if (err) console.log(err);
          console.log(data);
        });
        res.end();
      });
    })
    .delete((req, res) => {
      File.findById(req.params.file, (err, file) => {
        file.remove(() => {
          console.log(file + ' removed')
          s3.deleteObject({Bucket: '401-' + file.bucketId, Key: file.name} ,(err,data) => {
            if (err) console.log(err);
            else     console.log(data);
          });
          res.end()
        });
      })
    });
};
