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

//Creazione di un nuovo utente
exports.new_utente = function(req, res) {
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
	console.log("BODY");
	console.log(req.body);
	var hashedPass = sha512(req.body.password,salt);
	var new_user = req.body;
	new_user.password = hashedPass.passwordHash;
	new_user.sale = hashedPass.salt;
	console.log("USER");
	console.log(new_user);

	var new_utente = new Utenti(new_user);
	console.log("SAVING");
	console.log(new_utente);
	new_utente.save(function(err, utente) {
		if (err)
			res.send(err);
		res.status(201).json(utente);
	});
};


exports.show_game = (req, res) => res.sendFile(appRoot + '/www/hextris.html');
