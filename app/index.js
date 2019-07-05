var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose')
var Alignment = require('./src/models/alignmentModels')

//Creo istanza di express (web server)
var app = express();

//importo parser per leggere i parametri passati in POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// aspetto che il container di mongo sia 
function pausecomp(millis)
{
    var date = new Date();
    var curDate = null;
    do { curDate = new Date(); }
    while(curDate-date < millis);
}
console.log('Taking a break...');
pausecomp(10000);
console.log('Ten seconds later, ...'); //connessione al db mongoose.set('useFindAndModify', false); 
mongoose.set('connectTimeoutMS', 30); mongoose .connect(
	'mongodb://mongodb:27017/dbsa',
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

//metto in ascolto il web server
app.listen(3000, function () {
  console.log('Node API server started on port 3000!');
});
