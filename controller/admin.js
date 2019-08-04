const sign = require('../dao/sign.js')
const dao = require('../dao/admin.js')
const async = require('async')
const fs = require("fs")

function templateFunction(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    sign.assyncVerifyToken(token)
        .then(decoded => {
            if (decoded.id == params.user_id) {
                dao.getAdminProfile(params.user_id, function (err, returnVal) {
                    if (err) throw err
                    else return res.send({ success: 1, message: 'Retrieved the admin info.', data: returnVal })
                })
            }
        })
        .catch(err => {
            res.send({ success: 0, message: 'Invalid User!' })
        })
}

function getAdminUsersCount(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    sign.assyncVerifyToken(token)
        .then(decoded => {
            if (decoded.id == params.user_id) {
                dao.getAdminUsersCount(function (err, returnVal) {
                    if (err) throw err
                    else {
                        let browsers = 0
                        let advertisers = 0
                        let admins = 0
                        returnVal.forEach(element => {
                            if (element.usertype == 0) browsers = element.counts
                            if (element.usertype == 1) advertisers = element.counts
                            if (element.usertype == 2) admins = element.counts
                        })
                        return res.send({ success: 1, message: 'Retrieved the user counts.', data: { browsers: browsers, advertisers: advertisers, admins: admins } })
                    }
                })
            }
        })
        .catch(err => {
            res.send({ success: 0, message: 'Invalid User!' })
        })
}

function getAdminProfile(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    sign.assyncVerifyToken(token)
        .then(decoded => {
            if (decoded.id == params.user_id) {
                dao.getAdminProfile(params.user_id, function (err, returnVal) {
                    if (err) throw err
                    else return res.send({ success: 1, message: 'Retrieved the admin info.', data: returnVal })
                })
            }
        })
        .catch(err => {
            res.send({ success: 0, message: 'Invalid User!' })
        })
}

function getAdminUserList(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    sign.assyncVerifyToken(token)
        .then(decoded => {
            if (decoded.id == params.user_id) {
                let advertisers = []
                let browsers = []
                let admins = []
                async.parallel([
                    function (callback) {
                        dao.getAdminUserListByType(0, function (err, returnVal) {
                            if (err) callback(err)
                            else {
                                browsers = returnVal
                                callback(null)
                            }
                        })
                    }, function (callback) {
                        dao.getAdminUserListByType(1, function (err, returnVal) {
                            if (err) callback(err)
                            else {
                                advertisers = returnVal
                                callback(null)
                            }
                        })
                    }, function (callback) {
                        dao.getAdminsList(function (err, returnVal) {
                            if (err) callback(err)
                            else {
                                admins = returnVal
                                callback(null)
                            }
                        })
                    }

                ], function (err) {
                    if (err) throw err
                    else return res.send({ success: 1, message: 'Retrieved the users list.', data: { advertisers: advertisers, browsers: browsers, admins: admins } })
                })
            }
        })
        .catch(err => {
            res.send({ success: 0, message: 'Invalid User!' })
        })
}

function changeAdminUserPassword(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    sign.assyncVerifyToken(token)
        .then(decoded => {
            if (decoded.id == params.user_id) {
                dao.changeAdminUserPassword(params.change_user_id, params.password, function (err, returnVal) {
                    if (err) throw err
                    else return res.send({ success: 1, message: 'Changed the password.' })
                })
            }
        })
        .catch(err => {
            res.send({ success: 0, message: 'Invalid User!' })
        })
}

function addAdminField(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    sign.assyncVerifyToken(token)
        .then(decoded => {
            if (decoded.id == params.user_id) {
                dao.insertAdminField(params.field_type, params.label, params.isrequired, function (err, insertId) {
                    if (err) throw err
                    else {
                        if (params.field_type == 1) {
                            dao.insertAdminDropDownContent(insertId, params.combo, function (err, returnVal) {
                                if (err) throw err
                                else return res.send({ success: 1, message: 'Added admin field.' })
                            })
                        } else return res.send({ success: 1, message: 'Added admin field.' })
                    }
                })
            }
        })
        .catch(err => {
            res.send({ success: 0, message: 'Invalid User!' })
        })
}

