'use strict';

module.exports = (router) => {
  let AWS = require('aws-sdk');
  let fs = require('fs');
  AWS.config.region = 'us-west-2';
  let User = require(__dirname + '/../models/users-model');
  let File = require(__dirname + '/../models/files-model');

  router.route('/users')
    .get((req, res) => {
      User.find({})
      .populate('files')
      .exec((err, users) => {
        res.json(users);
        res.end();
      });
    })
    .post((req, res) => {
      var newUser = new User(req.body);
      newUser.save((err) => {
        if (err) res.send('User not saved');
        console.log('User saved!');
      });
    });

  router.route('/users/:id')
    .get((req, res) => {
      User.findOne({_id: req.params.id}, (err, user) => {
        res.json(user);
        res.end();
      });
      var s3 = new AWS.S3();
      s3.getObject({Bucket: req.params.id, Key: '' });
    })
    .put((req, res) => {

    })
    .delete((req, res) => {

    });

  router.route('/users/:user/files')
    .get((req, res) => {

    })
    .post((req, res) => {
      var bucketName = req.params.user;
      var s3 = new AWS.S3({params: {Bucket: '401-' + bucketName, Key: req.body.fileName}});
      s3.headBucket({Bucket: '401-' + bucketName}, (err, data) => {
        if (err) {
          console.log(err);
          s3.createBucket(function(err) {
            if (err) {
              res.status(400).send('Error:'+ err);
              res.end();
            } else {
              s3.upload({Body: req.body.content}, (err, data) => {
                if (err) console.log(err);
                var newFile = new File({userId:bucketName, url:data.Location});
                newFile.save((err, file) => {
                  User.findByIdAndUpdate(bucketName, {$push: {'files': file._id}},{'new': true}, (err, user) => {
                    if (err) console.log(err);
                  });
                });
              });
              res.end();
            }
          });
        } else {
          s3.upload({Body: req.body.content}, (err, data) => {
            if (err) console.log('this is the error', err);

            var newFile = new File({userId:bucketName, url:data.Location});
            newFile.save((err, file) => {
              User.findByIdAndUpdate(bucketName, {$push: {'files': file._id}}, (err, user) => {
                if (err) console.log(err);
              });
            });
          });
          res.end();
        }
      });
    });
};
