//Import modules
const express = require('express');
const mongoose = require('mongoose');
const {v4: uuidv4} = require('uuid');
require('dotenv').config();

//Global variables
const app = express();
const homeDirectory = process.env.HOME_DIRECTORY;

//App configuration
app.use(express.static(__dirname + '/Client'));
app.use(express.json());

//Import MongoDB models
const ArchiveModel = require('./models/archive.js');
const NoteModel = require('./models/note.js')

//Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/NoteTaking', {useNewUrlParser: true, useUnifiedTopology: true});
var db = mongoose.connection;

//Set routes
app.get('/', function(req, res){
    res.status(200).sendFile(`${homeDirectory}/Client/Home/index.html`);
});
app.get('/archive/:uuid', function(req, res){
    res.status(200).sendFile(`${homeDirectory}/Client/Archive/index.html`)
})
app.post('/getSuperArchives', function(req, res){
    ArchiveModel.find({ParentArchive: null}, function(err, archives){
        if(err){
            console.log(err);
        }
        else{
            var responseData = [];
            for(var i=0; i<archives.length; i++){
                responseData.push({Name: archives[i].Name, UUID: archives[i].UUID});
            }
            res.status(200).send(responseData);
        }
    });
});
app.post('/getArchive', async function(req, res){
    try{
        ArchiveModel.findOne({UUID: req.body.UUID}, async function(err, archive){
            if(err){
                console.log(err);
                res.sendStatus(500);
            }else{
                var ParentArchive = archive.ParentArchive;
                if(ParentArchive){
                    ParentArchive = (await ArchiveModel.findById(ParentArchive)).UUID;
                }
                var archiveData = {ParentArchive: ParentArchive, Name: archive.Name, UUID: archive.UUID, ChildArchives: []};
                ArchiveModel.find({ParentArchive: archive._id}, function(err, archives){
                    if(err){
                        console.log(err);
                        res.sendStatus(500);
                    }else{
                        for(var i=0; i<archives.length; i++){
                            archiveData.ChildArchives.push({Name: archives[i].Name, UUID: archives[i].UUID});
                        }
                        res.status(200).send(archiveData);
                    }
                });
            }
        });
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});
app.put('/newArchive', async function(req, res){
    try{
        var ParentArchive = req.body.ParentArchive;
        if(ParentArchive){
            ParentArchive = (await ArchiveModel.findOne({UUID: ParentArchive}))._id;
        }
        var Archive = new ArchiveModel({
            Name: req.body.Name,
            UUID: uuidv4(),
            ParentArchive: ParentArchive
        });
        await Archive.save();
        res.status(200).send({UUID: Archive.UUID});
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});

//Start the server
app.listen(process.env.PORT);
console.log(`Note taking app running on port: ${process.env.PORT}`);