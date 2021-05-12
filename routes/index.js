const router = require('express').Router();
const path = require('path');


router.get('/', (req, res) => {
  if (req.session.user) {
    res.sendFile(path.join(process.cwd() + '/views/popup.html'))
  } else {
    res.redirect('/auth');
  }


})


router.get('/auth', (req, res) => {
  res.sendFile(path.join(process.cwd() + '/views/auth.html'))
})

router.get('/resetpassword', (req, res) => {
  res.sendFile(path.join(process.cwd() + '/views/resetpassword.html'))
})


router.get('/admin', (req, res) => {
  console.log(req.session.admin)
  if (req.session.admin) {
    res.sendFile(path.join(process.cwd() + '/views/admin.html'))
  } else {
    res.redirect('/auth?e=' + encodeURIComponent('You are not an admin'))
  }

})


module.exports = router;