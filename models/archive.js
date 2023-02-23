const mongoose = require('mongoose');

const ArchiveSchema = new mongoose.Schema({
    Name:{
        type: String,
        required: true
    },
    UUID:{
        type: String,
        required: true
    },
    ParentArchive:{
        type: mongoose.Schema.Types.ObjectId
    },
    DateCreated:{
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Archive', ArchiveSchema);