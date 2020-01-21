module.exports = {
    dev: {
        mongoUrl : 'mongodb://localhost:27017/helpApp',
        port: 4000
    },
    prod: {
        mongoUrl : 'mongodb+srv://help-app-db-user:6slD3zqRqzHm7XjL@cluster0-phtnz.mongodb.net/helps?retryWrites=true&w=majority',
        port: 4000
    }
}