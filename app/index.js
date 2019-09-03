var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var favicon = require('serve-favicon');
var path = require('path');
var Corsi = require('./src/models/corsiModels');
var Utenti = require('./src/models/utenteModels');
var Tickets = require('./src/models/ticketModels');
var UserTickets = require('./src/models/userTicketModels');
var UserMessages = require('./src/models/userMessageModels');
var EmailVerifications = require('./src/models/emailVerificationModels');
var Qr = require('./src/models/qrModels');
//Creo istanza di express (web server)
var app = express();

//importo parser per leggere i parametri passati in POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Preparazione sessione
const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicons', 'favicon.gif')));

const session = require("express-session");

app.use(session({ secret: "cats", resave: false, saveUninitialized: false }));
app.use(express.urlencoded({ extended: true })); // express body-parser
app.use(passport.initialize());
app.use(passport.session());


// aspetto che il container di mongo sia
function pausecomp(millis)
{
    var date = new Date();
    var curDate = null;
    do { curDate = new Date(); }
    while(curDate-date < millis);
}
console.log('Taking a break...');
pausecomp(5000);
console.log('Ten seconds later, ...'); //connessione al db mongoose.set('useFindAndModify', false);
mongoose.set('connectTimeoutMS', 30); mongoose .connect(
	'mongodb://mongodb:27017/dbcoffee',
  //'mongodb://localhost:27017/dbcoffee',
	//'mongodb://localhost/dbcoffee',
	// 'mongodb://asw_mongodb_1.asw_interna:27017/dbsa', ANDAVA BENE
	{ useNewUrlParser: true }) .then(() => console.log('MongoDB Connected')) .catch((err) => console.log(err));
/* sembrava andare mongoose.connect(
	'mongodb://asw_mongodb_1.asw_interna:27017/dbsa',
	{ useNewUrlParser: true, useFindAndModify: false, connectTimeoutMS: 30 },
	function (err) {
		if (err){ console.log('Errore in connect');handleError(err); }
		else { console.log('connect SEMBRA OK'); }
	}
);
*/
// OK  mongoose.connect('mongodb://mongodb/dbsa', { useNewUrlParser: true, useFindAndModify: false });
//mongoose.connect('mongodb://username:password@host:port', { useNewUrlParser: true, useFindAndModify: false });

var routes = require('./src/routes/routes');
routes(app);

//Path globale root
var path = require('path');
global.appRoot = path.resolve(__dirname);
app.use('/static', express.static(__dirname + '/public'));

//metto in ascolto il web server
app.listen(3000, function () {
  console.log('Node API server started on port 3000!');
});
