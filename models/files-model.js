'use strict';

const mongoose = require('mongoose');
const fileSchema = mongoose.Schema({
  // user: String,
  name: String,
  url: String
});

module.exports = mongoose.model('files', fileSchema);
