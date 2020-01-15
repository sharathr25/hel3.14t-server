const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express')
const { createServer } = require('http');
const mongoose = require('mongoose');
const schema = require('./graphql/shemas');
const resolvers = require('./graphql/resolvers');

const PORT = 4000;

const app = express();

const server = new ApolloServer({
    typeDefs: gql`${schema}`,
    resolvers,
})

server.applyMiddleware({app});

const ws = createServer(app);

server.installSubscriptionHandlers(ws);

ws.listen({port:PORT}, () => {
    console.log(`Apollo Server is now running on http://localhost:${PORT}`);
});

mongoose.connect('mongodb://localhost:27017/helpApp', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });