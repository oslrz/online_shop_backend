const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const makepost = require("./routes/post");
const account = require("./routes/users");
const comments = require("./routes/comments");
const upload = require("./routes/upload");
const fileUpload = require("express-fileupload");
const photo = require("./routes/photo");
const theme = require("./routes/theme");
const notification = require("./routes/notification")
const { Client } = require("pg");
const app = express();
const multer = require("multer");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(
  fileUpload({
    useTempFiles: true,
  })
);

app.use(cors());
app.use(logger("dev"));
console.log('it works')
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/posts", makepost);
app.use("/account", account);
app.use("/comments", comments);
app.use("/upload", upload);
app.use("/photo", photo);
app.use("/theme", theme);
app.use("/notif",notification);
app.use(function (req, res, next) {
  next(createError(404));
});
app.get("/", (req, res) => {
  res.send("vasya where is valera7");
});
app.post("/", (req, res) => {
  res.send("vasya where is valera7");
});
const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "yaplakal",
  password: "000000",
  port: 5432,
});
client.connect();
// function coments() {
//   return new Promise((resolve, reject) => {
//     client.query(
//       "select * from comments where replies is null ",
//       (err, resp) => {
//         if (err) {
//           console.error(err);
//           return;
//         }
//         resolve(resp.rows);
//       }
//     );
//   }).then((value) => {
//     value.forEach(element => {
//       console.log(element.id)
//     });
//   });
// }
// coments()

module.exports = app;