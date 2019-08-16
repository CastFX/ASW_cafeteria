module.exports = function(app) {
	var controller = require('../controllers/controller');
	var validator = require("../controllers/validator");
  	var passport = require('passport');

	app.route('/')
		.get(controller.home);

	app.get('/login', isNotLoggedIn, controller.show_login);

	app.get("/email/confirm/:hash", controller.confirm_email);
	app.get("/reset/:token", controller.send_reset_password);
	app.post("/reset/:token", validator.reset_password, controller.reset_password);
	app.post("/api/sendForgotEmail", validator.request_reset_email, controller.send_forgot_email);
	app.get("/api/homeData", controller.get_home_data);

	app.route('/api/corsi')
		.get(controller.list_corsi);

	app.route('/api/utenti')
		.get(isAdminLoggedIn, controller.list_utenti)
		.post(validator.new_user, controller.new_utente);

	app.route('/api/tickets')
		.get(controller.list_tickets);

	app.get('/api/userTickets', isLoggedIn, controller.list_userTickets);
	app.delete('/api/userTickets/:id', isAdminLoggedIn, controller.delete_ticket);

	app.get('/tickets', isLoggedIn, controller.show_tickets);

  	//GESTIONE TICKET DELL'ADMIN
	app.get('/api/admin/userTickets', isAdminLoggedIn, controller.list_adminUserTicketsTotal);
	app.get('/admin/userTickets', isAdminLoggedIn, controller.show_adminTickets);



	app.get('/admin/pie', isAdminLoggedIn, controller.show_piechart);
	app.get('/pie', isLoggedIn, controller.show_pie_user);
	app.route('/bar')
		.get(controller.show_bar);


	//Hextris
	app.get('/api/createGameSession', isLoggedIn, controller.prepare_game);
	app.get('/api/lives', isLoggedIn, controller.get_lives);
	app.get('/api/playedGames', isLoggedIn, controller.get_played_games);
	app.get('/hextris/game/:gameid', isLoggedIn, controller.show_game);
	app.get('/api/startGame/:gameid', isLoggedIn, controller.start_game);
	app.post('/api/submitScore', isLoggedIn, controller.submit_score);

	//LOGIN, LOGOUT
	app.post('/login', validator.login, controller.check_login);

	app.get('/logout', (request, response) => {
		  request.logout();
		  response.redirect('/');
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
    	response.redirect('/');
	}


	function isAdminLoggedIn(request, response, next) {
    // passport adds this to the request object
  	if (request.isAuthenticated() && request.user._id == "admin") {
        return next();
    }
    response.redirect('/login');
	}
}
