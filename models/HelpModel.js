const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const helpRequestShema = new Schema({
    description: { type: String, required: true },
    uid: { type: String, required: true },
    latitude: { type: String, required: true },
    longitude: { type: String, required: true },
    status: { type: String, default: "REQUESTED" },
    mobileNo: { type: String, required: true },
    timeStamp: { type: Date, required: true },
    noPeopleRequired: {type: Number , default: 0},
    noPeopleRequested: {type: Number , default: 0},
    noPeopleAccepted: {type: Number , default: 0},
    usersRequested: { type: [{name: String, xp: Number}]},
    usersAccepted: {type: [{name: String, mobileNo: String}]},
});

module.exports = mongoose.model('HelpRequest', helpRequestShema);