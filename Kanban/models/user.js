let mongoose = require('mongoose');
let passportLocalMongoose = require('passport-local-mongoose').default;
const { MissingPasswordError } = require('passport-local-mongoose/dist/lib/errors');

let User = mongoose.Schema({
    username: {
        type: String,
        default: "",
        trim:true,
        required: "Username Required"   
    },
    password: {
        type: String,
        default: "",
        trim: true,
        required: "Password Required"     
    },
    email: {
        type: String,
        default: "",
        trim: true,
        required: "Display Name Required"      
    },
    displayName: {
        type: String,
        default: "",
        trim: true,
        required: "Display Name Required"      
    },
    googleId: {
        type: String,
        sparse: true
    },
    githubId: {
        type: String,
        sparse: true
    }
},
{
    Collection: "user"
});

let options = {MissingPasswordError: "Wrong/Missing Password!"}
User.plugin(passportLocalMongoose, options);
module.exports = mongoose.model("User", User)