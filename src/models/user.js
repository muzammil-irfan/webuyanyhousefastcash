const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      validate: {
        validator: async function (userName) {
          const user = await this.constructor.findOne({ userName });
          if (user) {
            if (this.id === user.id) {
              return true;
            }
            return false;
          }
          return true;
        },
        message: (props) => "The specified Username is already in use.",
      },
      required: true,
    },
    email: {
      type: String,
      validate: {
        validator: async function (email) {
          const user = await this.constructor.findOne({ email });
          if (user) {
            if (this.id === user.id) {
              return true;
            }
            return false;
          }
          return true;
        },
        message: (props) => "The specified Email Address is already in use.",
      },
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    AddressLocation: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    Status: {
      type: Boolean,
      required: true,
      default: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Athentication
const userValid = Joi.object({
  name: Joi.string().required(),
  userType: Joi.string().required(),
  userName: Joi.string().required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
  confirmPassword: Joi.string().required().valid(Joi.ref("password")),
  AddressLocation: Joi.string().required(),
  mobile: Joi.string()
    .min(8)
    .max(11)
    .pattern(/^(?=.*[0-9])/)
    .required()
    .error((errors) => {
      errors.forEach((err) => {
        switch (err.code) {
          case "any.empty":
            err.message = "Value should not be empty!";
            break;
          case "string.min":
            err.message = `Value should have at least ${err.local.limit} characters!`;
            break;
          case "string.max":
            err.message = `Value should have at most ${err.local.limit} characters!`;
            break;
          default:
            break;
        }
      });
      return errors;
    }),
  Status: Joi.boolean().default("true"),
  isActive: Joi.boolean().default("false"),
});

// hash password
userSchema.pre("save", async function (next) {
  if (this.password && this.isNew) {
    try {
      this.password = await bcrypt.hash(this.password, 10);
      next();
    } catch (err) {
      return res.json({ message: err.message });
    }
  }
});

// login Authentication
userSchema.statics.authlogin = async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) return user;

    throw Error("Password is incorrect");
  }
  throw Error("Email is incorrect");
};
userSchema.statics.checkPassword = async function (userpass,password) {
    const isMatch = await bcrypt.compare(userpass, password);
    console.log(isMatch,password, userpass);
    if (!isMatch) return false;
    return true;
};

// generate json web token
userSchema.methods.generateAuthToken = async function () {
  try {
    const token = jwt.sign(
      { _id: this._id.toString() },
      process.env.SECRET_KEY
    );

    if (token) return token;
  } catch (err) {
    console.log(err);
  }
};

const User = mongoose.model("user", userSchema);
module.exports = { User, userValid };
