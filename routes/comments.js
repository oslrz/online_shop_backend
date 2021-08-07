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
client.connect()
const jsonParser = express.json();

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //Включно з мінімальним та виключаючи максимальне значення
}

router.post("/make_comment", jsonParser, (req, res) => {
  let code = getRandomInt(100000, 999999);
  if (req.files !== null) {
    let file = req.files.photo;
  
    if(file.length === undefined){
      let oldPath;
      let name;
      let counter = 0;
      for (i in file) {
        if(i === 'tempFilePath'){
          oldPath = file[i]
        }
        if(i === 'name'){
          name = file[i]
          name = name.split(".");
          name = name[name.length - 1];
        }
      }
      let newPath =
          path.join(__dirname, "..", "public/images") +"/" + code + "-" + counter + "." + name;
        let rawData = fs.readFileSync(oldPath);
        fs.writeFile(newPath, rawData, function (err) {
          if (err) console.log(err);
        });
        client.query("INSERT INTO comments VALUES('"+code+"','"+req.body.id+"','"+req.body.text+"','"+req.body.author+"',0,0,'photo/"+ code + "-" + counter + "." + name+"');",(err,resp)=>{
          if(err){
              console.error(err);
              res.send(err);
              return;
          }
          res.send('good');
      })
    }else{
      let photos = [];
      let counter = 0;
      file.forEach((element) => {
        console.log(element)
        let oldPath = element.tempFilePath;
        let name = element.name;
        name = name.split(".");
        name = name[name.length - 1];
        let newPath =
          path.join(__dirname, "..", "public/images") +"/" + code + "-" + counter + "." + name;
        let rawData = fs.readFileSync(oldPath);
        fs.writeFile(newPath, rawData, function (err) {
          if (err) console.log(err);
        });
        photos.push(code + "-" + counter + "." + name);
        counter++;
        
      });
      let str_photos = "";
        for (let i = 0; i < photos.length; i++) {
          str_photos += "photo/" + photos[i] + ",";
        }
        str_photos = str_photos.slice(0, str_photos.length - 1);
        client.query("INSERT INTO comments VALUES('"+code+"','"+req.body.id+"','"+req.body.text+"','"+req.body.author+"',0,0,'"+str_photos+"');",(err,resp)=>{
          if(err){
              console.error(err);
              res.send(err);
              return;
          }
          res.send('good');
        })
    }

  }else{
    console.log("INSERT INTO comments VALUES('"+code+"','"+req.body.id+"','"+req.body.text+"','"+req.body.author+"',0,0,'');")
    client.query("INSERT INTO comments VALUES('"+code+"','"+req.body.id+"','"+req.body.text+"','"+req.body.author+"',0,0,'');",(err,resp)=>{
      if(err){
          console.error(err);
          res.send(err);
          return;
      }
      res.send('good');
    })
  } 
});

router.post("/get", jsonParser, (req, res) => {
  client.query(
    "SELECT * FROM comments where posts_id='" + req.body.id + "';",
    (err, resp) => {
      if (err) {
        console.error(err);
        res.send(err);
        return;
      }
      res.send(resp.rows);
    }
  );
});

router.post("/get_count", jsonParser, (req, res) => {
  return new Promise((resolve, reject) => {
    client.query(
      "SELECT likes,dislikes from comments where id='" + req.body.id + "';",
      (err, resp) => {
        if (err) {
          console.error(err);
          res.send(err);
          return;
        }
        resolve(resp.rows);
      }
    );
  }).then((value) => {
    res.send(value[0]);
  });
});

router.post("/likes", jsonParser, (req, res) => {
  return new Promise((resolve, reject) => {
    client.query(
      "SELECT likes FROM comments WHERE id='" + req.body.id + "';",
      (err, resp) => {
        if (err) {
          console.error(err);
          res.send(err);
          return;
        }
        resolve(resp.rows);
      }
    );
  }).then((value) => {
    let likes = value[0].likes;
    likes++;
    client.query(
      "UPDATE comments SET likes='" +
        likes +
        "' WHERE id='" +
        req.body.id +
        "';",
      (err, resp) => {
        if (err) {
          console.error(err);
          res.send(err);
          return;
        }
        res.send("liked");
      }
    );
  });
});

router.post("/dislikes", jsonParser, (req, res) => {
  return new Promise((resolve, reject) => {
    client.query(
      "SELECT dislikes FROM comments WHERE id='" + req.body.id + "';",
      (err, resp) => {
        if (err) {
          console.error(err);
          res.send(err);
          return;
        }
        resolve(resp.rows);
      }
    );
  }).then((value) => {
    let likes = value[0].dislikes;
    likes++;
    client.query(
      "UPDATE comments SET dislikes='" +
        likes +
        "' WHERE id='" +
        req.body.id +
        "';",
      (err, resp) => {
        if (err) {
          console.error(err);
          res.send(err);
          return;
        }
        res.send("liked");
      }
    );
  });
});

router.post("/get_photo",jsonParser,(res,req)=>{
  let author = res.body.author;
  client.query("SELECT photos FROM users WHERE nickname='"+author+"';",(err,resp)=>{
    if(err){
      console.error(err);
      return;
    }
    let data = resp.rows;
    data = data[0];
    req.send(data)
  })
})

router.post("/reply",jsonParser, (res,req)=>{
  // console.log('/reply',res.body)
  client.query("INSERT INTO comments VALUES('"+getRandomInt(10000,99999)+"','"+res.body.post_code+"','"+res.body.text+"','"+res.body.author+"','0','0','','"+res.body.id+"')",(err,resp)=>{
    if(err){
      console.error(err);
      return;
    }
    req.send('ok')
  })
})

module.exports = router;
