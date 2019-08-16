var mongoose = require('mongoose');
var Corsi = mongoose.model('Corsi');
var Utenti = mongoose.model("Utenti");
var Tickets = mongoose.model("Tickets");
var UserTickets = mongoose.model("UserTickets");
var EmailVerifications = mongoose.model("EmailVerifications");
var nodemailer = require("nodemailer");
const { body, check, validationResult } = require('express-validator');


var smtpTransport = nodemailer.createTransport({
	host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: process.env.GMAIL_HOST,
		pass: process.env.GMAIL_PSW
	}
});

var Crypto = require('crypto');
const passport = require('passport');


// exports.homepage = (req, res) => {
// 	res.sendFile(appRoot + '/www/home.html');
// };

exports.home = (req, res) => {
	res.sendFile(appRoot + '/www/index.html');
}
//aswcafeteria@gmail.com
exports.confirm_email = async (req, res) => {
	try {
		const data = await EmailVerifications.findOneAndDelete({hash: req.params.hash});
		if (!data) {
			//either already confirmed or not found
			res.send("Email already verified or invalid link");
			return;
		}
		const user = await Utenti.findOneAndUpdate(
		{_id: data._id},
		{
			"$set" : {
				"active" : true,
			}
		},
		{
			useFindAndModify: false,
		});
		if (user) {
			res.redirect("/login");
		} else {
			res.send("Invalid link");
		}
	} catch (error) {
		console.log(error);
		res.send(error);
	}
}

exports.send_forgot_email = async(req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.json({errors: errors.array()});
	}
	try {
		const user = await Utenti.findOne({_id: req.body.username});
		var token = Crypto.randomBytes(20).toString('hex');
		user.resetPasswordToken = token;
		user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
		await user.save();
		mailOptions = {
			to: user.email,
			subject: 'ASW-Cafeteria Password Reset',
			text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
				'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
				'http' + (req.headers.host != "localhost" ? 's' : '') + '://' + req.headers.host + '/reset/' + token + '\n\n' +
				'If you did not request this, please ignore this email and your password will remain unchanged.\n'
		};
		smtpTransport.sendMail(mailOptions);
		res.json({message: 'An e-mail has been sent with further instructions.'});
	} catch(error) {
		console.log(error);
		res.json({error: error});
	}
};

exports.send_reset_password = (req, res) => {
	res.sendFile(appRoot + "/www/passwordReset.html");
};

exports.reset_password = async(req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.json({errors: errors.array()});
	}
	try {
		const user = await Utenti.findOne({
			resetPasswordToken: req.params.token, 
			resetPasswordExpires: { $gt: Date.now() }
		});
		const hashedPass = sha512(req.body.password, salt);
		user.password = hashedPass.passwordHash;
		user.sale = hashedPass.salt;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpires = undefined;
		await user.save();
		const mailOptions = {
			to: user.email,
			subject: 'Your password has been changed',
			text: 'Hello,\n\n' + 'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
		}
		smtpTransport.sendMail(mailOptions);
		res.json({
			username: user._id,
			message: "Password successfully updated"
		});
		// res.redirect("/login");
	} catch (error) {
		console.log(error);
		res.json({error: error});
	}
};

get_rankings = async() => {
	try {
		const utenti = await Utenti.find({});
		dataset = [];
		for (i = 0; i < utenti.length; i++) {
			var score = 0;
			if (utenti[i]._id != "admin") {
				for (j = 0; j < utenti[i].games.length; j++) {
					score += utenti[i].games[j].score;
				}
				if (dataset.findIndex(item => item.label == utenti[i].corso) != -1) {
					dataset[dataset.findIndex(item => item.label == utenti[i].corso)].count += score;
				} else {
					dataset.push({label:utenti[i].corso, count: score});
				}
			}
		}
		return dataset;
	} catch (error) {
		return error;
	}
}

exports.get_home_data = async (req, res) => {
	const rankings = await get_rankings();
	if (rankings.error) {
		console.log(rankings.error);
		res.json(rankings.error);
		return;
	}
	const isLoggedIn = req.isAuthenticated();
	res.json({
		isLoggedIn: isLoggedIn,
		username: isLoggedIn ? req.user._id : "",
		rankings: rankings.dataset
	});
}


