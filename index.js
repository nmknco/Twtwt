// Using HTTP for now

// To do:
// 1. step1-2 verification of identity of token (see twitter doc)
// 2. encrypt tokens and secrets in coo... no, a database

var express = require('express');
var cookieParser = require('cookie-parser');
var querystring = require('querystring');
var twitterAuth = require('./twitterAuth');
var getLists = require('./getLists');
var path = require('path');

var app = express();
app.use(cookieParser());
// app.use(express.static(__dirname)); // there's redirect problem when using this
app.use(express.static(path.join(__dirname, 'public')));

var port = 2333;

var fs = require('fs');
var ks = fs.readFileSync('aksa9ej3c', 'utf-8').split('\n');
var consumerKey = ks[0];
var consumerSecret = ks[1];
console.log('App keys(init read):\n' + consumerKey + '\n' + consumerSecret);

// use a test response for GET /lists/list due to the call limit
// var res_test = fs.readFileSync('test_res', 'utf-8');

app.get('/auth', function(req, res_app) {
    // note here res_app is the Response object in express
    //      which is a http.ServerResponse obj in
    // REF: https://expressjs.com/en/4x/api.html#res
    twitterAuth.getRequestToken(req, res_app);
});

app.get('/signed-in', function(req, res_app) {
    // res_app.send('You are signed in!');
    twitterAuth.getAccessToken(req, res_app);
});

app.get('/lists', function(req, res_app) {
    var tokens = {
        'oauth_token' : req.cookies.accessToken,
        'oauth_token_secret' : req.cookies.accessTokenSecret
    }
    getLists.getLists(res_app, tokens);
    // res_app.write(res_test, function() {res_app.end();});
});

app.get('/list_members', function(req, res_app) {
    var tokens = {
        'oauth_token' : req.cookies.accessToken,
        'oauth_token_secret' : req.cookies.accessTokenSecret
    }
    getLists.getListMembers(res_app, tokens, req.query);
});

app.get('/', function(req, res_app) {
    // check cookies, and see if a user is recognized and not expired
    // NO
    //      redirect to auth
    // console.log(req.cookies);
    if (!req.cookies.accessToken) {
        console.log("Redirecting to log in......");
        res_app.redirect(302, 
            'http://' + req.hostname + ':' + port + '/auth');
    } else {
        res_app.sendFile(path.join(__dirname, 'index.html'));
    }
});

app.listen(port, function() {
    console.log('Example app listening on port %d', port);
});

exports.consumerKey = consumerKey;
exports.consumerSecret = consumerSecret;