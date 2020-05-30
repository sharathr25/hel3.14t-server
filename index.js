const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express')
const { createServer } = require('http');
const mongoose = require('mongoose');
const schema = require('./graphql/shemas');
const resolvers = require('./graphql/resolvers');
const bodyParser = require('body-parser');
const config = require('./config')[process.env.ENV || "dev"];
const jwt = require('jsonwebtoken')
const jwkToPem = require('jwk-to-pem');
const jwk = require('./jsonWebKey.json');

const { mongoUrl } = config;

const app = express();

app.use(bodyParser.json());

// app.use((req, res, next) => {
//     console.count("****************************************");
//     console.log(req.body);
//     next();
// });

const isValid = (req) => {
    let isValid = false;
    if(req) {
        const { headers } = req;
        const { authorization } = headers;
        if(authorization) {
            const token = authorization.split(' ')[1];
            const pem = jwkToPem(jwk.keys[1]);
            try {
                const decodedToken = jwt.verify(token, pem, { algorithms: ['RS256'] });
                if(decodedToken) {
                    isValid = true;
                }
            } catch (error) {
                console.log(error);
            } 
        }
    } 

    return { isValid };
}

const getPushNotificationToken = (req) => {
    let tokenForPushNotification = ""
    if(req) {
        const { headers } = req;
        const { authorization } = headers;
        if(authorization) {
            tokenForPushNotification = authorization.split(' ')[2];
        }
    }
    return { tokenForPushNotification }
}

const server = new ApolloServer({
    typeDefs: gql`${schema}`,
    resolvers,
    context: ({ req }) => getPushNotificationToken(req)
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