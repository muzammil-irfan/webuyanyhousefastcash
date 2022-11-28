const jwt = require("jsonwebtoken");
const { User } = require("../models/user");

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    const verifyToken = jwt.verify(token, process.env.SECRET_KEY);

    const user = await User.findOne({
      _id: verifyToken._id,
    });
    if (!user) {
      throw new Error("User not found");
    }
    req.token = token;
    req.userType = user.userType;
    req.userId = user._id;
    next();
  } catch (err) {
    res.json({ message: "Unauthorizrd:  No token provided" });
    console.log(err.message);
  }
};

module.exports = auth;
