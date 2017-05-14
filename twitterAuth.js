// can use general apiCall function


var https = require('https');
var querystring = require('querystring');
var crypto = require('crypto');
var genAuth = require('./genAuth');

function getRequestToken(req, res_app) {

    console.log('==== Step 1 ====');

    var requrl = 'https://api.twitter.com/oauth/request_token';
    var oauthCallback = 'http://' + req.hostname + ':2333/signed-in';

    // Generate auth header
    var tokens = {};
    var reqParams = { 'oauth_callback': oauthCallback };
    var dst = genAuth.gen('POST', requrl, reqParams, tokens);

    // Request POST data
    var req_data = querystring.stringify(reqParams);

    // Request options and headers
    var options = {
        host: 'api.twitter.com',
        path: '/oauth/request_token',
        method: 'POST',
        accept: '*/*',
        headers: {
            'Authorization': dst
        }
    };

    // Set up request (not sent, just defined)
    var req = https.request(options, function(response) {
        console.log('POST' + ' ' + options.host + options.path);
        console.log('DATA' + ' ' + req_data);
        console.log(response.statusCode + ': ' + response.statusMessage);
        response.setEncoding('utf8');
        
        var body = '';
        response.on('data', function(chunk) {
            body += chunk;
        });
        response.on('end', function() {
            console.log('Response-BODY: ' + body);

            // Parse and get the request token, then redirect to 
            //      authorization page
            console.log('==== Step 2 ====');
            var authUrl = 
                'https://api.twitter.com/oauth/authorize?oauth_token='
                + querystring.parse(body).oauth_token;
            console.log('Redirecting to ' + authUrl);
            res_app.redirect(302, authUrl);
            // After signed in, twitter will redirect back to the callback
            //      url. The express app will record the updated request 
            //      token and verifier as GET data, and pass them on
        });
    });

    // Send the request (step 1)
    console.log('Posting: ' + req_data)
    req.end(req_data);

}


function getAccessToken(req, res_app) {

    console.log('==== Step 3 ====');

    var requrl = 'https://api.twitter.com/oauth/access_token';

    // Generate auth header
    // (potential twitter api doc error: verifier needs to be in header)
    var reqParams = { 'oauth_verifier': req.query.oauth_verifier };
    var tokens = { 'oauth_token': req.query.oauth_token };
    var dst = genAuth.gen('POST', requrl, reqParams, tokens);

    // Request POST data
    var req_data = querystring.stringify(reqParams);

    // Request options and headers
    var options = {
        host: 'api.twitter.com',
        path: '/oauth/access_token',
        method: 'POST',
        accept: '*/*',
        headers: {
            'Authorization': dst
        }
    };

    // Set up request (not sent, just defined)
    var request = https.request(options, function(response) {
        console.log('POST' + ' ' + options.host + options.path);
        console.log('DATA' + ' ' + req_data);
        console.log(response.statusCode + ': ' + response.statusMessage);
        response.setEncoding('utf8');
        
        var body = '';
        response.on('data', function(chunk) {
            body += chunk;
        });
        response.on('end', function() {
            console.log('Response-BODY: ' + body);
            // Parse response
            var accessToken  = querystring.parse(body).oauth_token;
            var accessTokenSecret  = querystring.parse(body).oauth_token_secret;
            // Redirect user to post-sign-in page
            // res_app.write('Welcome, ' + querystring.parse(body).screen_name);
            // res_app.end();
            res_app.cookie(
                'screenName', querystring.parse(body).screen_name);
            res_app.cookie(
                'accessToken', querystring.parse(body).oauth_token);
            res_app.cookie(
                'accessTokenSecret', querystring.parse(body).oauth_token_secret);
            res_app.redirect(302, 'http://' + req.hostname + ':2333/');
        });
    });

    // Send the request
    request.end(req_data);    

    // // 302 redirect test: MANUAL with Node
    // res_app.statusCode = 302;
    // res_app.setHeader('Location', 'https://twitter.com');
    // res_app.end();
    // // 302 redirect test: EXPRESS
    // res_app.redirect(302, 'https://twitter.com');

}

exports.getRequestToken = getRequestToken;
exports.getAccessToken = getAccessToken;