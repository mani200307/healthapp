const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const jwt = require('jsonwebtoken');

router.get('/login', (req, res) => {
    res.render('login')
})

router.get('/register', (req, res) => {
    res.render('register')
})

router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    if(!name || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields'});
    }
    
    if(password !== password2) {
        errors.push({ msg: 'Passwords do not match'});
    }

    if(password.length < 6) {
        errors.push({ msg: 'Password should be atleast 6 characters'});
    }

    if(errors.length > 0) {
        res.render('register', {errors: errors});
    } else {
        User.findOne({ email: email})
            .then(user => {
                if(user) {
                    errors.push({ msg: 'Email is already registered'});
                    res.render('register', {errors: errors});
                } else {
                    const newUser = new User({
                        name: name,
                        email: email,
                        password: password,
                    });
                    console.log(newUser)
                    
                    const token = createToken(newUser._id);
                    res.cookie('jwt_user', token, { httpOnly: true, maxAge: maxAge*1000});

                    bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err)
                            throw err;
                        
                        newUser.password = hash
                        newUser.save()
                            .then(user => {
                                req.flash('success_msg', 'You are now registered and can log in');
                                res.redirect('/users/login');
                            })
                            .catch(err => console.log(err));
                    }))
                }
            })
    }
})

const maxAge = 3*24*60*60;
const createToken = (id) => {
    return jwt.sign({ id }, 'health app secret', {
        expiresIn: maxAge
    });
}

router.post('/login', (req, res, next) => {
    const errors = [];
    User.findOne({ email: req.body.email})
        .then(user => {
            if(!user) {
                errors.push({ msg: 'Email is not registered'});
                res.render('login', {errors: errors});
            }

            bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
                if(err)
                    throw err;
                if(isMatch) {
                    const token = createToken(user._id);
                    res.cookie('jwt_user', token, { maxAge: maxAge*1000});
                    req.flash('success_msg', 'You logged in');
                    res.redirect('/dashboard');
                }
                else{
                    errors.push({ msg: 'Password incorrect'});
                    res.render('login', {errors: errors});    
                }
            });
        })
        .catch(err => console.log(err));
});

router.get('/logout', (req, res) => {
    res.cookie('jwt_user', '', {maxAge: 1});
    req.logout(err => {
        if(err)
            return next(err);
    });
    req.flash('success_msg', 'Your are logged out');
    res.redirect('/users/login');
});

module.exports = router;

// router.post('/login', (req, res, next) => {
//     passport.authenticate('local', {
//         successRedirect: '/dashboard',
//         failureRedirect: '/users/login',
//         failureFlash: true
//     })(req, res, next);
// });