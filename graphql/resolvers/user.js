const User = require('../../models/User');
const { PubSub } = require('apollo-server-express');

const pubsub = new PubSub();

const XP_INCREMENT_PER_HELP = 10;

module.exports = {
    Query: {
        user: async (args) => {
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
                pubsub.publish("HELP", { mutation: "CREATE", payload: user._doc });

                return user._doc;
            } catch (error) {
                console.log(error);
                throw new Error;
            }
        },
        updateUser: async (root, args, context) => {
            const { uid, key, value, type = "update", operation = "update" } = args;
            try {
                if (type === "array") {
                    const user = await User.findOneAndUpdate({ uid }, { [`$${operation}`]: { [key]: value } }, { new: true });
                    return user._doc;
                }
                const user = await User.findOneAndUpdate({ uid }, { [key]: value }, { new: true });
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
    }
}