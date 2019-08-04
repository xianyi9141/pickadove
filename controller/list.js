const sign = require('../dao/sign.js')
const profile = require('../dao/profile.js')
const dao = require('../dao/list.js')
const async = require('async')

function validateUserInfo(userInfo) {
    delete userInfo.password
}

function templateFunction(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    sign.assyncVerifyToken(token)
        .then(decoded => {
            if (decoded.id == params.user_id) {

            }
        })
        .catch(err => {
            res.send({ success: 0, message: 'Invalid User!' })
        })
}

function getProfileList(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    let funcAction = function (err, decoded) {
        if (err) return res.send({ success: -1, message: 'Failed to authenticate token.' })
        if (decoded.id == params.user_id) {
            dao.getProfileList(params, function (err, returnVal) {
                if (err) throw err
                return res.send({ success: 1, message: 'Retrived Profile Lists.', data: returnVal })
            })
        } else res.send({ success: 0, message: 'Invalid User!' })
    }
    sign.verifyToken(token, funcAction)
}

function getTopProfile(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    let funcAction = function (err, decoded) {
        if (err) return res.send({ success: -1, message: 'Failed to authenticate token.' })
        if (decoded.id == params.user_id) {
            dao.getTopProfile(params, function (err, userInfo) {
                if (err) throw err
                else if (userInfo) {
                    async.parallel([
                        function (callback) {
                            dao.getLastCommentForUser(userInfo.id_user, function (err, returnVal) {
                                if (err) callback(err)
                                else {
                                    userInfo.comment = returnVal
                                    callback(null)
                                }
                            })
                        }, function (callback) {
                            dao.getGalleriesById(userInfo.id_user, function (err, returnVal) {
                                if (err) throw err
                                else {
                                    userInfo.galleries = returnVal
                                    callback(null)
                                }
                            })
                        }
                    ], function (err, result) {
                        if (err) throw err
                        return res.send({ success: 1, message: 'Retrived Top Profile.', data: userInfo })
                    })
                } else return res.send({ success: 1, message: 'No Top Profile.', data: userInfo })
            })
        } else res.send({ success: 0, message: 'Invalid User!' })
    }
    sign.verifyToken(token, funcAction)
}

function getProfileDetailsById(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    let funcAction = function (err, decoded) {
        if (err) return res.send({ success: -1, message: 'Failed to authenticate token.' })
        if (decoded.id == params.user_id) {
            dao.getProfileDetailsById(params.view_id, function (err, userInfo) {
                if (err) throw err
                else {
                    async.parallel([
                        function (callback) {
                            dao.viewProfile(params.user_id, params.view_id, function (err, workhours) {
                                if (err) callback(err)
                                callback(null)
                            })
                        },
                        function (callback) {
                            dao.getAdminFieldsData(params.view_id, function (err, returnVal) {
                                if (err) throw err
                                else {
                                    userInfo.adminFields = returnVal
                                    callback(null)
                                }
                            })
                        },
                        function (callback) {
                            profile.getOtherContactsData(params.view_id, function (err, returnVal) {
                                if (err) throw err
                                else {
                                    userInfo.otherContacts = returnVal
                                    callback(null)
                                }
                            })
                        },
                        function (callback) {
                            profile.getWorkHoursByUserId(params.view_id, function (err, workhours) {
                                if (err) callback(err)
                                else {
                                    userInfo.workhours = workhours
                                    callback(null)
                                }
                            })
                        },
                        function (callback) {
                            profile.getGirlsService(params.view_id, function (err, services) {
                                if (err) callback(err)
                                else {
                                    userInfo.services = services
                                    callback(null)
                                }
                            })
                        }, function (callback) {
                            dao.getGalleriesById(userInfo.id_user, function (err, returnVal) {
                                if (err) throw err
                                else {
                                    userInfo.galleries = returnVal
                                    callback(null)
                                }
                            })
                        }
                    ], function (err, result) {
                        if (err) throw err
                        return res.send({ success: 1, message: 'Retrieved User Info.', data: userInfo })
                    })
                }
            })
        } else res.send({ success: 0, message: 'Invalid User!' })
    }
    sign.verifyToken(token, funcAction)
}

function getHistoryList(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    let funcAction = function (err, decoded) {
        if (err) return res.send({ success: -1, message: 'Failed to authenticate token.' })
        if (decoded.id == params.user_id) {
            dao.getHistoryByUserId(params.user_id, function (err, returnVal) {
                if (err) throw err
                return res.send({ success: 1, message: 'Retrived History Lists.', data: returnVal })
            })
        } else res.send({ success: 0, message: 'Invalid User!' })
    }
    sign.verifyToken(token, funcAction)
}

function revealContactInfo(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    let funcAction = function (err, decoded) {
        if (err) return res.send({ success: -1, message: 'Failed to authenticate token.' })
        if (decoded.id == params.user_id) {
            dao.getRevealedCount(params.view_id, function (err, returnVal) {
                if (err) throw err
                else {
                    if (returnVal) {
                        dao.updateRevealedCount(params.view_id, returnVal.revealednum + 1, function (err, returnValue) {
                            if (err) throw err
                            return res.send({ success: 1, message: 'Revealed the contact details.' })
                        })
                    } else {
                        dao.insertRevealedCount(params.view_id, 1, function (err, returnValue) {
                            if (err) throw err
                            return res.send({ success: 1, message: 'Revealed the contact details.' })
                        })
                    }
                }
            })
        } else res.send({ success: 0, message: 'Invalid User!' })
    }
    sign.verifyToken(token, funcAction)
}

