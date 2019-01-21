const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const keys = require('../../config/Keys');


//load user validation

const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

const User = require('../../models/User');

// @get / api/user/test
// @dec  test users routes
// @access public
router.get('/test', (req, res) => {
	res.json({message: 'users works'});
});


// @get / api/user/register
// @dec  test register routes
// @access public
router.post('/register', (req, res) => {

	  const { errors, isValid } = validateRegisterInput(req.body);

	  // Check Validation
	  if (!isValid) {
	    return res.status(400).json(errors);
	  }

	User.findOne({email: req.body.email})
	    .then((user) => {
	    	if(user) {
                 errors.email = 'Email already exists';
                 return res.status(400).json(errors);
 	    	} else {

	    		//use avatra module for bring user image from avatar
	    		const avatar = gravatar.url(req.body.email, {
	    			s: '200', //size
	    			r: 'pg', // Rating
	    			d: 'mm', // default
	    		});

                // take user infotmation and save it in object 
	    		const newUser = new User({
	    			name: req.body.name,
	    			email: req.body.email,
	    			avatar: avatar,
	    			password: req.body.password
	    			
	    		});

	    		// use bcrypt for hasing the password
	    		bcrypt.genSalt(10, (err, salt) => {
                  bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if(err) console.log(err);

                    //we set the user to hash becouse it was only text
                    newUser.password = hash; 

                    // save the user in our databse
                    newUser
                    .save()
                    .then((user) => res.json(user))
                    .catch( err => console.log(err));
                  })
	    		})

	    	}
	    });
});



// @get / api/user/login
// @dec  test rlogin return jwt 
// @access public

router.post('/login', (req, res) => {

	  const { errors, isValid } = validateLoginInput(req.body);

	  // Check Validation
	  if (!isValid) {
	    return res.status(400).json(errors);
	  }


	const email = req.body.email;
	const password = req.body.password;

	// find user by email
	User.findOne({email})
	    .then(user => {
	    	if(!user) {
	    		 errors.email = 'User not found';
                 return res.status(400).json(errors);
	    	} 

	    	//check the password
	    	bcrypt.compare(password, user.password).then(isMatch => {
	    	      	if(isMatch) {
	    	      		// user matched

	    	      	   // create jwt payload for send to ther server for compaire
	    	      		const payload = {
	    	      			id: user.id,
	    	      			name: user.name,
	    	      			avatar: user.avatar
	    	      		}

	    	      		//sign token
	    	      		jwt.sign(
	    	      			payload,
	    	      			keys.secertOrKey,
	    	      			 {expiresIn: 3600},
	    	      			  (err, token) => {
                                res.json({
                                	success: true,
                                	token: 'Bearer ' + token // if  login success we user should see the token
                                })
	    	      			  })
	    	      	} else {
	    	      		errors.password = 'password incorrect'
	    	      		return res.status(400).json(errors);
	    	      	}
	    	      });
	    });
});


// @route   GET api/users/current
// @desc    Return current user
// @access  Private
router.get(
  '/current',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({
     id: req.user.id,
     name: req.user.name,
     email: req.user.email
    });
  }
);


module.exports = router;