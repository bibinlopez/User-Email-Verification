const mongoose = require('mongoose')
const schema = mongoose.Schema;

const userVerification = new schema({
    userId: String, 
    otp: String,
    createdAt: Date,
    expiresAt: Date
})


module.exports = mongoose.model('UserVerification',userVerification)