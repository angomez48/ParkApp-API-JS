function corsResponse(response) {
    response.headers = response.headers || {};
    response.headers['Access-Control-Allow-Origin'] = 'https://witty-beach-062ca4b10.3.azurestaticapps.net';
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type';
    response.headers['Access-Control-Allow-Credentials'] = 'true';
    return response;
}

module.exports = { corsResponse };
