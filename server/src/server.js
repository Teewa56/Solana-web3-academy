const http = require('http');
const app = require('./app');
const { port } = require('./config/env');
const connectDB = require('./config/dbConfig');

const server = http.createServer(app);

connectDB()
    .then(() => 
        server.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        }))
    .then(() => console.log("DB connected succesflly in server"))
    .catch((e) => console.log(e))