const {param, body} = require("express-validator");
var mongoose = require('mongoose');
var Corsi = mongoose.model('Corsi');
var Utenti = mongoose.model("Utenti");

const passwordMinLength = 8;
const usernameMinLength = 4;

exports.new_user = [
    body("_id")
		.trim()
		.isLength({min: usernameMinLength}).withMessage("Username must be at least " + usernameMinLength + " characters long")
		.isAlphanumeric().withMessage("Username can only contain letters and numbers")
		.custom(async value => {
			if (await Utenti.findOne({_id: value})) {
				return Promise.reject();
			}
        }).withMessage("Username already in use"),
        
	body("email")
		.normalizeEmail()
		.isEmail().withMessage("Invalid email")
		.custom(async value => {
			if (await Utenti.findOne({email: value})) {
				return Promise.reject();
			}
        }).withMessage("Email already in use"),
        
	body("password")
        .isLength({min: passwordMinLength}).withMessage("Password must be at least " + passwordMinLength + " characters long"),
        
	body("corso")
		.trim()
		.custom(async value => {
			const course = await Corsi.findOne({_id: value});
			if (!course) {
				return Promise.reject();
			}
		}).withMessage("Invalid course")
];

exports.login = [
	body("username")
		.trim()
		.exists().withMessage("Username is missing")
		.not().isEmpty().withMessage("Username is missing"),
	body("password")
		.exists().withMessage("Password is missing")
		.not().isEmpty().withMessage("Password is missing"),
]

exports.reset_password = [
	body("password")
		.exists().withMessage("Password is missing")
		.isLength({min: passwordMinLength}).withMessage("Password must be at least " + passwordMinLength + " characters long"),

	body("confirm_password")
		.trim()
		.exists().withMessage("Confirmation password is missing")
		.custom((value, {req}) => {
			if (value !== req.body.password) {
				throw new Error();
			}
			return true;
		}).withMessage("Confirmation password doesn't match password"),

	param("token")
		.exists().withMessage("Reset token is missing")
		.custom(async value => {
			if (! await Utenti.findOne({
				resetPasswordToken: value, 
				resetPasswordExpires: { $gt: Date.now() }
			})) {
				return Promise.reject();
			}
		}).withMessage("Password reset token is invalid or has expired")
];

exports.request_reset_email = [
	body("username")
		.exists().withMessage("Username is missing")
		.not().isEmpty().withMessage("Username is missing")
		.custom(async value => {
			if (! await Utenti.findOne({_id: value})) {
				return Promise.reject();
			}
		}).withMessage("User not found")
]

exports.scoreSubmit = [

];