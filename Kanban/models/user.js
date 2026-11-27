let mongoose = require('mongoose');
let passportLocalMongoose = require('passport-local-mongoose').default;
let mongooseFindOrCreate = require("mongoose-findorcreate")
const MissingPasswordError = require('passport-local-mongoose/dist/lib/errors');

let User = mongoose.Schema({
    /*
        You may notice that "password" is missing. In comparison to the course examples, this is because of the 
        passport-local-mongoose dependency. 

        While the user can still register with a local password, keeping it required would consistently cause errors
        for Google and Github authentication as they do not require a local password to be set. 
        Making passwords not required otherwise would let users create accounts insecurely.

        passport-local-mongoose diverts this by being a password manager itself while also adding salting and
        hashing to the local schema.
    */
    username: {
        type: String,
        default: "",
        trim:true,
        required: "Username Required"   
    },
    email: {
        type: String,
        default: "",
        trim: true,
        required: "Email Address Required"      
    },
    displayName: {
        type: String,
        default: "",
        trim: true,
        required: "Display Name Required"      
    },
    googleId: {
        type: String,

        /* 
            Not all accounts will be managed through Google or GitHub. Sparse allows indexes to be skipped
            if they do not have a specific key (i.e., googleId or githubId)
            https://www.mongodb.com/docs/manual/core/index-sparse/ 
        */
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

let options = () => {
    MissingPasswordError: "Missing/Wrong Password!"
    return MissingPasswordError
}
User.plugin(passportLocalMongoose)
User.plugin(options)
User.plugin(mongooseFindOrCreate)
module.exports = mongoose.model("User", User)