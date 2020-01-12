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
        const { id, key, value, type, operation } = args;
        if (type === "array") {
            return HelpModel.updateOne({ _id: id }, { [`$${operation}`]: { [key]: value } })
                .then((res) => {
                    return "SUCESS"
                })
                .catch((err) => {
                    console.log(err);
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
    user: (args) => {
        const { uid } = args;
        return User.findOne({ uid })
        .then((res) => {
            return res;
        })
        .catch((err) => {
            console.log(err);
        });
    },
    createUser: (args) => {
        const { uid } = args;
        return new User({ uid }).save().then((res) => {
            return { ...res._doc };
        }).catch(err => console.log(err));
    },
    updateUser: (args) => {
        const { uid, key, value, type, operation } = args;
        if (type === "array") {
            return User.updateOne({ uid }, { [`$${operation}`]: { [key]: value } })
                .then((res) => {
                    console.log(res)
                    return "SUCESS"
                })
                .catch((err) => {
                    console.log(err)
                    return "ERROR"
                });
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