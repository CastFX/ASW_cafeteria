module.exports = function(app) {
	var controller = require('../controllers/controller');
  var passport = require('passport');

	app.route('/')
		.get(function(req, res) {
			res.send("Test Jenkins CI_2");
		})

	app.route('/login')
		.get(controller.show_login);
		//.post(controller.login);

	app.route('/api/corsi')
		.get(controller.list_corsi);

	app.route('/api/utenti')
		.get(controller.list_utenti)
		.post(controller.new_utente);

	app.route('/api/tickets')
		.get(controller.list_tickets);

	app.route('/api/userTicketsTotal')
		.get(controller.list_userTicketsTotal);

	app.get('/api/userTickets', isLoggedIn, controller.list_userTickets);

	app.get('/tickets', isLoggedIn, controller.show_tickets);

  //In teoria route serve solo a fare percorsi concatenati, quindi app.get dovrebbe andare bene
  /*
	app.route('/hextris', isLoggedIn)
		.get(controller.show_game);
  */
	app.get('/hextris', isLoggedIn, controller.show_game);

	//sessione
	app.route('/success').get((req, res) => res.send("Welcome "+req.query.username+"!!"));
	app.route('/error').get((req, res) => res.send("error logging in"));

	app.post('/login',
		 passport.authenticate('local', { failureRedirect: '/login' }),
		 function(req, res) {
		   res.redirect('/success?username='+req.user._id);
		 });

	app.get('/logout', (request, response) => {
		  request.logout();
		  response.redirect('/login');
	});

	function isLoggedIn(request, response, next) {
    // passport adds this to the request object
  	if (request.isAuthenticated()) {
        return next();
    }
    response.redirect('/login');
	}
}
