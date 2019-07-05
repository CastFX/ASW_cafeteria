module.exports = function(app) {
	var controller = require('../controllers/controller');

	app.route('/')
		.get(function(req, res) {
			res.send("Test Jenkins CI_2");
		})
		.post(controller.align_sequences);


};
