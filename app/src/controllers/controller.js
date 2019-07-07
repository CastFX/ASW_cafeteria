var mongoose = require('mongoose');

//Login
exports.show_login = function(req, res) {
	res.sendFile(appRoot + '/www/login.html');
};

exports.show_game = (req, res) => res.sendFile(appRoot + '/www/hextris.html');

