const express = require('express')
const router = express.Router()
const { registration, verifyOTP ,resendOTP } = require('../controllers/userController')


router.post('/addUser', registration)
router.post('/verifyOTP', verifyOTP)
router.post('/resendOTP', resendOTP)




module.exports = router


