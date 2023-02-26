// import package
const https = require('node:https');

// api url
const url = "https://api.appworks-school-campus3.online/api/v1/clock/delay";


// Callback version
function requestCallback(url, callback) {
    const start = performance.now();
    const request = https.get(
        url, 
        (response) => {
            response.on('data', (data) => {
                const end = performance.now();
                callback(`requestCallback: ${end - start} ms`);
                // callback(JSON.parse(data).data.now);
            });
        }
    )
};

// Promise version
function requestPromise(url) {
    const start = performance.now();
    const fetchPromise = fetch(url);
    return fetchPromise
      .then((response) => response.json())
      .then((data) => {return data.data.now})
      .then((data) =>  {return performance.now()})
      .then((end) => {return `requestPromise: ${end - start} ms`})

    ; 
};


// async version
async function requestAsyncAwait(url) {
    const start = performance.now();
    const response = await requestPromise(url);
    const end = performance.now();
    console.log(`requestAsyncAwait: ${end - start} ms`);
};


// console.log('Start');
requestCallback(url, console.log);
requestPromise(url).then(console.log);
requestAsyncAwait(url);
// console.log('End');