function viewGallery(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    let funcAction = function (err, decoded) {
        if (err) return res.send({ success: -1, message: 'Failed to authenticate token.' })
        if (decoded.id == params.user_id) {
            dao.getGalleryCount(params.gallery_id, function (err, returnVal) {
                if (err) throw err
                else {
                    if (returnVal) {
                        dao.updateGalleryCount(params.gallery_id, returnVal.viewcounts + 1, function (err, returnValue) {
                            if (err) throw err
                            return res.send({ success: 1, message: 'Viewed the gallery.' })
                        })
                    } else {
                        dao.insertGalleryCount(params.gallery_id, 1, function (err, returnValue) {
                            if (err) throw err
                            return res.send({ success: 1, message: 'Viewed the gallery.' })
                        })
                    }
                }
            })
        } else res.send({ success: 0, message: 'Invalid User!' })
    }
    sign.verifyToken(token, funcAction)
}

function likeGallery(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    let funcAction = function (err, decoded) {
        if (err) return res.send({ success: -1, message: 'Failed to authenticate token.' })
        if (decoded.id == params.user_id) {
            dao.likeGallery(params.user_id, params.gallery_id, function (err, returnVal) {
                if (err) throw err
                else return res.send({ success: 1, message: 'Liked the gallery.', data: returnVal })
            })
        } else res.send({ success: 0, message: 'Invalid User!' })
    }
    sign.verifyToken(token, funcAction)
}

function dislikeGallery(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    let funcAction = function (err, decoded) {
        if (err) return res.send({ success: -1, message: 'Failed to authenticate token.' })
        if (decoded.id == params.user_id) {
            dao.dislikeGallery(params.user_id, params.gallery_id, function (err, returnVal) {
                if (err) throw err
                else return res.send({ success: 1, message: 'Disiked the gallery.' })
            })
        } else res.send({ success: 0, message: 'Invalid User!' })
    }
    sign.verifyToken(token, funcAction)
}

function getComments(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    let funcAction = function (err, decoded) {
        if (err) return res.send({ success: -1, message: 'Failed to authenticate token.' })
        if (decoded.id == params.user_id) {
            dao.getComments(params.commented_user, 0, params.comment_type, function (err, returnVal) {
                if (err) throw err
                else {
                    count = 0;
                    async.whilst(
                        function () { return count < returnVal.length },
                        function (callback) {
                            dao.getComments(params.commented_user, returnVal[count].id_comment, params.comment_type, function (err, reply) {
                                returnVal[count].replies = reply
                                count++
                                callback()
                            })
                        },
                        function (err) {
                            if (err) throw err
                            return res.send({ success: 1, message: 'Retrieved comments.', data: returnVal })
                        }
                    );
                }
            })
        } else res.send({ success: 0, message: 'Invalid User!' })
    }
    sign.verifyToken(token, funcAction)
}

function getCommentsTest(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    let funcAction = async function (err, decoded) {
        if (err) return res.send({ success: -1, message: 'Failed to authenticate token.' })
        if (decoded.id == params.user_id) {
            // dao.getCommentsTest(params.commented_user)
            //     .then(resulut => {
            //         return res.send({ success: 1, message: 'Retrieved comments.', data: resulut })
            //     })
            //     .catch(err => {
            //         throw err
            //     })
            try {
                results = await dao.getCommentsTest(params.commented_user)
                return res.send({ success: 1, message: 'Retrieved comments.', data: results })
            } catch (err) {
                throw (err)
            }
        } else res.send({ success: 0, message: 'Invalid User!' })
    }
    sign.verifyToken(token, funcAction)
}

function leaveComment(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    sign.assyncVerifyToken(token)
        .then(decoded => {
            if (decoded.id == params.user_id) {
                dao.leaveComment(params, function (err, returnVal) {
                    if (err) throw err
                    else return res.send({ success: 1, message: 'Left the comment.', insertId: returnVal })
                })
            }
        })
        .catch(err => {
            res.send({ success: 0, message: 'Invalid User!' })
        })
}

function lockGallery(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    sign.assyncVerifyToken(token)
        .then(decoded => {
            if (decoded.id == params.user_id) {
                dao.lockGallery(params.gallery_id, params.islock, function(err, returnVal) {
                    if (err) throw err
                    else {
                        let returnMessage = "Locked the photo."
                        if (params.islock == 0) returnMessage = "Unlocked the photo."
                        return res.send({ success: 1, message: returnMessage})
                    }
                })
            }
        })
        .catch(err => {
            res.send({ success: 0, message: 'Invalid User!' })
        })
}

exports.getTopProfile = getTopProfile
exports.getProfileList = getProfileList
exports.getProfileDetailsById = getProfileDetailsById
exports.getHistoryList = getHistoryList
exports.revealContactInfo = revealContactInfo
exports.viewGallery = viewGallery
exports.likeGallery = likeGallery
exports.dislikeGallery = dislikeGallery
exports.getComments = getComments
exports.getCommentsTest = getCommentsTest
exports.leaveComment = leaveComment
exports.lockGallery = lockGallery