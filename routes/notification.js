const { response } = require("express");
const { route } = require("./post");

const express = require("express"),
  router = express.Router(),
  { Client } = require("pg");
const path = require("path");
const fs = require("fs");
const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "yaplakal",
  password: "000000",
  port: 5432,
});
client.connect();
const jsonParser = express.json();

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //Включно з мінімальним та виключаючи максимальне значення
}
router.post("/get", jsonParser, (req, res) => {
  const nickname = req.body.nickname;
  return new Promise((resolve, reject) => {
    client.query(
      "SELECT id FROM users WHERE nickname = '" + nickname + "';",
      (err, resp) => {
        if (err) {
          console.error(err);
          return;
        }
        resolve(resp.rows[0]);
      }
    );
  }).then((value) => {
    client.query(
      "SELECT * FROM notification where id='" + value.id + "' and status='false'",
      (err, resp) => {
        if (err) {
          console.error(err);
          return;
        }
        res.send(resp.rows);
      }
    );
  });
});

router.post("/make", jsonParser, (req, res) => {
  const author = req.body.author;
  const replyer = req.body.replyer;
  const post_code = req.body.post_code;
  const text = req.body.text;
  let date_ob = new Date();
  let date = ("0" + date_ob.getDate()).slice(-2);
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let year = date_ob.getFullYear();
  let hours = date_ob.getHours();
  let minutes = date_ob.getMinutes();
  let seconds = date_ob.getSeconds();
  let current_time =
    year +
    "-" +
    month +
    "-" +
    date +
    " " +
    hours +
    ":" +
    minutes +
    ":" +
    seconds;
  return new Promise((resolve, reject) => {
    client.query(
      "SELECT id From users WHERE nickname='" + author + "'",
      (err, resp) => {
        if (err) {
          console.error(err);
          return;
        }
        resolve(resp.rows);
      }
    );
  }).then((value) => {
    console.log(
      "INSERT INTO notification VALUES('" +
        getRandomInt(100000, 999999) +
        "','" +
        value[0].id +
        "','your messege was replied by " +
        replyer +
        " with text:" +
        text +
        "','" +
        current_time +
        "','false')"
    );

    client.query(
      "INSERT INTO notification VALUES('" +
        getRandomInt(100000, 999999) +
        "','" +
        value[0].id +
        "','your messege was replied by " +
        replyer +
        " with text:" +
        text +
        "','" +
        current_time +
        "','false')",
      (err, resp) => {
        if (err) {
          console.error(err);
          return;
        }
        res.send("done");
      }
    );
  });
});
router.post("/delete", jsonParser, (req, res) => {
  client.query(
    "UPDATE notification SET status = 'true' WHERE message_id='" +
      req.body.code +
      "'",
    (err, resp) => {
      if (err) {
        console.error(err);
        return;
      }
      res.send("done");
    }
  );
});
module.exports = router;
