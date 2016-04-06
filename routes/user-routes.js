'use strict';

module.exports = (router) => {
  let AWS = require('aws-sdk');
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
      let newUser = new User(req.body);
      newUser.save((err, user) => {
        if (err) res.send('User not saved');
        console.log('User saved!');
        res.json(user);
        res.end();
      });
    });

  router.route('/users/:user')
    .get((req, res) => {
      User.findOne({_id: req.params.user})
      .populate('files')
      .exec((err, user) => {
        res.json(user);
        res.end();
      });
    })
    .put((req, res) => {
      User.findByIdAndUpdate({_id: req.params.user}, {$set: req.body}, (err) => {
        if (err) res.send(err);
        res.write('User Updated');
        res.end();
      });
    })
    .delete((req, res) => {
      let s3 = new AWS.S3();
      User.findById(req.params.user, (err, user) => {
        if(user.files.length !== 0){
          user.files.forEach((file) => {
            File.findById(file, (err, file) => {
              s3.deleteObject({Bucket: '401-' + req.params.user, Key: file.name} ,(err,data) => {
                if (err) console.log(err);
                else     console.log(data);
              });
              file.remove(() => {
                console.log('file removed');
              });
            });
          });
        }
        s3.deleteBucket({Bucket: '401-' +req.params.user}, (err,data) => {
          if (err) console.log(err);
          else console.log('delete data', data);
        });
        user.remove(() => {
          res.send('User Deleted');
        });
      });
    });


  // router.route('/users/:user/files')
  //   .get((req, res) => {
  //     User.findOne({_id: req.params.user})
  //     .populate('files')
  //     .exec((err, user) => {
  //       res.json(user.files);
  //       res.end();
  //     });
  //   })
  //   .post((req, res) => {
  //     let fileName;
  //     let fileContent;
  //     if (req.headers['content-type'] === 'image/jpeg'){
  //       let imgData = [];
  //       req.on('data',(data) => {
  //         imgData.push(data);
  //       }).on('end', ()=>{
  //         fileContent = Buffer.concat(imgData);
  //         sendFiles();
  //       });
  //       fileName = req.headers['filename'];
  //     } else {
  //       fileName = req.body.fileName;
  //       fileContent = req.body.content;
  //       sendFiles();
  //     }
  //     function sendFiles(){
  //       let bucketName = req.params.user;
  //       let s3 = new AWS.S3({params: {Bucket: '401-' + bucketName, Key: fileName}});
  //       s3.createBucket(function(err) {
  //         if (!err || err.code === 'BucketAlreadyOwnedByYou') {
  //           s3.headObject((err, data) => {
  //             if (err) console.log('this is the error',err);
  //             if (!data){
  //               s3.upload({Body: fileContent, ACL: 'public-read'}, (err, data) => {
  //                 if (err) console.log('here',err);
  //                 res.write('file uploaded');
  //                 res.end();
  //                 let newFile = new File({bucketId: bucketName, name: fileName, url: data.Location});
  //                 newFile.save((err, file) => {
  //                   User.findByIdAndUpdate(bucketName, {$push: {'files': file._id}},{'new': true}, (err) => {
  //                     if (err) console.log(err);
  //                   });
  //                 });
  //               });
  //             }
  //           });
  //         } else {
  //           res.status(400).send('Error:'+ err);
  //           res.end();
  //         }
  //       });
  //     }
  //   });
};