//Login lista di corsi per signup
exports.list_corsi = function(req, res) {
	Corsi.find({}, function(err, corsi) {
		if (err)
			res.send(err);
		res.json(corsi);
	});
};


exports.show_tickets = function(req, res) {
	res.sendFile(appRoot + '/www/ticket.html');
};

exports.show_adminTickets = function(req, res) {
	res.sendFile(appRoot + '/www/ticketAdmin.html');
};

//TIPOLOGIE DI TICKET ESISTENTI
exports.list_tickets = function(req, res) {
	Tickets.find({}, function(err, tickets) {
		if (err)
			res.send(err);
		res.json(tickets);
	});
};

//TICKET RELATIVI ALL'UTENTE LOGGATO
exports.list_userTickets = function(req, res) {
	UserTickets.find({idUtente: req.user._id})
		.populate('idTipoTicket').select('idTipoTicket').exec(function(err, tickets) {
		if (err)
			res.send(err);
		res.json(tickets);
	});
};

//TICKET RELATIVI A TUTTI GLI UTENTI PER L'ADMIN
exports.list_adminUserTicketsTotal = function(req, res) {
	UserTickets.find()
		.populate('idTipoTicket').exec(function(err, tickets) {
		if (err)
			res.send(err);
		res.json(tickets);
	});
};

//ELIMINAZIONE DI UN TICKET UTILIZZATO DA UN UTENTE DA PARTE DELL'ADMIN
exports.delete_ticket = function(req, res) {
	UserTickets.findOneAndDelete({_id: req.params.id}, function(error, result) {
		if (error) {
			res.send(error);
		}
		else {
			res.json(result);
		}
  });
};

exports.show_piechart = (req, res) => {
	res.sendFile(appRoot + '/www/pieChart.html');
};

exports.show_pie_user = (req, res) => {
	res.sendFile(appRoot + '/www/pieChartUser.html');
};

exports.show_bar = (req, res) => {
	res.sendFile(appRoot + '/www/barChart.html');
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

var sendVerificationEmail = async(userid, email, host) => {
	var hash = Crypto.randomBytes(20).toString('hex');
	try {
		await EmailVerifications.updateOne(
			{_id: userid},
			{_id: userid, hash: hash},
			{upsert: true}
		);
		const confirmationLink = "https://" + host + "/email/confirm/" + hash;
		const mailOptions = {
			to: email,
			subject: "Please confirm your ASW-Cafeteria account",
			html: 'Hello,<br> Please Click on the following link to verify your email.<br><a href="' + confirmationLink + '">'+confirmationLink+'</a>'
		}
		smtpTransport.sendMail(mailOptions);
		return "ok";
	} catch (error) {
		console.log(error);
		return { isError: true, error: error };
	}
}

//Creazione di un nuovo utente
exports.new_utente = async function(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.json({errors: errors.array()});
	}
	var hashedPass = sha512(req.body.password, salt);
	var new_user = {
		_id: req.body._id,
		email: req.body.email,
		corso: req.body.corso,
		password: hashedPass.passwordHash,
		sale: hashedPass.salt,
		active: false
	}
	try {
		await new Utenti(new_user).save();
		sendVerificationEmail(new_user._id, new_user.email, req.get("host"));
		res.status(201).json({msg: "Please check your email to verify your new account"});
	} catch (error) {
		console.log(error);
		res.status(501).json({errors: [error]});
	}
};

//sessione
passport.serializeUser(function(user, cb) {
  	cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
	Utenti.findById(id, function(err, user) {
		cb(err, user);
	});
});

const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
  function(username, password, done) {
	  console.log("login attempt by " + username);
		Utenti.findOne({_id: username}, function(err, utente) {
			if (err) {
				return done(err);
			}
			if (!utente) {
				return done(null, false, {message: "User not found"});
			}
			var hashedPass = sha512(password, utente.sale);
			if (hashedPass.passwordHash == utente.password) {
				if (utente.active) {
					return done(null, utente, {message: "Login Verified"});
				} else {
					return done(null, false, {message: "Email not verified"});
				}
			} else {
				return done(null, false, {message: "Invalid credential"});
			}
		});
  }
));

