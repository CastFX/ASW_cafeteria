var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TicketSchema = new Schema({
  type: {
    type: String
  },
  discount: {
    type: Number
  },
  description: {
    type: String
  },
  image: {
    type: String
  },
  gameid: {
    type: String
  },
  userid: {
    type: String,
    // ref: 'Utenti'
  }
}, {collection: 'tickets'});

module.exports = mongoose.model('Tickets', TicketSchema);
