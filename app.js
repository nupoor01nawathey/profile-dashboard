const express               = require('express'),
      app                   = express(),
      mongoose              = require('mongoose'),
      bodyParser            = require('body-parser'),
      passport              = require('passport'),
      LocalStrategy         = require('passport-local'),
      passportLocalMongoose = require('passport-local-mongoose');

// Setup user model
const User       = require('./models/user');

// setup view engine
app.set('view engine', 'ejs');

// setup mongodb
mongoose.connect('mongodb://localhost:27017/passport_login', { useNewUrlParser: true });

// setup bodyParser
app.use(bodyParser.urlencoded({extended: true}));

// setup session
app.use(require('express-session') ({
    secret: 'DiDi is the cutest cat ever!',
    resave: false,
    saveUninitialized: false
}));

// setup passport
app.use(passport.initialize());
app.use(passport.session());



// passport serialize and de-serialize
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// setup routes
app.get('/register', function(req, res){
    res.render('register');
});

app.post('/register', function(req, res){
    const username = req.body.username,
          password = req.body.password;

    User.register(new User({username: username}), password, function(err, user){
        if(err){
            //console.log(err);
            return res.render('login');
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect('/login');
        });
    });
});

app.get('/login', function(req, res){
    res.render('login');
});

app.post('/login', passport.authenticate("local", {
    successRedirect: '/profile',
    failureRedirect: 'login'
}),function(req, res){
});

app.get('/logout', function(req, res){
    req.logout();
    res.redirect("/login");
});

app.get('/profile', isLoggedIn, function(req, res){
    res.render('profile');
});

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

// setup server
const PORT = process.env.PORT || 3000 ; 
app.listen(PORT, function(){
    console.log('Server started at port ' + PORT);
});