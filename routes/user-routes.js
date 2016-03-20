'use strict';

module.exports = (router) => {
  let AWS = require('aws-sdk');
  let fs = require('fs');
  AWS.config.region = 'us-west-2';
  let User = require(__dirname + '/../models/users-model');
  let File = require(__dirname + '/../models/files-model')

  router.route('/users')
    .get((req, res) => {
      User.find({}, (err, users) => {
        res.json(users);
        res.end();
      })
      //****GETS ALL BUCKETS*****
      // var s3 = new AWS.S3();
      // s3.listBuckets((err,data) => {
      //   if (err) {
      //     console.log(err)
      //   } else {
      //     var bucketList = []
      //     for (var index in data.Buckets) {
      //       var bucket = data.Buckets[index];
      //       bucketList.push(bucket);
      //       if(index >= data.Buckets.length-1){
      //         res.send(bucketList)
      //         console.log(s3.methods)
      //       }
      //     }
      //   }
      // })
    })
    .post((req, res) => {
      var newUser = new User(req.body)
      newUser.save((err) => {
        if (err) res.send('User not saved');
        console.log('User saved!')
      })
    });

    router.route('/users/:id')
    .get((req, res) => {
      User.findOne({_id: req.params.id}, (err, user) => {
        res.json(user);
        res.end();
      })
      var s3 = new AWS.S3()
      s3.getObject({Bucket: req.params.id, Key: '' })
    })
    .put((req, res) => {

    })
    .delete((req, res) => {

    });

    router.route('/users/:user/files')
    .get((req, res) => {

    })
    .post((req, res) => {
        // fs.mkdir(__dirname + '/../tmpData', () => {
        //   fs.writeFile('./tmpData/1.txt', req.body.content.toString(), (err) => {
        //     if(err) throw err;
        //     console.log('fileSaved')
        //   })
        // })

      //create bucket for user on s3 --- needs to take file data
      var bucketName = req.params.user
      console.log(typeof bucketName, bucketName)

      var s3 = new AWS.S3({params: {Bucket: '401-' + bucketName, Key: req.body.fileName}});
      s3.headBucket({Bucket: '401-' + bucketName}, (err, data) => {
        if (err){
          console.log(err);
          s3.createBucket(function(err) {
            if (err) {
              res.status(400).send("Error:"+ err);
              res.end();
            } else {
              s3.upload({Body: req.body.content}, (err, data) => {
                if (err) console.log(err)
                console.log(data)
                console.log('shouldve created new bucket and uploaded')
                // User.findByIdAndUpdate(bucketName, {$push: {"files": data.location}})
              })
              res.end();
            }
          });
        } else {
        s3.upload({Body: req.body.content}, (err, data) => {
          if (err) console.log('this is the error', err)
          console.log(typeof data.Location)
          var newFile = new File({userId:bucketName, url:data.Location});
          newFile.save((err, file) => {
            console.log(file)
          })
          // User.findByIdAndUpdate(bucketName, {$push: {"files": {url: data.Location}}},{'new': true}, (err, user) => {
          //   if (err) console.log(err)
          //   console.log('yay')
          // })
          console.log('shouldve worked')
        })
        res.end()
        }
      })
    });



}
