/* eslint-disable camelcase */
// eslint-disable-next-line no-unused-vars
const config = {
  connectOAuth: {
    name: 'connect',
    oauth: {
      version: 2,
      auth: 'https://connect-project.io/authorize',
      grant: 'https://connect-project.io/oauth/token',
      response_type: 'token'
      // the response_type in the connect configuration must be set to 'token' instead of 'code'
    },
    base: 'https://connect-project.io/',
    get: { me: 'oauth/user' },
    xhr: function(p) {
      const token = p.query.access_token;
      delete p.query.access_token;
      if(token) {
        p.headers = {
          'Authorization': 'Bearer ' + token
        };
      }

      return true;
    }
  },
  clientId: 'pub_62342d68a0c84445ba78a50164000ac2', //airQuality
  oauthProxy: 'http://localhost:3500/oauthproxy',
  redirectURI: 'redirect.html'
};