exports.check_login = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.json({errors: errors.array()});
	}
	passport.authenticate('local', function(err, user, info) {
		if (err) {
			return next(err);
		}
		if (!user) {
			return res.json({
				errors: [{msg: info.message}]
			});
		}
		req.logIn(user, function(err) {
			if (err) { return next(err); }
			if (user._id == "admin") {
				return res.json({path: "/admin/userTickets"});
			} else {
				return res.json({path: "/"});
			}
		});
	})(req, res, next);
}

exports.get_lives = (req, res) => {
	Utenti.findOne({_id: req.user._id}, function(err, utente) {
		if (err) {
			res.send(err);
			return;
		}
		res.json(utente.life);
	});
}

exports.get_played_games = async(req, res) => {
	try {
		const user = await Utenti.findOne({_id: req.user._id});
		if (user.games.length > 0) {
			user.games.sort((a,b) => b - a);
			user.games.slice(0,3);
		}
		res.json({
			lives: user.life,
			games: user.games
		});
		// var data = await Utenti.aggregate([
		// 	{ $match: { _id: req.user._id}}, // query documents (can return more than one element)
		// 	{ $unwind: '$games'}, //deconstruct the documents
		// 	{ $sort: { 'games.score': -1}},
		// 	{ $limit: 3 },
		// 	{ $group: {_id: req.user._id, lives: { $first: '$life'}, games: { $push: '$games' }}}, //reconstruct the documents
		// ]);
		// res.json(games); 
	} catch (err) {
		res.send({error: err});
	}
}


exports.prepare_game = async (req, res) => {
	try {
		const user = await Utenti.findOne({_id: req.user._id}); 
		if (user.life == 0) {
			return res.json({errors: [{msg: "Zero lives left"}]});
		} 
		const game = {
			_id: mongoose.Types.ObjectId(),
			score: 0.0,
			started: false,
			date: Date()
		}
		user.games.addToSet(game);
		await user.save();
		res.json(game._id);
	} catch (error) {
		res.json({errors: [error]});
	}
}


//Game page
exports.show_game = (req, res) => {
	Utenti.findOne({"games._id": req.params.gameid}, function(err, utente) {
		if (err) {
			res.send(err);
			return;
		}
		const game = utente.games.id(req.params.gameid);
		if (!game) {
			res.json(game);
		} else {
			res.sendFile(appRoot + '/www/hextris.html');
		}
	});
}

exports.start_game = (req, res) => {
	if (req.params.gameid) {
		Utenti.findOne({"games._id": req.params.gameid}, function(err, utente) {
			if (err) {
				res.send(err);
			}
			const game = utente.games.id(req.params.gameid);
			if (utente.life <= 0 || !game || game.started) {
				res.sendStatus(403);
			} else {
				utente.life--;
				game.set({"started": true});
				utente.save((err, utente) => {
					res.sendStatus(201);
				});
			}
		});
	}
}

calculatePercentile = async (score) => {
	return Utenti.aggregate([
	{$unwind : "$games" },
	{$project: {
		_id:1,
		lessThanScore: {
			$cond: {
				if: { $eq: ["$games.score", 0] },
				then: 0,
				else: {
					$cond: {
						if: { $lt: ["$games.score", score] },
						then: 1,
						else: 0,
					}
				}
			}
		},
		scoreCount:{
			$cond: {
				if: { $eq: [ "$games.score", 0 ] },
				then: null,
				else: 1}}
		}
	},
	{$group : {
		_id : null,
		totalScores : { $sum : "$scoreCount" },
		countLess : { $sum : "$lessThanScore"}
	}},
	{$project : {
		percentile : { $divide : ["$countLess", "$totalScores"] }
	}}]);
}

getRandomizedDiscount = (discount_odds) => {
	const rand = Math.random();
	if (rand >= discount_odds[50]) {
		return 50;
	} else if (rand >= discount_odds[33]) {
		return 33;
	} else if (rand >= discount_odds[25]) {
		return 25;
	} else if (rand >= discount_odds[10]) {
		return 10;
	} else {
		return 0;
	}
}

