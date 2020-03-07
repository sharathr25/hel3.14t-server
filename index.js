const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express')
const { createServer } = require('http');
const mongoose = require('mongoose');
const schema = require('./graphql/shemas');
const resolvers = require('./graphql/resolvers');
const bodyParser = require('body-parser');
const config = require('./config')[process.env.ENV || "dev"];

const { mongoUrl } = config;

const app = express();

app.use(bodyParser.json());

// app.use((req, res, next) => {
//     console.count("****************************************");
//     console.log(req.body);
//     next();
// });

const server = new ApolloServer({
    typeDefs: gql`${schema}`,
    resolvers,
})

server.applyMiddleware({app});

const ws = createServer(app);

server.installSubscriptionHandlers(ws);

ws.listen({port:process.env.PORT || 4000}, () => {
    console.log(`Apollo Server is now running on ${process.env.PORT || 4000}`);
});

mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }).then(() => {
    console.log("DB connencted");
}).catch((err) => {
    console.log(err);
});