const helpResolvers = require('./helps');
const userResolvers = require('./user');

module.exports = {
    Query: { ...helpResolvers.Query, ...userResolvers.Query },
    Mutation: { ...helpResolvers.Mutation, ...userResolvers.Mutation },
    Subscription: { ...helpResolvers.Subscription },
}