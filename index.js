let port;
let reader;
let valueBuffer = [];

const connectURL = 'https://connect-project.io';

navigator.serial.addEventListener('connect', (e) => {
    console.log("connect", e);
});

navigator.serial.addEventListener('disconnect', (e) => {
    console.log("disconnect", e);
    if (reader) {
        reader.cancel();
    }
    if (port) {
        port.close();
    }
});

document.querySelector("#request").addEventListener('click', async () => {
    try {
        port = await navigator.serial.requestPort({
            filters: [] // You can add filters if needed
        });

        console.log({ port });

        await port.open({ baudRate: 9600 });
        console.log("port open");

        reader = port.readable.getReader();

        // Start reading data whenever available.
        readData();
        document.getElementById('request').classList.add('connected');
    } catch (error) {
        console.error("Error opening the port:", error);
    }
});

async function readData() {
    try {
        let dataBuffer = '';

        while (true) {
            const { value, done } = await reader.read();

            if (done) {
                console.log("Reader has been closed.");
                break;
            }

            // Handle the received data.
            const stringValue = new TextDecoder().decode(value);

            // Accumulate the received data.
            dataBuffer += stringValue;
            // Check if the closing tag is present in the accumulated data.
            if (dataBuffer.includes('</data>')) {
                // Extract numerical value between <data> and </data> tags.
                const match = dataBuffer.match(/<data>([\s\S]*?)<\/data>/);

                if (match) {
                    // Get the numerical value.
                    const numericValue = parseInt(match[1].trim(), 10);
                    console.log("Numeric value:", numericValue);
                    valueBuffer.push(numericValue);

                    // Plot the numericValue
                    plotNumericValue(numericValue);
                    // Check if the buffer has 6 values, then calculate the mean.
                    if (valueBuffer.length === 30) {
                        const meanValue = calculateMean(valueBuffer);
                        handleData(meanValue);
                        valueBuffer = [];
                    }
                }
                dataBuffer = ''; // Reset the buffer
            }
        }
    } catch (error) {
        console.error("Error reading data:", error);
    }
}

function plotNumericValue(value) {
    if (chart && value !== null && value !== undefined) {
        // Add the new data point to the chart dataset only if a value is available
        chart.data.labels.push(''); // Add an empty label
        chart.data.datasets[0].data.push(value);

        // Limit the number of data points displayed on the chart
        const maxDataPoints = 20;
        if (chart.data.labels.length > maxDataPoints) {
            chart.data.labels.shift(); // Remove the oldest label
            chart.data.datasets[0].data.shift(); // Remove the oldest data point
        }

        // Update the chart
        chart.update();
    }
}

let chart; // Declare chart variable outside the function to access it globally

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the Chart.js chart
    const ctx = document.getElementById('chart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Sensor value',
                data: [],
                backgroundColor: 'rgba(0, 123, 255, 0.5)',
                borderColor: 'rgba(0, 123, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    display: false
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
});


function calculateMean(values) {
    const sum = values.reduce((acc, value) => acc + value, 0);
    return sum / values.length;
}

function handleData(serialdata) {
    // Process and display the received data as needed.
    console.log("Received data:", serialdata);
    document.querySelector("#output").innerText = `Received data: ${serialdata}`;
    const sessionInfo = hello('connect').getAuthResponse();
    const accessToken = sessionInfo.access_token;
    //const date = new Date();
    //const currentTime = String(date.toISOString());

    const sendRequest = new XMLHttpRequest();
    
    //https://github.com/ConnectProject/schemas/blob/master/GameScore.schema.json
    
    sendRequest.open('POST', `${connectURL}/parse/classes/GameScore`);
    sendRequest.setRequestHeader('content-type', 'application/json');
    sendRequest.setRequestHeader('x-parse-application-id', 'connect');
    sendRequest.setRequestHeader('Authorization', `Bearer ${accessToken}`);
    sendRequest.onreadystatechange = function () {
        if (sendRequest.readyState === 4) {
          console.log(sendRequest.status);
          console.log(sendRequest.responseText);
        }
      };

    let data = {
        score:serialdata,
        playerName: 'NaatAirQuality'
    };
    const jsonData = JSON.stringify(data);
    console.log(data);
    sendRequest.send(jsonData);
}

function nameSensor() {
    // Retrieve the value entered in the input field
    const enteredValue = document.getElementById('sensorName').value;
    
    // Update the h1 element with the entered value
    document.getElementById('airQualityHeader').innerText = `${enteredValue} Air Quality Monitor`;
}


const connect = () => {
hello('connect').login()
.then((res) => {
response = res;
sendKey = 1;
console.log(response);
// displayConnected();
document.getElementById('connect').style.display = 'none';
document.getElementById('login-success').style.display = 'block';
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

