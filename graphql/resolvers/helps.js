const HelpModel = require('../../models/HelpModel');
const { PubSub } = require('apollo-server-express');

const pubsub = new PubSub();

const CREATE_HELP = "CREATE_HELP";
const UPDATE_HELP = "UPDATE_HELP";
const DELETE_HELP = "DELETE_HELP";

const PER_PAGE = 2;

module.exports = {
    Query: {
        helps: async (roor, args, context) => {
            const { offset } = args;
            try {
                const data = await HelpModel.find({}).skip(offset*PER_PAGE).limit(PER_PAGE);
                return data;
            } catch (error) {
                console.log(error);
                throw new Error;
            }
        },
        help: async (root,args, context) => {
            try {
                const { id } = args;
                const res = await HelpModel.findOne({ _id: id });
                return res._doc;
            } catch (error) {
                console.log(error);
                throw new Error;
            }
        },
    },
    Mutation: {
        createHelp: async (root, args, context) => {
            try {
                const { data } = args;
                const res = await new HelpModel(data).save();
                pubsub.publish(CREATE_HELP, {onCreateHelp: { ...res._doc }}); // onCreateHelp is the resolver in 'Subscription'
                return res._doc;
            } catch (error) {
                throw new Error;
            }
        },
        updateHelp: async (root, args, context) => {
            const { id, key, value, type = "update", operation = "update" } = args;
            try {
                let data;
                if (type === "array") {
                    data = await HelpModel.findByIdAndUpdate({ _id: id }, { [`$${operation}`]: { [key]: value } }, { new: true });
                    if (key === "usersAccepted") {
                        const { usersAccepted, noPeopleRequired } = data._doc;
                        if (usersAccepted.length === noPeopleRequired) {
                            data = await HelpModel.findByIdAndUpdate({ _id: id }, { "status": "ON_GOING" }, { new: true })
                        }
                    }
                } else {
                    data = await HelpModel.findByIdAndUpdate({ _id: id }, { [key]: value }, { new: true });
                }
                pubsub.publish(UPDATE_HELP, {onUpdateHelp: { ...data._doc }});
                return data._doc;
            } catch (error) {
                console.log(error);
                throw new Error;
            }
        },
        deleteHelp: async (root, args, context) => {
            const { id } = args;
            try {
                const res = HelpModel.deleteOne({ _id: id });
                pubsub.publish(DELETE_HELP, {onDeleteHelp: { ...data._doc }});
                return res._doc;
            } catch (error) {
                console.log(error);
                throw new Error;
            }
        },
    },
    Subscription: {
        onCreateHelp: {
            subscribe: () => pubsub.asyncIterator(CREATE_HELP)
        },
        onUpdateHelp: {
            subscribe: () => pubsub.asyncIterator(UPDATE_HELP)
        },
        onDeleteHelp: {
            subscribe: () => pubsub.asyncIterator(DELETE_HELP)
        }
    },
}