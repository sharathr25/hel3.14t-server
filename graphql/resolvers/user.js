const User = require('../../models/User');
const { PubSub } = require('apollo-server-express');

const pubsub = new PubSub();

const XP_INCREMENT_PER_HELP = 10;

const UPDATE_USER = "UPDATE_USER";
const INCREMENT_XP_FOR_USER = "INCREMENT_XP_FOR_USER";

module.exports = {
    Query: {
        user: async (root, args, context) => {
            const { uid } = args;
            try {
                const user = await User.findOne({ uid });
                return user._doc;
            } catch (error) {
                console.log(error);
                throw new Error;
            }
        },
    },
    Mutation: {
        createUser: async (root, args, context) => {
            const { uid } = args;
            try {
                const user = await new User({ uid }).save();
                return user._doc;
            } catch (error) {
                console.log(error);
                throw new Error;
            }
        },
        updateUser: async (root, args, context) => {
            const { uid, key, value, type = "update", operation = "update" } = args;
            try {
                let user;
                if (type === "array") {
                    user = await User.findOneAndUpdate({ uid }, { [`$${operation}`]: { [key]: value } }, { new: true });
                } else {
                    user = await User.findOneAndUpdate({ uid }, { [key]: value }, { new: true });
                }
                pubsub.publish(UPDATE_USER, { onUpdateUser: { ...user._doc } })
                return user._doc;
            } catch (error) {
                console.log(error)
                throw new Error;
            }
        },
        incrementXpForUser: async (root, args, context) => {
            const { uid } = args;
            try {
                let user = await User.findOne({ uid });
                const xp = user._doc.xp;
                user = await User.findOneAndUpdate({ uid }, { xp: xp + XP_INCREMENT_PER_HELP }, { new: true });
                pubsub.publish(INCREMENT_XP_FOR_USER, { onXpIncrement: { ...user._doc } })
                return user._doc;
            } catch (error) {
                console.log(error);
                throw new error;
            }
        },
        deleteUser: async (root, args, context) => {
            const { uid } = args;
            try {
                const user = await User.deleteOne({ uid });
                return { ...user._doc, _id: user.id }
            } catch (error) {
                console.log(error);
                throw new Error;
            }
        },
    },
    Subscription: {
        onUpdateUser: {
            subscribe: () => pubsub.asyncIterator(UPDATE_USER)
        },
        onXpIncrement: {
            subscribe: () => pubsub.asyncIterator(INCREMENT_XP_FOR_USER)
        }
    }
}