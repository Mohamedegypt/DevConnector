const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');


//Load validation
const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');


//load profile model

const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @get / api/profile/test
// @dec  test profile routes
// @access public
router.get('/test', (req, res) => {
    res.json({ message: 'profile works' });
});

// @get / api/profile
// @dec  get current user profile 
// @access privat

router.get('/', passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const errors = {};

        Profile.findOne({ user: req.user.id })
        .populate('user', ['name', 'avatar'])
            .then(profile => {
                if (!profile) {
                    errors.noprofile = 'There is noprofile for this user';
                    return res.status(404).json(errors);
                }
                res.json(profile)
            })
            .catch(err => res.status(404).json(err));
    });

// @route   GET api/profile/all
// @desc    Get  all profile 
// @access  Public
router.get('/all', (req, res) => {
	 const errors = {};
	Profile.find()
	         .populate('user', ['name', 'avatar'])
	         .then(profile => {
	         	if(!profile) {
	         		errors.noprofile = 'There is no profile';
	         		res.status(400).json(errors)
	         	}
	         	res.json(profile)
	         })
	         .catch(err => res.status(404).json({err: 'There is no profile for this user'}));
});


// @route   GET api/profile/user/:handle
// @desc    Get profile by handle 
// @access  Public
router.get('/handle/:handle', (req, res) => {
  const errors = {};

  Profile.findOne({ handle: req.params.handle })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = 'There is no profile for this user';
        res.status(404).json(errors);
      } else {
          res.json(profile);
        }
    
    })
    .catch(err => res.status(404).json(err));
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public
router.get('/user/:user_id', (req, res) => {
	 const errors = {};
	Profile.findOne({user: req.params.user_id})
	         .populate('user', ['name', 'avatar'])
	         .then(profile => {
	         	if(!profile) {
	         	   errors.noprofile = 'There is no profile for this user';
	         		res.status(400).json(errors)
	         	}
	         	res.json(profile)
	         })
	         .catch(err => res.status(404).json({err: 'There is no profile for this user'}));
})


// @route   POST api/profile
// @desc    Create or edit user profile
// @access  Private

router.post('/', passport.authenticate('jwt', { session: false }),
    (req, res) => {
      
    const { errors, isValid } = validateProfileInput(req.body);

    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }

        //get fiéld
        const profileField = {};
        profileField.user = req.user.id;
        if (req.body.handle) profileField.handle = req.body.handle;
        if (req.body.company) profileField.company = req.body.company;
        if (req.body.website) profileField.website = req.body.website;
        if (req.body.location) profileField.location = req.body.location;
        if (req.body.bio) profileField.bio = req.body.bio;
        if (req.body.status) profileField.status = req.body.status;
        if (req.body.githubusername) profileField.githubusername = req.body.githubusername;
        //killes-- split into array
        if (typeof req.body.skills !== 'undefined') {
            profileField.skills = req.body.skills.split(',');
        }

        //Social
        profileField.social = {};
        if (req.body.youtube) profileField.social.youtube = req.body.youtube;
        if (req.body.twitter) profileField.social.twitter = req.body.twitter;
        if (req.body.facebook) profileField.social.facebook = req.body.facebook;
        if (req.body.linkedin) profileField.social.linkedin = req.body.linkedin;
        if (req.body.instagram) profileField.social.instagram = req.body.instagram;

        Profile.findOne({ user: req.user.id })
            .then(profile => {
                if (profile) {
                    // Update
                    Profile.findOneAndUpdate(
                    	{ user: req.user.id },
                    	 { $set: profileField }, 
                    	 { new: true })
                    .then(profile => res.json(profile));
                } else {
                    //Create

                    //Check if handle exisit
                    Profile.findOne({ handle: profileField.handle })
                        .then(profile => {

                            if (profile) {
                              errors.handle = 'that profile is already exisit';
                              res.status(400).json(errors); 
                            }

                           //save profile
                           new Profile(profileField).save()
                              .then(profile => res.json(profile));

                        })
                }
            })
    });

// @route   POST api/profile/experince
// @desc    add  experrince all profile 
// @access  privat

router.post('/experience', passport.authenticate('jwt', 
	{session: false}), 
     (req, res) => {
     const { errors, isValid } = validateExperienceInput(req.body);

    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      // Add to exp array
      profile.experience.unshift(newExp);

      profile.save().then(profile => res.json(profile));
    });
  
});


// @route   POST api/profile/Education
// @desc    add  experrince all profile 
// @access  privat

router.post(
  '/education',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body);

    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      // Add to exp array
      profile.education.unshift(newEdu);

      profile.save().then(profile => res.json(profile));
    });
  }
);


// @route   DELETE api/profile/experience
// @desc    delete  experrince from profile 
// @access  privat

router.delete(
  '/experience/:exp_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        // Get remove index
        const removeIndex = profile.experience
          .map(item => item.id)
          .indexOf(req.params.exp_id);

        // Splice out of array
        profile.experience.splice(removeIndex, 1);

        // Save
        profile.save().then(profile => res.json(profile));
      })
      .catch(err => res.status(404).json(err));
  }
);


// @route   DELETE api/profile/education
// @desc    delete  experrince from profile 
// @access  privat

router.delete(
  '/education/:edu_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        // Get remove index
        const removeIndex = profile.education
          .map(item => item.id)
          .indexOf(req.params.edu_id);

        // Splice out of array
        profile.education.splice(removeIndex, 1);

        // Save
        profile.save().then(profile => res.json(profile));
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route   DELETE api/profile
// @desc    Delete user and profile
// @access  Private
router.delete(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id }).then(() => {
      User.findOneAndRemove({ _id: req.user.id }).then(() =>
        res.json({ success: true })
      );
    });
  }
);

module.exports = router;