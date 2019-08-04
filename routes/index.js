var express = require('express');
var router = express.Router();
const multer = require('multer')
const crypto = require('crypto')
const path = require('path')
const mime = require('mime')

var signManager = require('../controller/sign');
var profileManager = require('../controller/profile');
var listManager = require('../controller/list');
var adminManager = require('../controller/admin');

/* return success for home url. */
// router.get('/', function (req, res, next) {
//   res.send('connection successful!');
// });

var storage = multer.diskStorage({
  destination:  __dirname + '/../tempImages/',
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      if (err) return cb(err)

      cb(null, raw.toString('hex') + '.' + mime.getExtension(file.mimetype))
      // cb(null, raw.toString('hex') + path.extname(file.originalname))
    })
  }
})

var upload = multer({ storage: storage })

router.post('/login', signManager.login);
router.post('/signup', signManager.signup);
router.post('/verifyUser', signManager.verifyUser);
router.post('/requestVerificationCode', signManager.requestVerificationCode);
router.post('/forgotPassword', signManager.forgotPassword);
router.post('/verifyResetKey', signManager.verifyResetKey);
router.post('/resetPassword', signManager.resetPassword);
router.post('/changePassword', signManager.changePassword);
router.post('/getLoggedinUser', signManager.getLoggedinUser);

router.post('/getMyProfileDetails', profileManager.getMyProfileDetails)
router.post('/getWorkHours', profileManager.getWorkHours)
router.post('/getProfileImage', profileManager.getProfileImage)
router.post('/getAdminFields', profileManager.getAdminFields)
router.post('/getOtherContacts', profileManager.getOtherContacts)
router.post('/completeProfile', profileManager.completeProfile)
router.post('/changeName', profileManager.changeName)
router.post('/changeEmail', profileManager.changeEmail)
router.post('/changeLocation', profileManager.changeLocation)
router.post('/getGirlsService', profileManager.getGirlsService)
router.post('/saveGirlService', profileManager.saveGirlService)
router.post('/goLive', profileManager.goLive)
router.post('/uploadProfileImage', upload.single('file'), profileManager.uploadProfileImage)
router.post('/updateImageCode', upload.single('file'), profileManager.updateImageCode)
router.post('/uploadGallery', upload.single('file'), profileManager.uploadGallery)
router.post('/deleteGallery', profileManager.deleteGallery)
router.post('/getLiveStatus', profileManager.getLiveStatus)

router.post('/getTopProfile', listManager.getTopProfile)
router.post('/getProfileList', listManager.getProfileList)
router.post('/getProfileDetailsById', listManager.getProfileDetailsById)
router.post('/getHistoryList', listManager.getHistoryList)
router.post('/revealContactInfo', listManager.revealContactInfo)
router.post('/viewGallery', listManager.viewGallery)
router.post('/likeGallery', listManager.likeGallery)
router.post('/dislikeGallery', listManager.dislikeGallery)
router.post('/getComments', listManager.getComments)
router.post('/getCommentsTest', listManager.getCommentsTest)
router.post('/leaveComment', listManager.leaveComment)
router.post('/lockGallery', listManager.lockGallery)

router.post('/getAdminUsersCount', adminManager.getAdminUsersCount)
router.post('/getAdminProfile', adminManager.getAdminProfile)
router.post('/getAdminUserList', adminManager.getAdminUserList)
router.post('/changeAdminUserPassword', adminManager.changeAdminUserPassword)
router.post('/addAdminField', adminManager.addAdminField)
router.post('/deleteAdminField', adminManager.deleteAdminField)
router.post('/addAdminOtherContact', upload.single('file'), adminManager.addAdminOtherContact)
router.post('/editAdminOtherContact', upload.single('file'), adminManager.editAdminOtherContact)
router.post('/deleteAdminOtherContact', adminManager.deleteAdminOtherContact)

module.exports = router;
