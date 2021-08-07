const { response } = require("express");
const { route } = require("./post");
const path = require("path");
const fs = require("fs");
const express = require("express"),
  router = express.Router();

  router.get('/:id', (req, res)=>{
    res.sendFile(path.join(__dirname,"..","public/images")+"/"+req.params.id)
  });
  router.get('/valera',(req,res)=>{
    res.send('valera is here')
  })
  router.get('/',(req,res)=>{
      res.send('vass')
      res.send(req.params.id)
  })
  

module.exports = router;
