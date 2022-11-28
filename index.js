require("dotenv").config({ path: "./src/config/.env" });
const express = require("express");
const connection = require("./src/DB/connectDB");
const mongoose = require("mongoose");
const cors = require("cors");
const Grid = require('gridfs-stream')
const fs = require('fs')
const https = require('https')
const router = require("./src/Routes/router")
const cookieParser = require("cookie-parser");
const { getSubscribers, createNotification } = require("./src/helpers/getData");
const app = express();
const http = require("http");

let server;
if (process.env.NODE_ENV === "production") {
    const privateKey = fs.readFileSync('/etc/letsencrypt/live/portal.webuyanyhousefastcash.com-0001/privkey.pem', 'utf8')
    const certificate = fs.readFileSync('/etc/letsencrypt/live/portal.webuyanyhousefastcash.com-0001/cert.pem', 'utf8');
    const ca = fs.readFileSync('/etc/letsencrypt/live/portal.webuyanyhousefastcash.com-0001/chain.pem', 'utf8');

    server = https.createServer({
        key: privateKey,
        cert: certificate,
        ca: ca
    }, app);
}
else {
    server = http.createServer(app);
}
const io = require("socket.io")(server, {
    cors: {
        method: ["GET", "POST"],
    },
});


app.use(express.json({limit: '50mb'}));
app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true,limit: '50mb' }));


mongoose.set('useFindAndModify', false);

let gfs;
connection();
const conn = mongoose.connection;
conn.once("open", function () {
    gfs = Grid(conn.db, mongoose.mongo);
    // gfs.collection('uploads');
});

// routes
app.use("/api", router);

// const port = process.env.PORT;
app.get("/", (req, res) => {
    res.cookie("name", "value").json({ message: "Hello World" });
})
const port = process.env.PORT || 8080;
const host = process.env.HOST || "localhost";
io.on("connection", (socket) => {
    console.log('a user connected', socket.id);
    socket.on("leads", async (msg) => {
        console.log("message: " + msg._id);
        console.log("message: " + msg.userId);
        try {
            let getSubscribe = await getSubscribers(msg.zipcode);
            if (!getSubscribe) return false
            for (var i = 0; i < getSubscribe.length; i++) {
                if (String(getSubscribe[i].userId) !== msg.userId) {
                    let crate = await createNotification({
                        userId: getSubscribe[i].userId,
                        title: "Lead Lost",
                        detail: `You Lost Lead on ${msg.zipcode} Zipcode`,
                        status: false
                    })
                    if (!crate) return false
                    io.emit(`notification/${getSubscribe[i].userId}`);
                } else {
                    let crate = await createNotification({
                        userId: getSubscribe[i].userId,
                        title: "Lead Won",
                        detail: `You Won Lead on ${msg.zipcode} Zipcode`,
                        status: false
                    })
                    io.emit(`newlead/${msg.userId}`, msg);
                    if (!crate) return false
                    io.emit(`notification/${getSubscribe[i].userId}`);
                }
            }
        }
        catch (err) {
            console.log(err);
        }

    })
    socket.on("subscribers", async (msg) => {
        console.log("message: subscribers " + msg._id);
        try {
            let getSubscribe = await getSubscribers(msg.zipcode.zipcode);
            if (!getSubscribe) return false
            console.log(getSubscribe.length, "length");
            for (var i = 0; i < getSubscribe.length; i++) {
                if (String(getSubscribe[i].userId) !== msg.userId) {

                    let crate = await createNotification({
                        userId: getSubscribe[i].userId,
                        title: "BID Update",
                        detail: `Your Rank is Lower on ${msg.zipcode.zipcode} Zipcode`,
                        status: false
                    })
                    io.emit(`bidUpdate`);
                    if (!crate) return false
                    io.emit(`notification/${getSubscribe[i].userId}`);

                } else {
                    let crate = await createNotification({
                        userId: getSubscribe[i].userId,
                        title: "BID Update",
                        detail: `Your Rank is Higher on ${msg.zipcode.zipcode} Zipcode`,
                        status: false
                    })
                    io.emit(`bidUpdate`, msg);
                    if (!crate) return false
                    io.emit(`notification/${getSubscribe[i].userId}`);
                }
            }
        }
        catch (err) {
            console.log(err);
        }

    })
})


// create server
server.listen(port, () => {
    console.log(`Server is Running on port:http://${host}:${port}`);
});
