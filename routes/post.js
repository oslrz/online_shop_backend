const { Router } = require("express");
const router = Router();
const path = require("path");
const multer = require("multer");
const { Client } = require("pg");
const express = require("express");
const e = require("express");
const app = express();
const fs = require("fs");
const { resolve } = require("path");

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
router.post("/get_favorite_arr", jsonParser, (req, res) => {
  const code = req.body.code;
  console.log("code", code);
  return new Promise((resolve, reject) => {
    client.query(
      "SELECT id,topic,author FROM posts WHERE id = '" + code + "';",
      (err, resp) => {
        if (err) {
          console.error(err);
          return;
        }
        let data = resp.rows;
        resolve(data);
      }
    );
  }).then((value) => {
    res.send(value[0]);
  });
});

router.post("/get_favorite", jsonParser, (req, res) => {
  if (req.body.nickname !== undefined) {
    const nickname = req.body.nickname;
    return new Promise((resolve, reject) => {
      client.query(
        "SELECT favourite FROM users WHERE nickname = '" + nickname + "'",
        (err, resp) => {
          if (err) {
            console.error(err);
            return;
          }
          let data = resp.rows;
          data = data[0].favourite;
          resolve(data);
        }
      );
    }).then(async (value) => {
      console.log("value", value);
      if (value === null || value === "" || value === undefined) {
        res.send(null);
      } else {
        let obj = value.split(",");
        let new_obj = [];
        let request;
        for (let i = 0; i < obj.length; i++) {
          if (obj[i] !== "") {
            try {
              request = await client.query(
                "SELECT id,topic,author FROM posts WHERE id='" + obj[i] + "'" 
              );
            } catch (error) {
              console.error(error);
            } finally {
              new_obj.push(request.rows);
            }
          }
        }
        res.send(new_obj);
      }
    });
  } else {
    res.send(null);
  }
});

router.post("/", jsonParser, async function (req, res) {
  const sort = req.body.sort;
  console.log(sort);
  return new Promise((resolve, reject) => {
    if (sort === undefined || sort === "All") {
      client.query("SELECT * FROM posts where archived!=true", (err, resp) => {
        if (err) {
          console.error(err);
          return;
        }
        let data = resp.rows;
        resolve(data);
      });
    } else {
      client.query(
        "SELECT * FROM posts WHERE theme = '" + sort + "' and archived!=true;",
        (err, resp) => {
          if (err) {
            console.error(err);
            return;
          }
          let data = resp.rows;
          resolve(data);
        }
      );
    }
  })
    .then((value) => {
      return new Promise(async (resolve, reject) => {
        let request = "";
        let data = value;
        for (let i = 0; i < data.length; i++) {
          try {
            request = await client.query(
              "SELECT photos FROM users WHERE nickname ='" +
                data[i].author +
                "';"
            );
          } catch (error) {
            console.error(error);
          } finally {
            let photo = request.rows;
            photo = photo[0].photos;
            data[i].img = photo;
          }
        }
        resolve(data);
      });
    })
    .then((value) => {
      let all_mas = value;
      return new Promise((resolve, reject) => {
        client.query(
          "SELECT favourite FROM users where nickname='" +
            req.body.nickname +
            "'",
          (err, resp) => {
            if (err) {
              console.error(err);
              return;
            }
            let response = resp.rows;
            response = response[0];
            resolve(response);
          }
        );
      }).then((value) => {
        console.log('balue',typeof value)
        if (value.favorite === null || value.favorite === '') {
          console.log("value.favorite === undefined || value.favorite === null")
          res.send(all_mas);
        } else {
          let obj = value.favourite;
          obj = obj.split(",");
          all_mas.forEach((elem) => {
            if (obj.includes(String(elem.id))) {
              elem.favorite = true;
            } else {
              elem.favorite = false;
            }
          });
          res.send(all_mas)
        }
      });
    });
});

router.post("/add_to_favourite", jsonParser, function (req, res) {
  const nickname = req.body.nickname;
  const code = req.body.code;
  return new Promise((resolve, reject) => {
    client.query(
      "SELECT favourite FROM users WHERE nickname = '" + nickname + "';",
      (err, resp) => {
        if (err) {
          console.error(err);
          return;
        }
        let data = resp.rows;
        data = data[0].favourite;
        resolve(data);
      }
    );
  }).then(async (value) => {
    if (value === null) {
      client.query(
        "UPDATE users SET favourite = '"+ code +"' WHERE nickname='" + nickname +"';",(err, resp) => {
          if (err) {
            console.error(err);
            return;
          }
          res.send("OK");
        }
      );
    } else {
      client.query("UPDATE users SET favourite = '" + value + "," + code + "' WHERE nickname='" + nickname +"';",(err, resp) => {
          if (err) {
            console.error(err);
            return;
          }
          res.send("OK");
        }
      );
    }
  });
});

