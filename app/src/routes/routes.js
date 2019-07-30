module.exports = function(app) {
	var controller = require('../controllers/controller');
  var passport = require('passport');

	app.route('/')
		.get(isLoggedIn, controller.homepage);

	app.get('/login', isNotLoggedIn, controller.show_login);

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

  //GESTIONE TICKET DELL'ADMIN
	app.get('/api/admin/userTickets', isAdminLoggedIn, controller.list_adminUserTicketsTotal);

	app.get('/admin/userTickets', isAdminLoggedIn, controller.show_adminTickets);

	app.route('/api/userTicketsTotal/:id')
		.delete(controller.delete_ticket);

  //ROUTE PIE CHART TESTING

	app.route('/pie')
		.get(controller.show_piechart);


  //In teoria route serve solo a fare percorsi concatenati, quindi app.get dovrebbe andare bene
  /*
	app.route('/hextris', isLoggedIn)
		.get(controller.show_game);
  */
	app.get('/api/createGameSession', isLoggedIn, controller.prepare_game);
	app.get('/api/lives', isLoggedIn, controller.get_lives);
	app.get('/api/playedGames', isLoggedIn, controller.get_played_games);
	app.get('/hextris/game/:gameid', isLoggedIn, controller.show_game);
	app.get('/api/startGame/:gameid', isLoggedIn, controller.start_game);
	app.post('/api/submitScore', isLoggedIn, controller.submit_score);

	//sessione
	app.route('/success').get((req, res) => res.send("Welcome "+req.query.username+"!!"));
	app.route('/error').get((req, res) => res.send("error logging in"));

	app.post('/login',
		 passport.authenticate('local', { failureRedirect: '/login' }),
		 function(req, res) {
		res.redirect("/");
		//    res.redirect('/success?username='+req.user._id);
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

	function isNotLoggedIn(request, response, next) {
    // passport adds this to the request object
  	if (!request.isAuthenticated()) {
        return next();
    }
    response.redirect('/success?username='+request.user._id);
	}


	function isAdminLoggedIn(request, response, next) {
    // passport adds this to the request object
  	if (request.isAuthenticated() && request.user._id == "admin") {
        return next();
    }
    response.redirect('/login');
	}
}
