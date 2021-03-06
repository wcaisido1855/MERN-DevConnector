const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const brcypt = require('bcryptjs');
const { check, validationResult } = require('express-validator/check');

//Bring in User model
const User = require('../../models/User');

// @route  GET api/users
// @descrp Register User
// @access Public

router.post(
	'/',
	[
		check('name', 'Name is required')
			.not()
			.isEmpty(),
		check('email', 'Please include a valid email').isEmail(),
		check(
			'password',
			'Please enter a password with 6 or more characters'
		).isLength({ min: 6 })
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { name, email, password } = req.body;

		try {
			// See if user exists
			let user = await User.findOne({ email });

			if (user) {
				return res
					.status(400)
					.json({ errors: [{ msg: 'User already exists' }] });
			}

			// Get user's Gravatar
			const avatar = gravatar.url(email, {
				s: '200',
				r: 'pg',
				d: 'mm'
			});

			// Create new instance of a User. NOTE: DOES NOT SAVE THE USER
			user = new User({
				name,
				email,
				avatar,
				password
			});

			// Encrypt password
			const salt = await brcypt.genSalt(10);

			user.password = await brcypt.hash(password, salt);

			// Save User
			await user.save();

			// Return jsonwebtoken

			res.send('User Registered');
		} catch {
			console.error(err.message);
			res.status(500).send('Server error');
		}
	}
);

module.exports = router;
