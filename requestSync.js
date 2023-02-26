// import package 
// Solution: https://stackoverflow.com/questions/8775262/synchronous-requests-in-node-js

const request = require('sync-request');

// api url
const url = "https://api.appworks-school-campus3.online/api/v1/clock/delay";

// 取得 clock api
function requestSync(url) {
    const start = performance.now();
    const res = request('GET', url);
    const end = performance.now();
    console.log(`requestSync: ${end - start} ms`);
    // const data = res.body.toString();
    // console.log(JSON.parse(data).data.now);
}

// Calling function
requestSync(url);
requestSync(url);
requestSync(url);
