var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UtentiSchema = new Schema({
  _id: {
    type: String
	},
  corso: {
    type: String
  },
  email: {
    type: String
  },
  password: {
    type: String
  },
  sale: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  },
  life: {
    type: Number,
    default: 0
  }
}, {collection: 'utenti'});

module.exports = mongoose.model('Utenti', UtentiSchema);
