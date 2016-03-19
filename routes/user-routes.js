'use strict';

module.exports = (router) => {
  var AWS = require('aws-sdk');

  AWS.config.region = 'us-west-2';

  router.route('/users')
    .get((req, res) => {
      var s3 = new AWS.S3();
      s3.listBuckets((err,data) => {
        if (err) {
          console.log(err)
        } else {
          var bucketList = []
          for (var index in data.Buckets) {
            var bucket = data.Buckets[index];
            bucketList.push(bucket);
            if(index >= data.Buckets.length-1){
              res.send(bucketList)
            }
          }
        }
      })
    })
    .post((req, res) => {
      var bucketName = req.body.name
      var s3 = new AWS.S3({params: {Bucket: '401-user-bucket-' + bucketName, Key: ''}});
      s3.createBucket(function(err) {
        if (err) {
          res.status(400).send("Error:"+ err);
          res.end();
        } else {
          console.log("Successfully uploaded data to myBucket/myKey");
          res.end();
        }
      });
      // var s3bucket = new AWS.S3({params: {Bucket: 'new'}});
      // s3bucket.createBucket(() => {
      //   var params = {Key: 'new', Body:'Works'}
      //   s3bucket.upload(params, (err, data) => {
      //     if (err) {
      //        console.log(err)
      //      } else {
      //        console.log('new bucket!')
      //      }
      //     res.end();
      //   })
      // })
      // var buckName = req.body.name.toString()
      // var s3 = new AWS.S3();
      // s3.createBucket({Bucket: 'buckName'}, function() {
      //   var params = {Bucket: 'buckName', Key: 'testkey', Body: 'TEST'};
      //   s3.upload(params, function(err, data) {
      //     if (err) {
      //       console.log(err)
      //     } else {
      //       console.log('bucket????')
      //     }
      //     res.end();
      //   })
      // })
    });

    router.route('/users/:user')
    .get((req, res) => {

    })
    .put((req, res) => {

    })
    .delete((req, res) => {

    });

    router.route('/users/:user/files')
    .get((req, res) => {

    })
    .post((req, res) => {

    });


}
