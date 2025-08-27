function corsResponse(response) {
    response.headers = response.headers || {};
    response.headers['Access-Control-Allow-Origin'] = '*';
    return response;
}
