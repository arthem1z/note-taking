//Import modules
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

//Global variables
const app = express();
const homeDirectory = process.env.HOME_DIRECTORY;

//App configuration
app.use(express.static(__dirname + '/Client'));
app.use(express.json());

//Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/NoteTaking', {useNewUrlParser: true, useUnifiedTopology: true});
var db = mongoose.connection;

//Set routes
app.get('/', function(req, res){
    res.send("Hello World!");
});

//Start the server
app.listen(process.env.PORT);
console.log(`Note taking app running on port: ${process.env.PORT}`);