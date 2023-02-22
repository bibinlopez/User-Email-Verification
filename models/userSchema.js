const mongoose = require('mongoose')
const schema = mongoose.Schema

const userSchema =new schema({
    name : {
        type:String
    },
    email:{
        type:String
    },
    password:{
        type:String
    },
    verified:{
        type:Boolean,
    },
    createdAt:{
        type:Date,
        required: false
    }
})


userSchema.pre('save',function(next){
    const date = Date.now()
    if(!this.createdAt){
        this.createdAt = date + 19800000
    }
    next()
})



module.exports = mongoose.model('User',userSchema)