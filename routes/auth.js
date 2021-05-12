const router = require('express').Router()
const authController = require('../controllers/authController')


router.post('/signup', authController.signUp)
router.post('/signin', authController.login)
router.post('/resetpassword', authController.resetPassword)
router.post('/sendtoken', authController.sendtoken)
router.get('/logout', authController.logout)
router.get('/activate', authController.activate);
router.get('/users', authController.getUsers);
router.post('/block', authController.blockUser);
router.post('/reactivate', authController.reactivateUser);


module.exports = router;