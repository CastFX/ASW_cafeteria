var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GameSchema = new Schema({
  type: {
    type: String,
    default: "Hextris"
  },
  score: {
    type: Number,
    default: 0.0
  },
  started: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: new Date()
  }
});


var UtentiSchema = new Schema({
  _id: {
    type: String,
    required: 'An username is required'
	},
  corso: {
    type: String,
    required: 'A course is required'
  },
  email: {
    type: String,
    required: 'An email is required'
  },
  password: {
    type: String,
    required: 'A password is required'
  },
  sale: {
    type: String,
    required: 'A salt is required'
  },
  date: {
    type: Date,
    default: Date.now
  },
  life: {
    type: Number,
    default: 0
  },
  games: [GameSchema]

}, {collection: 'utenti'});

module.exports = mongoose.model('Utenti', UtentiSchema);
