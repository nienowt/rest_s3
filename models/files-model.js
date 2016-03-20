'use strict';

const mongoose = require('mongoose');
const fileSchema = mongoose.Schema({
  bucketId: String,
  name: String,
  url: String
});

module.exports = mongoose.model('files', fileSchema);
