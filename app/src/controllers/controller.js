var mongoose = require('mongoose');
var Alignment = mongoose.model('Alignments');

exports.align_sequences = function(req, res) {
	var sa = require('../lib/sequences_alignment');

	//Se non sono specificate le due sequenze di input, ritorno 404
	if(!req.body.seq1 || !req.body.seq2){
		res.status(404).send({
			description: 'Two sequences seq1 and seq2 are required'
		});
	}
	else{
		//controllo se presente sul db
		Alignment.find({s1: req.body.seq1, s2: req.body.seq2},  '-_id -__v', function(err, alignment) {
			if (err)
				res.send(err);
			if(alignment.length==0){
				//Se non presente, calcolo
				alignment = sa.needleman_wunsch(req.body.seq1, req.body.seq2);

				//E poi inserisco su Db
				var new_alignment = new Alignment(alignment);
				new_alignment.save(function(err, alignment) {
					if (err)
						res.send(err);
				});
			}
			else{
				//Altrimento restituisco direttamente
				alignment = alignment[0];
			}
			res.json(alignment);
		});
	}
};

//Login
exports.show_login = function(req, res) {
	res.sendFile(appRoot + '/www/login.html');
};
