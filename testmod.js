function getresponse(res_app) {
    res_app.write('Jojojojo!');
    res_app.end();
}

exports.getresponse = getresponse;