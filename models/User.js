const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const jwt = require('jsonwebtoken')

// const validator = require("validator")

let userSchema = new Schema({
    name: {
        type: String,
        // required: false,
        maxLength: 30,
        minLength: 3,
    },
    licenseNumber: {
        type: Number,
    },
    ssn: {
        type: Number,
    },
    position: {
        type: String,
        enum: ["a","b","c","d","e","f"],
    },
    email: {
        type: String,
        // required: false,
        unique: true,
        match: [/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,"Please enter a valid email address"],
        // validate: [validator.isEmail,"Please enter a valid email address"],
    },
    password: {
        type: String,
        // required: true,
        // match: [/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/],
    },
    profilePicture: {
        type: String,
        default: null,
    },
    verification_code: {
        type: Number,
        default: null,
    },
    verified: {
        type: Number,
        default: 1,
    },
    role: {
        type: String,
        default: "user"
    },
    //social login
    user_social_token: {
        type: String,
        required: false,
        trim: true,
        default: null
    },
    user_social_type: {
        type: String,
        required: false,
        trim: true,
        default: null
    },
    user_device_type: {
        type: String,
        required: false,
        trim: true,
        default: null
    },
    user_device_token: {
        type: String,
        required: false,
        trim: true,
        default: null
    },
    user_authentication: {
        type: String,
        default: null,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, {
    timestamps: true
});

// Export the model
const User = mongoose.model("User", userSchema);
module.exports = User;