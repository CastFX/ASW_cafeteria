var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserTicketSchema = new Schema({
  idUtente: {
    type: String
  },
  idTipoTicket: {
    type: Schema.Types.ObjectId,
    ref: 'Tickets'
  }
}, {collection: 'userTickets'});

module.exports = mongoose.model('UserTickets', UserTicketSchema);
