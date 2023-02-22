const User = require('../models/userSchema')
const UserVerification = require('../models/userVerification')
const validator = require('validator')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')



const registration = (req, res) => {

    let { name, email, password } = req.body
    Name = name.trim();
    email = email.trim();
    password = password.trim();

    // console.log('@@@',name=="");

    if (name == "" || email == "" || password == "") {
        res.status(422).json({
            success: false,
            message: "Empty input fields!"
        })
    } else if (!/^[a-zA-Z]*( [a-zA-Z]*)?$/.test(Name)) {
        res.status(422).json({
            success: false,
            message: "Invalid name Entered"
        })
    } else if (validator.isEmail(email) === false) {
        return res.status(422).json({
            success: false,
            message: "Invalid email Entered"
        })
    } else if (password.length < 6) {
        res.status(422).json({
            success: false,
            message: "Length of the Password is too short"
        })
    } else {
        User.find({ email })
            .then((result) => {
                if (result.length) {
                    return res.status(422).json({
                        status: 'FAILED',
                        message: "User with the provided email already exists"
                    })
                } else {
                    var saltRounds = 10
                    bcrypt.hash(password, saltRounds)
                        .then((hashedPassword) => {
                            const user = new User({
                                Name,
                                email,
                                password: hashedPassword,
                                verified: false
                            })
                            user.save()
                                .then((result) => {
                                    console.log(result);
                                    sendOTPEmail(result, res)
                                })

                                .catch((err) => {
                                    return res.status(422).json({
                                        success: false,
                                        message: "An error occurred while saving user account!"
                                    })
                                })
                        })
                        .catch((err) => {
                            return res.status(422).json({
                                success: false,
                                message: "An error occurred while hashing the password!"
                            })
                        })

                }
            })
    }
}





const sendOTPEmail = async ({ _id, email }, res) => {
    try {
        otp = `${Math.floor(1000 + Math.random() * 9000)}`
        const transporter = nodemailer.createTransport({
            service: "hotmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        })

        const options = {
            from: 'Travel-In <nodedemo9090@outlook.com>',
            to: email,
            subject: "Verifiy Your Email",
            html: `<p> Your OTP Verification code is <b> ${otp} </b>. Enter the code in the app to verify your email address and complete verification process. This code <b>expires in 30 minutes</b>.</p>`

        }
        saltRounds = 10
        const hashedOTP = await bcrypt.hash(otp, saltRounds)
        const userverification = await new UserVerification({
            userId: _id,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + 1800000      // 30 minutes in milliseconds

        })

        //save otp record
        const Result = await userverification.save();
        console.log(Result);
        await transporter.sendMail(options, (err, info) => {
            if (err) {
                console.log(err);
                return;
            } else {
                console.log(info.messageId);
            }
        })
        return res.json({
            status: "PENDING",
            message: 'Verification otp email send through email',
            data: {
                userId: _id,
                email,
            }
        })

    } catch (error) {
        return res.status(422).json({
            success: false,
            message: error.toString()
        })
    }
}




const verifyOTP = async (req, res) => {
    try {
        console.log('req.obdy', req.body);
        let { userId, otp } = req.body
        if (!userId || !otp) {
            throw Error("Empty otp details are not allowed")
        } else {
            const userVerificationRecords = await UserVerification.find({ userId })
            console.log('records', userVerificationRecords);
            if (userVerificationRecords.length <= 0) {
                //no record found
                throw new Error(
                    "Account record does not exist or has been verified already. Please sign up or log in."
                )
            }
            else {
                //user otp record exists
                const { expiresAt } = userVerificationRecords[0]
                const hashedOTP = userVerificationRecords[0].otp

                if (expiresAt < Date.now()) {
                    // user otp records has expired
                    await UserVerification.deleteOne({ userId })
                    throw new Error("Code has expried . Please request again.")
                } else {
                    const validOTP = await bcrypt.compare(otp, hashedOTP)
                    if (!validOTP) {
                        //entered otp is wrong
                        throw new Error("Invalid code passed . Check your inbox.")
                    } else {
                        await User.updateOne({ _id: userId }, { verified: true })
                        await UserVerification.deleteOne({ userId })
                        return res.status(200).json({
                            status: "VERIFIED",
                            message: "User email verified successfully"
                        })
                    }

                }
            }
        }
    } catch (err) {
        return res.status(422).json({
            status: "FAILED",
            error: err.toString()
        })

    }
}




const resendOTP = async (req, res) => {

    let { userId, email } = req.body

    if (!userId || !email) {
        throw Error("Empty user details are not allowed")
    } else {
        //delete existing records and resend
        UserVerification.deleteOne({ userId })
            .then((result) => {
                const data = {
                    _id: userId,
                    email,
                }
                sendOTPEmail(data, res)
            })
            .catch((err) => {
                return res.status(500).json({
                    success: false,
                    error: err.toString()
                })
            })
    }

}



module.exports = { registration, verifyOTP, resendOTP }