const express = require('express');
const router = express.Router();
const request = require('request');
const config = require('config');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');
//const { response } = require('express');
//@route GET api/Profile
//@desc get current users profile
//@access private
router.get('/me', auth, async (req, res) => {
    try{
        const profile = await Profile.findOne({ user: req.user.id }).populate('user',['name', 'avatar']);
        if(!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user' });
            
        }
        res.json(profile);
    } catch(err) {
        console.error(err.message);
        res.status(500).send('server error')
    }
});

router.post('/', [auth, [
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Skills is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const {
        website,
        skills,
        youtube,
        twitter,
        instagram,
        linkedin,
        facebook,
        company,
        location,
        bio,
        status,
        githubusername
      } = req.body;

      const profileField = {};
      profileField.user = req.user.id;
      if(company) profileField.company = company;
      if(website) profileField.website = website;
      if(location) profileField.location = location;
      if(bio) profileField.bio = bio;
      if(status) profileField.status = status;
      if(githubusername) profileField.githubusername = githubusername;
      if(skills) {
        profileField.skills = skills.split(',').map(skill => skill.trim());
      }


      profileField.social = {}
      if(youtube) profileField.social.youtube = youtube;
      if(twitter) profileField.social.twitter = twitter;
      if(facebook) profileField.social.facebook = facebook;
      if(linkedin) profileField.social.linkedin = linkedin;
      if(instagram) profileField.social.instagram = instagram;
      
      
      try {
          let profile = await Profile.findOne({ user: req.user.id });
          if(profile) {
              profile = await Profile.findOneAndUpdate({ user: req.user.id }, {$set: profileField}, {new : true });
              return res.json(profile);
          }
          profile = new Profile(profileField);
          await profile.save();
          res.json(profile);
      } catch(err) {
          console.error(err.message);
          res.status(500).send('server error3');     
        }
});

router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server error4');
    }
});

//@route GET api/profile/user/:user_id
//@desc get profle by user id
//@access public

router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);
        
        if(!profile) {
            return res.status(400).json({ msg: 'profile not found' });
        }
        
        res.json(profile);
    } catch(err) {
        console.error(err.message);
        if(err.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'Profile not found' });
        }
        res.status(500).send('Server error5');
    }
});


//@route delete api/profile
//@desc delete profile, user & posts
//@access private

router.delete('/', auth, async (req, res) => {
    try {
        //remove user post
        await Post.deleteMany({ user: req.user.id});
        //remove profile
        await Profile.findOneAndRemove({ user: req.user.id });
        //remove user
        await User.findOneAndRemove({ _id: req.user.id });
        res.json({msg: 'User deleted' });
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server error4');
    }
});

//@route put api/profile/experience
//@desc add profile experience
//@access private

router.put('/experience', [ auth, 
check('title','title is required').not().isEmpty(),
check('company', 'company is required').not().isEmpty(),
check('from', 'from date is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        title, company, location, from, to, current, description
    } = req.body;

    const newexp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({ user: req.user.id });

        profile.experience.unshift(newexp);

        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error 6')
    }
});

//@route delete api/profile/experience/:exp_id
//@desc delete experience from profile
//@access private

router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        //get remove index
        const removeindex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
        profile.experience.splice(removeindex, 1);
        await profile.save();
        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error 7');
    }
});


//@route put api/profile/education
//@desc add profile experience
//@access private

router.put('/education', [ auth, 
    check('school','school is required').not().isEmpty(),
    check('degree', 'degree is required').not().isEmpty(),
    check('fieldofstudy', 'fieldofstudy is required').not().isEmpty(),
    check('from', 'from is required').not().isEmpty()
    ], async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
    
        const {
            school,
            degree,
            fieldofstudy,
            from, 
            to, 
            current, 
            description
        } = req.body;
    
        const newedu = {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        }
    
        try {
            const profile = await Profile.findOne({ user: req.user.id });
    
            profile.education.unshift(newedu);
    
            await profile.save();
    
            res.json(profile);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error 8')
        }
    });
    
    //@route delete api/profile/experience/:exp_id
    //@desc delete experience from profile
    //@access private
    
    router.delete('/education/:edu_id', auth, async (req, res) => {
        try {
            const profile = await Profile.findOne({ user: req.user.id });
    
            //get remove index
            const removeindex = profile.education.map(item => item.id).indexOf(req.params.edu_id);
            profile.education.splice(removeindex, 1);
            await profile.save();
            res.json(profile);
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server error 9');
        }
    });

    //@route get api/profile/github:username
    //@desc get user repo from github
    //@access public

    router.get('/github/:username', (req, res) => {
        try {
            const options = {
                uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientID')}&client_secret=${config.get('githubSecret')}`,
                method: 'GET',
                headers: {'user-agent': 'node.js'}
            }

            request(options, (error, response, body) => {
                if(error) console.error(error);

                if(response.statusCode != 200) {
                    res.status(404).json({ msg: 'No Github profile found'});

                }
                res.json(JSON.parse(body));
            });
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server error10');
        }
    });
module.exports = router;