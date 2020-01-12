const HelpModel = require('../../models/HelpModel');
const User = require('../../models/User');

const keyOfarraysInHelpModel = ["usersAccepted", "usersRequested"];
const keyOfarraysInUser = ["notifications", "createdHelpRequests"]

module.exports = {
    helps: () => {
        return HelpModel.find({})
            .then((res) => {
                return res;
            })
            .catch(err => {
                console.log(err)
            })
    },
    help: (args) => {
        const { id } = args;
        return HelpModel.findOne({ _id: id })
            .then((res) => {
                return res;
            })
            .catch(err => console.log(err))
    },
    createHelp: (args) => {
        const { data } = args;
        return new HelpModel(data).save().then((res) => {
            return { ...res._doc };
        }).catch(err => console.log(err));
    },
    updateHelp: (args) => {
        const { id, key, value } = args;
        if (keyOfarraysInHelpModel.indexOf(key) > -1) {
            return HelpModel.updateOne({ _id: id }, { "$push": { [key]: value } })
                .then((res) => {
                    return "SUCESS"
                })
                .catch((err) => {
                    return "ERROR"}
                );
        }
        return HelpModel.updateOne({ _id: id }, { [key]: value })
            .then(() => "SUCESS")
            .catch(() => "ERROR");
    },
    deleteHelp: (args) => {
        const { id } = args;
        return HelpModel.deleteOne({ _id: id })
            .then(() => "SUCESS")
            .catch(() => "ERROR");
    },
    createUser: (args) => {
        const { uid } = args;
        return new User({ uid }).save().then((res) => {
            return { ...res._doc };
        }).catch(err => console.log(err));
    },
    updateUser: (args) => {
        const { uid, key, value } = args;
        if (keyOfarraysInUser.indexOf(key) > -1) {
            return User.updateOne({ uid }, { "$push": { [key]: value } })
                .then(() => "SUCESS")
                .catch(() => "ERROR");
        }
        return User.updateOne({ uid }, { [key]: value })
            .then(() => "SUCESS")
            .catch(() => "ERROR");
    },
    deleteUser: (args) => {
        const { uid } = args;
        return User.deleteOne({ uid })
            .then(() => "SUCESS")
            .catch(() => "ERROR");
    },
}