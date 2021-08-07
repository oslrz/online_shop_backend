const { Router } = require("express");
const router = Router();
const path = require("path");
const multer = require("multer");
const { Client } = require("pg");
const express = require("express");
const e = require("express");
const app = express();
const fs = require("fs");


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

router.use('/add',jsonParser,(req,res)=>{
    const nickname = req.body.nickname;
    const data = req.body.data;
    const code = getRandomInt(1000,9999)
    client.query("INSERT INTO theme VALUES('"+code+"','"+data+"')",(err,resp)=>{
        if(err){
            console.error(err);
            return;
        }
        res.send('done')
    })
})


router.use('/get',jsonParser,(req,res)=>{
    client.query("SELECT * FROM theme",(err,resp)=>{
        if(err){
            console.error(err);
            return;
        }
        res.send(resp.rows)
    })
})


module.exports = router;