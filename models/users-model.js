'use strict';

const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
  name: String,
  files: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'files'
    }
  ]
});

module.exports = mongoose.model('users', userSchema )
