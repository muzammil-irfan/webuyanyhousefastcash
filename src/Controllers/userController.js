const { User, userValid } = require("../models/user");
const { Wallet } = require("../models/wallet");
const walletHistory = require("../models/walletHistory");
const nodemailer = require("nodemailer");
const smtpTransport = require('nodemailer-smtp-transport');
const jwt = require("jsonwebtoken");
const bycrypt = require("bcrypt");


let transporter= nodemailer.createTransport( smtpTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  auth: {
    user: 'porpertybidding@gmail.com',
    pass: 'Abcd@123'
  }
}) );

module.exports = {
  async signUp(req, res) {
    const { error } = userValid.validate(req.body);
    if (error) return res.json({ message: error.message });
    const { email } = req.body;
    const user = User(req.body);

    try {
      const token = await user.generateAuthToken();

      res.cookie("jwt", token, {
        sameSite: "strict",
        path: "/",
        expires: new Date(Date.now() + 25892000000),
        httpOnly: true,
      });

      const mailOptions = {
        from: `Verify your eamil`,
        to: user.email,
        subject: "Property Bidding Portal -- Verify your email",
        html: `
            <h2> ${user.name}! Thanks for registration for our site </h2>
            <h4> Please verify your mail to continue...</h4>
            <a href="http://${process.env.HOST_URL}/user/verify-email/token=${token}">verify your email</a>
        `,
      };
      transporter.sendMail(mailOptions, async (err, info)=> {
        if (err) {
          console.log(err);
         return res.json({ message: "Error in sending mail" });
        } else {
          await user.save((err, success) => {
            if (err)
              return res.json({
                message:
                  err.message.split(":").length > 0
                    ? err.message.split(":")[2]
                    : err.message,
              });
    
            const walletData = new Wallet({
              userId: success._id,
            });
    
            walletData.save((err, wallet) => {
              if (err) return res.json({ message: err.message });
    
              const walletHistoryData = new walletHistory({
                userId: success._id,
                amountHistor: 0,
                payType: "wallet",
                description: "please Add amount in your wallet",
              });
              walletHistoryData.save((err, success) => {
                if (err) return res.json({ message: err.message });
    
                return res.json({ message: "Email has been send to your account. Kindly verify your Account" });
              });
            });
          });
        }
      });


    } catch (err) {
      console.log(err);
      res.json({ message: err.message });
    }
  },
  async signIn(req, res) {
    const { email, password } = User(req.body);
    console.log( { email, password })
    try {
      const user = await User.authlogin(email, password);
      console.log(user)
      if(!user) return res.json({ message: "Invalid email or password" });
      if(user.isActive === false) return res.json({ message: "Your account is not verified" });
      if(user.status === false) return res.json({ message: "Your account is blocked" });
      const token = await user.generateAuthToken();
      if(!token) return res.json({ message: "Invalid email or password" });
      return res
        .cookie("jwt", token, {
          sameSite: "strict",
          path: "/",
          expires: new Date(Date.now() + 25892000000),
          httpOnly: true,
          // secure: true
        })
        .json({ message: "login successfull", user });
    } catch (err) {
      console.log(err);
      res.json(err.message);
    }
  },
  async allUser(req, res) {
    console.log("all user");
    try {
      const user = await User.find({});
      res.status(200).json(user);
    } catch (err) {
      console.log(err, "worng");
      res.json(err.message);
    }
  },
  async updateUser(req, res) {
    try {
      const updatedUser = await User.findOneAndUpdate(
        { _id: req.body._id },
        {
          ...req.body,
        },
        { new: true }
      );
      console.log(updatedUser);
      return res.json({ message: "Data Update Sucessfully", updatedUser });
    } catch (err) {
      res.json({ message: err.message });
    }
  },
  async activate(req, res) {
    console.log(req.body.token);
    try {
      const verifyToken = jwt.verify(req.body.token, process.env.SECRET_KEY);
      const active = await User.findOneAndUpdate(
        { _id: verifyToken._id },
        {
          isActive: true,
        },
        { new: true }
      );
      console.log(active)
      return res.json({ message: "Your Account is activated kindly Login to your" ,success:true});
    } catch (err) {
      res.json({ message: err.message });
    }
  },
  async forgetPassword(req, res) {
    const user = await User.exists({ email: req.body.email });
    if (!user) {
      console.log("email not exist");
      return res.json({ message:"email not exist" })
    }
    const jwtToken = jwt.sign({ _id: user._id }, process.env.SECRET_KEY, {expiresIn: '1h'});
    const mailOptions = {
      from: `Forgot Password`,
      to: req.body.email,
      subject: "Property Bidding Portal -- Forget Password",
      html: `
          <h4> Click Here to Reset Your Password</h4>
          <a href="http://${process.env.HOST_URL}/user/forgotpassword/token=${jwtToken}">Reset Password</a>
      `,
    };
    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        console.log(err);
       return res.json({ message: err.message });
      } else {
        return res.json({ message: "Reset Password Link is send to your email" });
      }
    });
  },
  async newPassword(req, res) {
    try {
      const verifyToken = jwt.verify(req.body.token, process.env.SECRET_KEY)
      if(req.body.password !== req.body.confirmPassword) return res.json({ message: "Password and Confirm Password not match" });
      let password = await bycrypt.hash(req.body.password,10);
      if(!password) return res.json({ message: "Server Error" }); 
      const updatedUser = await User.findOneAndUpdate(
        { _id: verifyToken._id },
        {
          password:password

        },
        { new: true }
      );
      return res.json({ message: "Password updated succesfully"});
    } catch (err) {
      return res.json({ message: err.message });
    }
  },async resetpassword(req, res) {
    console.log('resetpassword')
    try {
      const findUser = await User.findOne({ _id: req.body._id });
      if (!findUser) return res.json({ message: "User not found" });
      console.log("check",await User.checkPassword(req.body.currentPassword, findUser.password))
      const checkPassword = await User.checkPassword(req.body.currentPassword, findUser.password)
      if(!checkPassword) return res.json({ message: "Password Not Matched" });
      if(req.body.newPassword!==req.body.confirmPassword) return res.json({ message: "Password Not Matched" });
      let password = await bycrypt.hash(req.body.newPassword,10);
      if(!password) return res.json({ message: "Server Error" }); 
      const updatedUser = await User.findOneAndUpdate(
        { _id: findUser._id },
        {
          password: password,
        },
        { new: true }
      );
      return res.json({ message: "Password updated succesfully",updatedUser});
    } catch (err) {
      res.json({ message: err.message });
    }
  }
};
