const { response } = require("express");
const { route } = require("./post");
const multer = require('multer')
const express = require("express"),
  router = express.Router(),
  { Client } = require("pg");

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

router.post('/',function (req,res){
    console.log(req.files)
})


module.exports = router;
