
const connect = () => {
    hello('connect').login()
      .then((res) => {
        response = res;
        sendKey = 1;
        console.log(response);
        displayConnected();
      });
  };

  const disconnect = () => {
    hello('connect').logout()
      .then(() => {
        location.href = './index.html';
        sendKey = 0;
      }, (err) => {
        console.log(err);
        alert('You did not sign in :-)');
      });
  };

  const online = (session) => {
    const currentTime = (new Date()).getTime() / 1000;
  
    return session && session.access_token && session.expires > currentTime;
  };
  
  
  const userId = (accessToken) => {
  
    const testGet = new XMLHttpRequest();
    testGet.open('GET', `${connectURL}/oauth/user`);
    testGet.setRequestHeader('Authorization', `Bearer ${accessToken}`);
    testGet.onreadystatechange = function () {
      if (testGet.readyState === 4) {
        console.log(testGet.status);
        console.log(testGet.responseText);
      }
    };
    testGet.send();
  };

  const sendData = (sessionStatus) => {
    const sessionInfo = hello('connect').getAuthResponse();
    const accessToken = sessionInfo.access_token;
    const date = new Date();
    const currentTime = String(date.toISOString());
  
    const status = sessionStatus;
  
    const sendRequest = new XMLHttpRequest();
    sendRequest.open('POST', `${connectURL}/parse/classes/sessionTimestamp`);
  
    sendRequest.setRequestHeader('content-type', 'application/json');
    sendRequest.setRequestHeader('x-parse-application-id', 'connect');
    sendRequest.setRequestHeader('Authorization', `Bearer ${accessToken}`);
  
    sendRequest.onreadystatechange = function () {
      if (sendRequest.readyState === 4) {
        console.log(sendRequest.status);
        console.log(sendRequest.responseText);
      }
    };
    const data = {
      sessionId: 'AirQuality',
    };
    data[status]= currentTime;
  
  
    const jsonData = JSON.stringify(data);
    console.log(data);
    sendRequest.send(jsonData);
  };

  const initHello = () => {
    // configure Connect network
    hello.init({ connect: config.connectOAuth });
  
    // listen to login changes
    hello.on('auth.login', (auth) => {
      hello(auth.network).api('me')
        .then(function (r) {
          console.log('response:', r);
          let label = document.getElementById('profile_' + auth.network);
          if (!label) {
            label = document.createElement('div');
            label.id = 'profile_' + auth.network;
            document.getElementById('profile').appendChild(label);
          }
          label.innerHTML = (r.thumbnail ? '<img src="' + r.thumbnail + ' /> ' : '')
          + 'Hey ' + (r.name || r.id);
        });
    });
  
    // configure client
    hello.init({
      connect: config.clientId
    }, {
      /* eslint-disable camelcase */
      oauth_proxy: config.oauthProxy,
      redirect_uri: config.redirectURI
      /* eslint-enable camelcase */
    });
  };
  
  const init = () => {
    initHello();
  
    const connectToken = hello('connect').getAuthResponse();
  
    const isConnected = online(connectToken);
  };
  
  init();