router.post("/remove_from_favourite", jsonParser, (req, res) => {
  const nickname = req.body.nickname;
  const code = req.body.code;
  return new Promise((resolve, reject) => {
    client.query(
      "SELECT favourite FROM users WHERE nickname = '" + nickname + "';",
      (err, resp) => {
        if (err) {
          console.error(err);
          return;
        }
        let data = resp.rows;
        data = data[0].favourite;
        resolve(data);
      }
    );
  }).then((value) => {
    let arr = value.split(",");
    let new_str = "";
    for (let elem of arr) {
      if (elem !== String(code)) {
        new_str += elem + ",";
      }
    }
    new_str = new_str.slice(0, new_str.length - 1);
    client.query(
      "UPDATE users SET favourite = '" +
        new_str +
        "' WHERE nickname='" +
        nickname +
        "';",
      (err, resp) => {
        if (err) {
          console.error(err);
          return;
        }
        res.send("OK");
      }
    );
  });
});

router.post("/make", function (req, res) {
  let code = getRandomInt(10000, 99999);
  let photos = [];
  let counter = 0;
  if (req.file === undefined) {
    if (req.files.photo !== null) {
      let files = req.files.photo;
      if (files.length !== undefined) {
        files.forEach((element) => {
          var oldPath = element.tempFilePath;
          let name = element.name;
          name = name.split(".");
          name = name[name.length - 1];
          var newPath =
            path.join(__dirname, "..", "public/images") +
            "/" +
            code +
            "-" +
            counter +
            "." +
            name;
          var rawData = fs.readFileSync(oldPath);
          fs.writeFile(newPath, rawData, function (err) {
            if (err) console.log(err);
          });
          photos.push(code + "-" + counter + "." + name);
          counter++;
        });
      } else {
        let files = req.files.photo;
        console.log(files.tempFilePath);
        var oldPath = files.tempFilePath;
        let name = files.name;
        name = name.split(".");
        name = name[name.length - 1];
        var newPath =
          path.join(__dirname, "..", "public/images") +
          "/" +
          code +
          "-" +
          counter +
          "." +
          name;
        var rawData = fs.readFileSync(oldPath);
        fs.writeFile(newPath, rawData, function (err) {
          if (err) console.log(err);
        });
        photos.push(code + "-" + counter + "." + name);
      }
    }
  }

  let str_photos = "";
  for (let i = 0; i < photos.length; i++) {
    str_photos += "photo/" + photos[i] + ",";
  }
  str_photos = str_photos.slice(0, str_photos.length - 1);

  if (req.body.author !== undefined) {
    client.query(
      "INSERT INTO posts VALUES('" +
        code +
        "','" +
        req.body.topic +
        "', '" +
        req.body.text +
        "', '" +
        req.body.author +
        "',0,0,'" +
        str_photos +
        "','" +
        req.body.theme +
        "')",
      (err, resp) => {
        if (err) {
          console.error(err);
          res.send(err);
          return;
        }
      }
    );
  } else {
    res.send("error");
  }
});

router.post("/id", jsonParser, function (req, res) {
  client.query(
    "SELECT * FROM posts WHERE id='" + req.body.id + "';",
    (err, resp) => {
      if (err) {
        console.error(err);
        res.send(err);
      }
      res.send(resp.rows);
    }
  );
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.post("/like", jsonParser, (req, res) => {
  return new Promise((resolve, reject) => {
    client.query(
      "select likes from posts where id='" + req.body.id + "';",
      (err, resp) => {
        if (err) {
          console.error(err);
          return;
        }
        resolve(resp.rows);
      }
    );
  }).then((value) => {
    let like;
    if (value[0].likes === null) {
      like = 0;
    } else {
      like = parseInt(value[0].likes) + 1;
    }
    console.log(
      "update posts set likes='" + like + "' where id='" + req.body.id + "';"
    );
    client.query(
      "update posts set likes='" + like + "' where id='" + req.body.id + "';",
      (err, resp) => {
        if (err) {
          console.error(err);
          return;
        }
        res.send("liked");
      }
    );
  });
});

router.post("/dislike", jsonParser, (req, res) => {
  return new Promise((resolve, reject) => {
    client.query(
      "select dislikes from posts where id='" + req.body.id + "';",
      (err, resp) => {
        if (err) {
          console.error(err);
          return;
        }
        resolve(resp.rows);
      }
    );
  }).then((value) => {
    // console.log(value)
    let like;
    if (value[0].dislikes === null) {
      like = 0;
    } else {
      like = parseInt(value[0].dislikes) + 1;
    }
    console.log(
      "update posts set dislikes='" + like + "' where id='" + req.body.id + "';"
    );
    client.query(
      "update posts set dislikes='" +
        like +
        "' where id='" +
        req.body.id +
        "';",
      (err, resp) => {
        if (err) {
          console.error(err);
          return;
        }
        res.send("disliked");
      }
    );
  });
});
router.post("/get_count", jsonParser, (req, res) => {
  return new Promise((resolve, reject) => {
    client.query(
      "select likes,dislikes from posts where id ='" + req.body.id + "';",
      (err, resp) => {
        if (err) {
          console.error(err);
          return;
        }
        resolve(resp.rows);
      }
    );
  }).then((value) => {
    res.send(value);
  });
});

router.post("/archived",jsonParser,(req,res) => {
  const id = req.body.code;
  client.query("UPDATE posts SET archived=true WHERE id='"+id+"';",(err,resp) => {
    if(err){
      console.error(err);
      res.send(err);
      return;
    }
    res.send('ok')
  })
})




module.exports = router;
