const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const axios = require('axios');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');
const cookies = require('cookie-parser');
const cookieParser = require('cookie-parser');

app.use(cookieParser());
require('./config/passport')(passport);

const db = require('./config/keys').MongoURI;
mongoose.connect(db, {useNewUrlParser: true})
    .then(() => {console.log('MongoDB connected!')})
    .catch(err => console.log(err));

app.set('view engine', 'ejs');
app.use(express.json());
app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})

app.get('*', checkUser);
app.get('/test/heart_pred', (req, res) => {
    res.render('heart_pred');
});

app.get('/home', (req, res) => {
    res.render('home')
})

app.use('/users', require('./routes/users'));

app.get('/dashboard', requireAuth, (req, res) => {
    res.render('dashboard');
})
app.post('/result', (req, res) => {
    
    let data = {
        'age' : req.body.age,
        'sex' : req.body.sex,
        'cp' : req.body.cp,
        'trestbps' : req.body.trestbps,
        'chol' : req.body.chol,
        'fbs' : req.body.fbs,
        'restecg' : req.body.restecg,
        'thalach' : req.body.thalach,
        'exang' : req.body.exang,
        'oldpeak' : req.body.oldpeak,
        'slope' : req.body.slope,
        'ca' : req.body.ca,
        'thal' : req.body.thal 
    }    

    var val = "Can't predict";
    axios.post('http://127.0.0.1:8000/heart_prediction', data)
    .then(function(resp){
        val = resp.data;
        res.send(val);
    })
});

app.listen(3000, () => {
    console.log("Server running on port 3000")
});

// app.post('/heart_prediction', (req, res) => {
//     console.log(req.body);
//     res.send(res.body);
// })

// fetch('http://127.0.0.1:8000/heart_prediction', {
//     method: "POST",
//     body: JSON.stringify(data),
//     headers: {'Content-Type': 'application/json'}
// })
//     .then((res) => res.json())
//     .then(json => console.log(json));
