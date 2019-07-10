var mongoose = require('mongoose');
var Corsi = mongoose.model('Corsi');
var Utenti = mongoose.model("Utenti");
var Crypto = require('crypto');


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

//Esporta gli utenti
exports.list_utenti = function(req, res) {
	Utenti.find({}, function(err, utenti) {
		if (err)
			res.send(err);
		res.json(utenti);
	});
};


var length = 32;
var salt = Crypto.randomBytes(Math.ceil(length/2))
						.toString('hex') /** convert to hexadecimal format */
						.slice(0,length);   /** return required number of characters */

var sha512 = function(password, salt){
	var hash = Crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
	hash.update(password);
	var value = hash.digest('hex');
	return {
						salt:salt,
						passwordHash:value
				 };
};


//Creazione di un nuovo utente
exports.new_utente = function(req, res) {
	var hashedPass = sha512(req.body.password,salt);
	var new_user = req.body;
	new_user.password = hashedPass.passwordHash;
	new_user.sale = hashedPass.salt;
	var new_utente = new Utenti(new_user);
	new_utente.save(function(err, utente) {
		if (err)
			res.send(err);
		res.status(201).json(utente);
	});
};

//login
exports.login = function(req, res) {
	Utenti.findOne({_id: req.body._id}, function(err, utente) {
		if (err || utente == null) {
			res.status(404).send({ error: 'Wrong Username!' });
		} else {
			var hashedPass = sha512(req.body.password, utente.sale);
			if (hashedPass.passwordHash == utente.password) {
				res.status(201).json(utente);
			} else {
				res.status(404).send({ error: 'Wrong Password!' });
			}
		}
	});
}

exports.show_game = (req, res) => res.sendFile(appRoot + '/www/hextris.html');
