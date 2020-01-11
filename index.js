const express = require('express');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const schema  =require('./graphql/shemas');
const resolvers = require('./graphql/resolvers');

const app = express();

app.use('/graphql', graphqlHTTP({
    schema: buildSchema(schema),
    rootValue: resolvers,
    graphiql: true,
}));

mongoose.connect('mongodb://localhost:27017/helpApp', { useNewUrlParser: true, useUnifiedTopology: true });

app.listen(3000, () => {
    console.log("Listening on port 3000...........");
});