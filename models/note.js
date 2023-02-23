const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
    ParentArchiveUUID:{
        type:String
    },
    Text:{
        type: String
    },
    DateCreated:{
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Note', NoteSchema);