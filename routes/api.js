const router = require('express').Router()
const { Router } = require('express')

const { verifyToken } = require('../middlewares/authentication')

const { register, login, verifyUser, logOut, resendCode, forgotPassword, verifyCode, resetPassword, updatePassword, socialLogin } = require('../controllers/authController')
const { addCard, getCard, payment } = require('../Controllers/cardController')




//Authentication
router.post('/register', register)
router.post('/verifyUser', verifyUser)
router.post('/resendCode', resendCode)
router.post('/login', login)
router.post('/forgotPassword', forgotPassword)
router.post('/verifyCode', verifyCode)
router.post('/resetPassword', resetPassword)
router.post('/updatePassword', verifyToken, updatePassword)
router.post('/logOut', verifyToken, logOut)
router.post('/socialLogin', socialLogin)



//Card
router.post('/addcard', verifyToken, addCard)
router.get('/getcard', verifyToken, getCard)
router.post('/payment', verifyToken, payment)



module.exports = router;