function deleteAdminField(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    sign.assyncVerifyToken(token)
        .then(decoded => {
            if (decoded.id == params.user_id) {
                async.parallel([
                    function (callback) {
                        dao.deleteGrildAdminFieldByAdminFieldId(params.adminfield_id, function (err, returnVal) {
                            if (err) callback(err)
                            else callback(null)
                        })
                    }, function (callback) {
                        dao.deleteDropDownContentsByAdminFieldId(params.adminfield_id, function (err, returnVal) {
                            if (err) callback(err)
                            else callback(null)
                        })
                    }, function (callback) {
                        dao.deleteAdminFieldById(params.adminfield_id, function (err, returnVal) {
                            if (err) callback(err)
                            else callback(null)
                        })
                    }
                ], function (err) {
                    if (err) throw err
                    else return res.send({ success: 1, message: 'Removed the Admin Field.' })
                })
            }
        })
        .catch(err => {
            res.send({ success: 0, message: 'Invalid User!' })
        })
}

function addAdminOtherContact(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    let funcAction = function (err, decoded) {
        if (err) return res.send({ success: -1, message: 'Failed to authenticate token.' })
        if (decoded.id == params.user_id) {
            let file = req.file.path.replace('tempImages', 'images/otherContacts')
            fs.rename(req.file.path, file, function (err) {
                if (err) throw err
                else {
                    dao.addAdminOtherContact(params.label, req.file.filename, function (err, returnVal) {
                        if (err) throw err
                        else res.send({ success: 1, message: "Successfully added the other contact." })
                    })
                }
            });
        } else res.send({ success: 0, message: 'Invalid User!' })
    }
    sign.verifyToken(token, funcAction)
}

function editAdminOtherContact(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    let funcAction = function (err, decoded) {
        if (err) return res.send({ success: -1, message: 'Failed to authenticate token.' })
        if (decoded.id == params.user_id) {
            if (!req.file) {
                dao.updateOtherContact(params.othercontact_id, params.label, null, function (err, returnVal) {
                    if (err) throw err
                    else res.send({ success: 1, message: "Successfully edited the other contact." })
                })
            }
            else {
                let file = req.file.path.replace('tempImages', 'images/otherContacts')
                fs.rename(req.file.path, file, function (err) {
                    if (err) throw err
                    else {
                        async.parallel([
                            function (callback) {
                                dao.getOtherContactById(params.othercontact_id, function (err, returnVal) {
                                    if (err) callback(err)
                                    else {
                                        let originFile = __dirname + '/../images/otherContacts/' + returnVal.icon
                                        fs.unlink(originFile, function (error) {
                                            if (error) callback(err)
                                            else callback(null)
                                        });
                                    }
                                })
                            }
                        ], function (err, result) {
                            if (err) throw err
                            dao.updateOtherContact(params.othercontact_id, params.label, req.file.filename, function (err, returnVal) {
                                if (err) throw err
                                else res.send({ success: 1, message: "Successfully edited the other contact." })
                            })
                        })
                    }
                });
            }
        } else res.send({ success: 0, message: 'Invalid User!' })
    }
    sign.verifyToken(token, funcAction)
}

function deleteAdminOtherContact(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    let funcAction = function (err, decoded) {
        if (err) return res.send({ success: -1, message: 'Failed to authenticate token.' })
        if (decoded.id == params.user_id) {
            async.parallel([
                function (callback) {
                    dao.getOtherContactById(params.othercontact_id, function (err, returnVal) {
                        if (err) callback(err)
                        else {
                            let originFile = __dirname + '/../images/otherContacts/' + returnVal.icon
                            fs.unlink(originFile, function (error) {
                                if (error) callback(err)
                                else callback(null)
                            });
                        }
                    })
                }, function(callback) {
                    dao.deleteGirlOtherContactByContactId(params.othercontact_id, function(err, returnVal) {
                        if (err) throw err
                        else callback(null)
                    })
                }
            ], function (err, result) {
                if (err) throw err
                dao.deleteAdminOtherContactByContactId(params.othercontact_id, function (err, returnVal) {
                    if (err) throw err
                    else res.send({ success: 1, message: "Successfully removed the other contact." })
                })
            })
        } else res.send({ success: 0, message: 'Invalid User!' })
    }
    sign.verifyToken(token, funcAction)
}

exports.getAdminUsersCount = getAdminUsersCount
exports.getAdminProfile = getAdminProfile
exports.getAdminUserList = getAdminUserList
exports.changeAdminUserPassword = changeAdminUserPassword
exports.addAdminField = addAdminField
exports.deleteAdminField = deleteAdminField
exports.addAdminOtherContact = addAdminOtherContact
exports.editAdminOtherContact = editAdminOtherContact
exports.deleteAdminOtherContact = deleteAdminOtherContact