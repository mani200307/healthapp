const jwt = require('jsonwebtoken');
const cookies = require('cookie-parser');
const User = require('../models/User');

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt_user;

    if (token) {
        jwt.verify(token, 'health app secret', (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.redirect('/users/login');
            } else {
                console.log(decodedToken);
                next();
            }
        });
    } else {
        res.redirect('/users/login');
    }
}

const checkUser = (req, res, next) => {
    const token = req.cookies.jwt_user;

    if (token) {
        jwt.verify(token, 'health app secret', (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.locals.user = null;
                next();
            } else {
                console.log(decodedToken);
                console.log(decodedToken.id);
                User.findById(decodedToken.id)
                    .then(user => {
                        res.locals.user = user;
                        console.log(res.locals);
                    })
                    .catch(err => console.log(err));            
                // console.log(res.locals);
                next();
            }
        })
    } else {
        res.locals.user = null;
        next();
    }
}

module.exports = { requireAuth, checkUser };