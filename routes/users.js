const { response } = require("express");

const express = require("express"),
  router = express.Router(),
  { Client } = require("pg");
const path = require("path");
const fs = require("fs");
const https = require("https");
const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "yaplakal",
  password: "000000",
  port: 5432,
});
client.connect()
const jsonParser = express.json();

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //Включно з мінімальним та виключаючи максимальне значення
}
router.post("/code", jsonParser, async (res, req) => {
  let alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z","1","2","3","4","5","6","7","8","9","0"]
  let arr = ''
  for(let i =0;i<6;i++){
    arr+=alphabet[getRandomInt(0,alphabet.length)]
  }
  let phone = res.body.phone;
  console.log('phone',phone)
  console.log('message',arr)
  let data = JSON.stringify({
    recipients: [
      phone
    ],
    sms: {
      sender: "solyar.site",
      text: "your code is: " +arr,
    },
  });
  console.log(data)

  const options = {
    hostname: "api.turbosms.ua",
    port: 443,
    path: "/message/send.json",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic 0d80d2e4f1e40d4454e6f57706c76cddb2588c15",
    },
  };

  const vidpr = await https.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`);

    res.on("data", (data) => {
      process.stdout.write(data);
    });
  });

  vidpr.on("error", (error) => {
    console.error(error);
  });

  vidpr.write(data);
  vidpr.end();
  req.send(arr)
});


router.post("/login", jsonParser, (req, res) => {
  let login = req.body.login;
  let password = req.body.password;
  client.query(
    "SELECT * FROM users WHERE nickname='" +
      login +
      "' and password='" +
      password +
      "';",
    (err, resp) => {
      if (err) {
        console.error(err);
        return;
      }
      let data = resp.rows;
      if (data[0] === undefined) {
        res.send("none");
      } else {
        res.send(data[0]);
      }
    }
  );
});

router.post("/register", (req, res) => {
  const nickname = req.body.nickname;
  if (req.files === undefined) {
    client.query(
      "INSERT INTO users(id,nickname,password,email) VALUES('" +
        getRandomInt(10000, 99999) +
        "','" +
        req.body.nickname +
        "','" +
        req.body.password +
        "','" +
        req.body.email +
        "')",
      (err, resp) => {
        if (err) {
          console.error(err);
          res.send(err);
          return;
        }
        res.send("yes");
      }
    );
  } else {
    console.log(req.files);
    let file = req.files;
    file = file.pics;
    let oldPath = file.tempFilePath;
    let name = file.name;
    name = name.split(".");
    name = name[name.length - 1];
    let newPath =
      path.join(__dirname, "..", "public/images") + "/" + nickname + "." + name;
    let rawData = fs.readFileSync(oldPath);
    fs.writeFile(newPath, rawData, function (err) {
      if (err) console.log(err);
    });
    let photo_path = "photo/" + nickname + "." + name;
    client.query(
      "INSERT INTO users(id,nickname,password,email,photos) VALUES('" +
        getRandomInt(10000, 99999) +
        "','" +
        req.body.nickname +
        "','" +
        req.body.password +
        "','" +
        req.body.email +
        "','" +
        photo_path +
        "')",
      (err, resp) => {
        if (err) {
          console.error(err);
          res.send(err);
          return;
        }
        res.send("yes");
      }
    );
  }
});


router.post("/get",(req,res)=>{
  client.query("SELECT * FROM users",(err,resp)=>{
    if(err){
      console.error(err);
      return;
    }
    res.send(resp.rows)
  })
})

router.post("/ban",jsonParser,(req,res)=>{
  client.query("UPDATE users SET ban='true' WHERE id='"+req.body.id+"';",(err,resp)=>{
    if(err){
      console.error(err);
      return;
    }
    res.send('done')
  })
})

module.exports = router;
