const User = require('../../models/User');
const { PubSub } = require('apollo-server-express');

const pubsub = new PubSub();

const XP_INCREMENT_PER_HELP = 10;
const NUMBER_OF_TOP_HELPERS = 50;

const INCREMENT_XP_FOR_USER = "INCREMENT_XP_FOR_USER";
const INCREMENT_STARS_FOR_USER = "INCREMENT_STARS_FOR_USER";

module.exports = {
    Query: {
        user: async (root, args, context) => {
            // if(!context.isValid) {
            //     throw new Error("Unauthorised")
            // }
            const { uid } = args;
            try {
                const user = await User.findOne({ uid });
                return user._doc;
            } catch (error) {
                console.log(error);
                throw new Error;
            }
        },
        topHelpers: async (root, args, context) => {
            try {
                const topHelpers = await User.find({}).sort({ xp: -1, stars: -1 }).limit(NUMBER_OF_TOP_HELPERS)
                return topHelpers;
            } catch (error) {
                console.log(error);
                throw new Error(error);
            }
        }
    },
    Mutation: {
        createUser: async (root, args, context) => {
            const { uid, username } = args;
            try {
                const user = await new User({ uid, username }).save();
                return user._doc;
            } catch (error) {
                console.log(error);
                throw new Error;
            }
        },
        incrementXpForUser: async (root, args, context) => {
            const { uid } = args;
            try {
                let user = await User.findOne({ uid });
                const {xp} = user._doc;
                user = await User.findOneAndUpdate({ uid }, { xp: xp + XP_INCREMENT_PER_HELP }, { new: true });
                pubsub.publish(INCREMENT_XP_FOR_USER, { onXpIncrement: { ...user._doc } });
                return user._doc;
            } catch (error) {
                console.log(error);
                throw new error;
            }
        },
        addStarsForuser: async (root, args, context) => {
            const { uid, starsGivenByUser } = args;
            try {
                let user = await User.findOne({ uid });
                const {stars, totalRaters } = user._doc;
                user = await User.findOneAndUpdate(
                    { uid }, 
                    { stars: stars + starsGivenByUser, totalRaters: totalRaters +  1 }, 
                    { new: true }
                );
                pubsub.publish(INCREMENT_XP_FOR_USER, { onXpIncrement: { ...user._doc } });
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
        addNotification: async (root, args, context) => {
            try {
                const { uid, notification } = args;
                const user = await User.findOneAndUpdate(
                    { uid }, 
                    { "$push": { 
                            "notifications": { ...notification, timeStamp: new Date().getTime() } 
                        } 
                    }, 
                    { new: true }
                );
                return user._doc;
            } catch (error) {
                console.log(error)
                throw new Error;
            }
        },
        removeNotification: async (root, args, context) => {
            try {
                const { uid, idOfNotification } = args;
                const user = await User.findOneAndUpdate(
                    { uid }, 
                    { "$pull": { 
                            "notifications": { _id: idOfNotification } 
                        } 
                    },
                    { new: true }
                );
                return user._doc;
            } catch (error) {
                console.log(error)
                throw new Error;
            }
        },
        addCreatedHelpRequest: async (root, args, context) => {
            try {
                const { uid, idOfHelpRequest } = args;
                const user = await User.findOneAndUpdate(
                    { uid }, 
                    { "$push": { 
                            "createdHelpRequests": idOfHelpRequest
                        } 
                    }, 
                    { new: true }
                );
                return user._doc; 
            } catch (error) {
                console.log(error)
                throw new Error;
            }
        },
        addHelpedHelpRequest: async (root, args, context) => {
            try {
                const { uid, idOfHelpRequest } = args;
                const user = await User.findOneAndUpdate(
                    { uid }, 
                    { "$push": { 
                            "helpedHelpRequests": idOfHelpRequest
                        } 
                    }, 
                    { new: true }
                );
                return user._doc; 
            } catch (error) {
                console.log(error)
                throw new Error;
            }
        }
    },
    Subscription: {
        onXpIncrement: {
            subscribe: () => pubsub.asyncIterator(INCREMENT_XP_FOR_USER)
        }
    }
}