generateWinTicket = (score, percentile, gameid, userid) => {
	if (userid == "admin") {
		return {
			type : "coffee",
			discount: 50,
			description : "Discount on your next coffee",
			image : "/static/images/coffee.png",
			gameid: gameid,
			userid: userid,
			percentile: percentile
		}
	}
	//regardless of score
	odds = {
		50 : 0.96,	//4%
		33 : 0.90,	//6%
		25 : 0.80,	//10%
		10 : 0.60,	//20%
		0 :	0		//60%
	};
	var discount = getRandomizedDiscount(odds);
	if (percentile >= 0.95 && score >= 4000) {
		discount = 50;		//100%
	} else if (percentile >= 80 && score >= 3000) {
		odds[50] = 0.90;	//10%
		odds[33] = 0.75;	//15%
		odds[25] = 0.40;	//25%
		odds[10] = 0;		//40%
		odds[0] = 0;		//0%
	} else if (percentile >= 0.70 && score >= 2500) {
		odds[50] = 0.92;	//8%
		odds[33] = 0.80;	//12%
		odds[25] = 0.60;	//20%
		odds[10] = 0.30;	//30%
		odds[0] = 0;		//30%
	} else if (percentile >= 0.60 && score >= 2000) {
		odds[50] = 0.95;	//5%
		odds[33] = 0.85;	//10%
		odds[25] = 0.70;	//15%
		odds[10] = 0.40;	//30%
		odds[0] = 0;		//40%
	} else if (percentile >= 0.50 && score >= 1500) {
		odds[50] = 0.95;	//5%
		odds[33] = 0.88;	//7%
		odds[25] = 0.75;	//13%
		odds[10] = 0.50;	//25%
		odds[0] = 0; 		//50%
	}
	const newDiscount = getRandomizedDiscount(odds);
	discount = newDiscount > discount ? newDiscount : discount;
	if (discount == 0) {
		return false;
	}
	const discountedItems = ["brioche",	"coffee", "juice", "sandwich"];
	const selectedType = discountedItems[Math.floor(Math.random() * discountedItems.length)];
	return {
		type : selectedType,
		discount: discount,
		description : "Discount on your next " + selectedType,
		image : "/static/images/"+ selectedType + ".png",
		gameid: gameid,
		// userid: mongoose.Types.ObjectId(userid)
		userid: userid,
		percentile: percentile
	};
}

exports.submit_score = async (req, res) => {
	if (req.body.gameid && req.body.score >= 0) {
		try {
			const gameid = req.body.gameid;
			const userid = req.user._id;
			const score = req.body.score;
			const percentileData = await calculatePercentile(score);
			const percentile = percentileData[0].percentile;
			const ticketData = generateWinTicket(score, percentile, gameid, userid);

			if (!ticketData) {
				const user = await Utenti.findOne({_id: userid});
				res.status(201).json({
					games: user.games
						.sort((a,b) => b.score - a.score)
						.slice(0,3),
					ticket: false
				});
			} else {

				const savedTicket = await new Tickets(ticketData).save();
				new UserTickets({
					idUtente: userid,
					idTipoTicket: savedTicket._id
				}).save();
				const user = await Utenti.findOneAndUpdate(
					{_id: userid, "games._id": gameid},
					{
						"$set" : {
							"games.$.score" : score,
							"games.$.ticket" : savedTicket._id,
						}
					},
					{
						useFindAndModify: false,
						new: true,
					}
				);
				res.status(201).json({
					games: user.games
						.sort((a,b) => b.score - a.score)
						.slice(0,3),
					ticket: ticketData
				});
				// 	Utenti.findOneAndUpdate(
				// 		{_id: userid, "games._id": gameid},
				// 		{
				// 			"$set" : {
				// 				"games.$.score" : score,
				// 				"games.$.ticket" : savedTicket.id,
				// 			}
				// 		},
				// 		{
				// 			useFindAndModify: false,
				// 			new: true,
				// 		},
				// 		(err,user) => {
				// 			if (err) {
				// 				res.send(err);
				// 				console.log("err");
				// 				return;
				// 			}
				// 			res.status(201).json({
				// 				games: user.games
				// 					.sort((a,b) => b.score - a.score)
				// 					.slice(0,3),
				// 				ticket: ticketData
				// 			});
				// 		}
				// 	);
				// });
			}
		} catch (e) {
			console.log(e);
		}

	}
}
