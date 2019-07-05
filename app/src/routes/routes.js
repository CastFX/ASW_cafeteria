module.exports = function(app) {
	var controller = require('../controllers/controller');

	app.route('/')
		.get(function(req, res) {
			res.send("Hello World");
		})
		.post(controller.align_sequences);


};
