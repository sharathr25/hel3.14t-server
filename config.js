module.exports = {
    dev: {
        mongoUrl : 'mongodb://localhost:27017/helpApp',
    },
    prod: {
        mongoUrl : 'mongodb+srv://help-app-db-user:6slD3zqRqzHm7XjL@cluster0-phtnz.mongodb.net/helps?retryWrites=true&w=majority',
    },
    jwkURL: "https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_HvCk1Hjse/.well-known/jwks.json"
}