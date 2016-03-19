'use strict';

const mongoose = require('mongoose');
const fileSchema = mongoose.Schema({
  name: String,
  location: String
});

module.exports = mongoose.model('files', fileSchema);
