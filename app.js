require('dotenv').config();
require('express-async-errors');

const express = require("express");
const app = express();
const cors = require('cors');
const connectDB = require("./db/connect");
const peopleRouter = require("./routes/people");
const faultsRouter = require("./routes/faults");
const accountsRouter = require("./routes/accounts"); 

app.use(express.json());
app.use(cors());


// Register routes
app.use("/api/v1", peopleRouter);
app.use("/api/v1/faults", faultsRouter);
app.use("/api/v1/accounts", accountsRouter); 

const port = process.env.PORT || 3000;

const start = async () => {
    try {
        console.log("MongoDB URI:", process.env.MONGO_URI)
        await connectDB(process.env.MONGO_URI);
        app.listen(port, () => {
            console.log("Server listening on port " + port);
        });
    } catch (error) {
        console.log(error);
    }
};

start();