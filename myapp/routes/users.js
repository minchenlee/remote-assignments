const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

// 建立 connection pool
const pool = mysql.createPool({
  host: 'database-3.ckgj7aoueird.ap-northeast-1.rds.amazonaws.com',
  user: 'admin',
  password: "iFx0xnx80KaOXzxvGZWA",
  database: 'assignment',
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
});


// -----格式檢查函式組-----start
// password 的檢查 function
function check_pass_word(password) {
  let count = 0;
  if (/[A-Z]+/.test(password)) { count++; };
  if (/[a-z]+/.test(password)) { count++; };
  if (/[0-9]+/.test(password)) { count++; };
  if (/[~`!@#$%^&*()_\-+={}\[\]:;"'<,>.?\/]+/.test(password)) { count++; };
  return count;
}


// name, email, password 的檢查函式
function check_info_valid(name, email, password){
  // check name whether only use alphabets and numbers.
  if (/^[A-Za-z0-9]+$/.test(name)){
    console.log('Name is valid!');
    } else {
        return [true, '姓名格式不符'];
    };

    // chack email whether has right format.
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
        console.log('Email is valid!');
    } else {
        return [true, '信箱格式不符'];
    };

    // check password is contain atleast three diff. type of characters.
    if (check_pass_word(password) >= 3){
        console.log('Password is valid!');
    } else {
        return [true, '密碼格式不符'];
    };
    
    return [false, '所有格式正確！']
}


// 格式檢查主函式，不符合會 return true 和錯誤訊息。
function valid_check(content_type, user_name, email, password){
  let message = 'All good!';

  // 檢查 content-type
  // console.log(content_type, 'application/json');
  if (content_type !== 'application/json'){
    message = "Invalid content_type! Only accept: application/json"
    return [true, message];
  };
  
  // 檢查格式是否正確
  const format_valid = check_info_valid(user_name, email, password);
  if (format_valid[0]){
    message = `Bad Request: ${format_valid[1]}`
    return [true, message];
  };

  return [false, message];
};
// -----格式檢查函式組-----end


// 透過 email 取得 id, name, email 等資料
async function get_user_info_by_mail(email, request_date){
  const promise_pool = pool.promise();
  const SQL = `SELECT * FROM user WHERE email = '${email}';`;
  const results = await promise_pool.query(SQL);

  // 製作 response
  const id = await results[0][0].id;
  const name = await results[0][0].name;
  const date = request_date;
  const data = {
    'data': {
      "user": {
        "id": await id,
        "email": email,
        "name": await name
      },
      "date": date
    }
  };
  // 回傳資料
  return data;
};


// 檢查 email 是否已經存在
async function whether_email_exists(email){
  const promise_pool = pool.promise();
  const SQL = `SELECT COUNT(email) FROM user WHERE email = '${email}';`
  const results = await promise_pool.query(SQL);
  const count = await results[0][0]['COUNT(email)']
  
  if (count === 1){
    console.log('Email Already Exists!');
    return true;
  }
};


// 將 user 資料 insert 到 database 中。
async function insert_new_user_info(user_name, email, password){
  const promise_pool = pool.promise();
  const SQL = `\
  INSERT INTO user (name, email, password) VALUES ('${user_name}', '${email}', '${password}');\
  `;
  await promise_pool.query(SQL);
};


// SIGN UP API/POST
router.post('/', async function(req, res, next) {
  const content_type = req.headers['content-type'];
  const user_name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const request_date = req.headers['request-date'];

  // 格式檢查
  const valid_check_result = valid_check(content_type, user_name, email, password);
  if (valid_check_result[0]){
    res.status(400).send(valid_check_result[1]);
    return;
  };

  // 將 user 資料 insert 到 database 中，同時檢查 email 是否已經存在。
  try{
    // 檢查 email 是否已經存在
    const whether_exists = await whether_email_exists(email);
    if (whether_exists){
      res.status(403).send('Email Already Exists!');
      return;
    }

    // 新增新的 user 資料。
    await insert_new_user_info(user_name, email, password);
    console.log('INSERT!');

    // 透過 email 取得 user info 並回傳。
    const user_info = await get_user_info_by_mail(email, request_date);
    res.send(user_info);

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


// 用 id 取得 user 資料。
async function get_user_info_by_id(id){
  const promise_pool = pool.promise();
  const SQL = `SELECT id, name, email FROM user WHERE id = '${id}';`
  const results = await promise_pool.query(SQL);
  return results[0][0];
};


// 確認 id 是否存在
// async function id_exist(id){
//   const promise_pool = pool.promise();
//   const SQL = `SELECT COUNT(id) FROM user WHERE id = '${id}';`
//   const results = await promise_pool.query(SQL);
//   const count = results[0][0]['COUNT(id)']
//   return count;
// }


// QUERY API/GET
router.get('/', async function(req, res, next) {
  const id = req.query.id;
  const date = req.headers['request-date'];
  const content_type = req.headers['content-type'];

  if (content_type !== 'application/json'){
    res.status(400).send("Invalid contnet_type! Only accept: application/json");
    return;
  }

  try{
    const results = await get_user_info_by_id(id);

    if (results === undefined){
      res.status(403).send('User Not Existing')
      return;
    }

    const name = await results.name;
    const email = await results.email;

    const data = {
      'data': {
        "user": {
          "id": id,
          "email": email,
          "name": name,
        },
        "date": date
      }
    };
    res.send(data);

  } catch(error) {
    console.error(error)
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
