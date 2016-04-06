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
          res.json(data);
        });
        res.end();
      });
    })
    .delete((req, res) => {
      File.findById(req.params.file, (err, file) => {
        file.remove(() => {
          console.log(file + ' removed');
          s3.deleteObject({Bucket: '401-' + file.bucketId, Key: file.name} ,(err,data) => {
            if (err) console.log(err);
            else     console.log(data);
          });
          res.end();
        });
      });
    });
  router.route('/users/:user/files')
    .get((req, res) => {
      User.findOne({_id: req.params.user})
      .populate('files')
      .exec((err, user) => {
        res.json(user.files);
        res.end();
      });
    })
    .post((req, res) => {
      let fileName;
      let fileContent;
      if (req.headers['content-type'] === 'image/jpeg'){
        let imgData = [];
        req.on('data',(data) => {
          imgData.push(data);
        }).on('end', ()=>{
          fileContent = Buffer.concat(imgData);
          sendFiles();
        });
        fileName = req.headers['filename'];
      } else {
        fileName = req.body.fileName;
        fileContent = req.body.content;
        sendFiles();
      }
      function sendFiles(){
        let bucketName = req.params.user;
        let s3 = new AWS.S3({params: {Bucket: '401-' + bucketName, Key: fileName}});
        s3.createBucket(function(err) {
          if (!err || err.code === 'BucketAlreadyOwnedByYou') {
            s3.headObject((err, data) => {
              if (err) console.log('this is the error',err);
              if (!data){
                s3.upload({Body: fileContent, ACL: 'public-read'}, (err, data) => {
                  if (err) console.log('here',err);
                  res.write('file uploaded');
                  res.end();
                  let newFile = new File({bucketId: bucketName, name: fileName, url: data.Location});
                  newFile.save((err, file) => {
                    User.findByIdAndUpdate(bucketName, {$push: {'files': file._id}},{'new': true}, (err) => {
                      if (err) console.log(err);
                    });
                  });
                });
              }
            });
          } else {
            res.status(400).send('Error:'+ err);
            res.end();
          }
        });
      }
    });
};
