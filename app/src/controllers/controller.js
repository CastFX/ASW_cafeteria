var mongoose = require('mongoose');
var Corsi = mongoose.model('Corsi');



//Login lista di corsi per signup
exports.list_corsi = function(req, res) {
	Corsi.find({}, function(err, corsi) {
		if (err)
			res.send(err);
		res.json(corsi);
	});
};

//Login route
exports.show_login = function(req, res) {
	res.sendFile(appRoot + '/www/login.html');
};



exports.show_game = (req, res) => res.sendFile(appRoot + '/www/hextris.html');
