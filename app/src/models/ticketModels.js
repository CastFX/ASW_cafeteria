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
  }
}, {collection: 'tickets'});

module.exports = mongoose.model('Tickets', TicketSchema);
