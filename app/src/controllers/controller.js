var mongoose = require('mongoose');
var Corsi = mongoose.model('Corsi');
var Utenti = mongoose.model("Utenti");
var Tickets = mongoose.model("Tickets");
var UserTickets = mongoose.model("UserTickets");

var Crypto = require('crypto');
const passport = require('passport');


exports.homepage = (req, res) => {
	res.sendFile(appRoot + '/www/home.html');
};

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

//PIECHART TESTING

exports.show_piechart = (req, res) => {
	res.sendFile(appRoot + '/www/pieChart.html');
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
/*
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
*/

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
		Utenti.findOne({_id: username}, function(err, utente) {
			if (err)
				return done(err);
			if (!utente)
				return done(null, false);
			var hashedPass = sha512(password, utente.sale);
			if (hashedPass.passwordHash == utente.password) {
				return done(null, utente);
			} else {
				return done(null, false);
			}
		});
  }
));

exports.get_lives = (req, res) => {
	Utenti.findOne({_id: req.user._id}, function(err, utente) {
		if (err) {
			res.send(err);
			return;
		}
		res.json(utente.life);
	});
}

exports.get_played_games = (req, res) => {
	Utenti.aggregate([
		{ $match: { _id: req.user._id}}, // query documents (can return more than one element)
		{ $unwind: '$games'}, //deconstruct the documents
		{ $sort: { 'games.score': -1}},
		{ $limit: 3 },
		{ $group: {_id: req.user._id, games: { $push: '$games' }}}, //reconstruct the documents
	]).exec((err, games) => res.json(games));
}


exports.prepare_game = (req, res) => {
	Utenti.findOne({_id: req.user._id}, function(err, utente) {
		if (err) {
			res.send(err);
			return;
		}
		if (utente.life == 0) {
			res.json("zero lives left");
			// res.sendFile(appRoot + '/www/ZeroLives.html');
		} else {
			var game = {
				_id: mongoose.Types.ObjectId(),
				score: 0.0,
				started: false,
				date: Date()
			}
			utente.games.addToSet(game);
			utente.save(error => {
				if (error) {
					console.log(error);
				} else {
					res.json(game._id);
				}
			});
		}
	});
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
	//regardless of score
	odds = {
		50 : 0.96,	//4%
		33 : 0.90,	//6%
		25 : 0.80,	//10%
		10 : 0.60,	//20%
		0 :	0		//60%
	};
	var discount = getRandomizedDiscount(odds);
	if (percentile >= 95 && score >= 4000) {
		discount = 50;		//100%
	} else if (percentile >= 80 && score >= 3000) {
		odds[50] = 0.90;	//10%
		odds[33] = 0.75;	//15%
		odds[25] = 0.40;	//25%
		odds[10] = 0;		//40%
		odds[0] = 0;		//0%
	} else if (percentile >= 70 && score >= 2500) {
		odds[50] = 0.92;	//8%
		odds[33] = 0.80;	//12%
		odds[25] = 0.60;	//20%
		odds[10] = 0.30;	//30%
		odds[0] = 0;		//30%
	} else if (percentile >= 60 && score >= 2000) {
		odds[50] = 0.95;	//5%
		odds[33] = 0.85;	//10%
		odds[25] = 0.70;	//15%
		odds[10] = 0.40;	//30%
		odds[0] = 0;		//40%
	} else if (percentile >= 50 && score >= 1500) {
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
