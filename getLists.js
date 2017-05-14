var https = require('https');
var querystring = require('querystring');
var crypto = require('crypto');
var genAuth = require('./genAuth');
var url = require('url');


function apiCall(res_app, method, requrl, reqParams, tokens) {
    // General-purpose function used to relay API call request to
    //      app server (express) to twitter API
    // Request parameters (req.query) may be directly passed
    //      as reqParams here if they are the same
    // [tokens] may include tokens and secrets if present

    // auth header
    method = method.toUpperCase();
    var dst = genAuth.gen(method, requrl, reqParams, tokens);

    // Request data (querystring)
    var reqData = querystring.stringify(reqParams);

    // Request options and headers
    var parsed = url.parse(requrl);
    var pathname = parsed.pathname;
    if (method == 'GET' && reqData != '') {
        // if GET, append query in path rather then send it as data
        pathname += '?' + reqData;
        reqData = '';
    }
    var options = {
        host: parsed.hostname,
        path:  pathname,
        method: method,
        accept: '*/*',
        headers: {
            'Authorization': dst
        }
    };

    // set up and send request
    var request = https.request(options, function(response) {
        console.log(method + ' ' + options.host + options.path);
        console.log('DATA' + ' ' + reqData);
        console.log(response.statusCode + ': ' + response.statusMessage);
        response.setEncoding('utf8');
        
        response.on('data', function(chunk) {
            // console.log(chunk);
            res_app.write(chunk);
        });
        response.on('end', function() {
            res_app.end();
        });
    }).end(reqData);

}

function getLists(res_app, tokens) {

    console.log('==== Getting lists ====')
    // console.log(tokens);

    var method = 'GET';
    var requrl = 'https://api.twitter.com/1.1/lists/list.json';
    var reqParams = {};

    apiCall(res_app, method, requrl, reqParams, tokens);
}

function getListMembers(res_app, tokens, reqParams) {

    console.log('==== Getting list members ====')
    console.log(tokens);

    var method = 'GET';
    var requrl = 'https://api.twitter.com/1.1/lists/members.json';
    console.log(reqParams);

    apiCall(res_app, method, requrl, reqParams, tokens);
}

exports.getLists = getLists;
exports.getListMembers = getListMembers;