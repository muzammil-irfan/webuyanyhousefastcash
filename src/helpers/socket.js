const { io } = require("socket.io-client");
exports.socket = io.connect(`http://${process.env.HOST || "localhost"}:${process.env.PORT || 8080}`);