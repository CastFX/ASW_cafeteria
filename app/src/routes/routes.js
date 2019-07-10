module.exports = function(app) {
	var controller = require('../controllers/controller');

	app.route('/')
		.get(function(req, res) {
			res.send("Test Jenkins CI_2");
		})

	app.route('/login')
		.get(controller.show_login)
		.post(controller.login);

	app.route('/api/corsi')
		.get(controller.list_corsi);

	app.route('/api/utenti')
		.get(controller.list_utenti)
		.post(controller.new_utente);

	app.route('/hextris')
		.get(controller.show_game);
};
