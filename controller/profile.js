const sign = require('../dao/sign.js')
const dao = require('../dao/profile.js')
const list = require('../dao/list.js')
const async = require('async')
const path = require("path")
const fs = require("fs")

function validateUserInfo(userInfo) {
    delete userInfo.password
    delete userInfo.description
}

function validateAdminField(adminField) {
    delete adminField.id_adminfield
    delete adminField.created_at
    delete adminField.content
    delete adminField.id_dropdownfield
}

function getMyProfileDetails(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    let funcAction = function (err, decoded) {
        if (err) return res.send({ success: -1, message: 'Failed to authenticate token.' })
        if (decoded.id == params.user_id) {
            dao.getLoggedinUserInfoById(decoded.id, function (err, userInfo) {
                if (err) throw err
                else {
                    async.parallel([
                        function (callback) {
                            if (userInfo.id_location) {
                                dao.getLocationDetailsById(userInfo.id_location, function (err, returnVal) {
                                    if (err) throw err
                                    else {
                                        if (returnVal == 0) userInfo.locationInfo = null
                                        else {
                                            userInfo.locationInfo = returnVal
                                            callback(null)
                                        }
                                    }
                                })
                            } else callback(null)
                        },
                        function (callback) {
                            list.getGalleriesById(params.user_id, function (err, returnVal) {
                                if (err) throw err
                                else {
                                    userInfo.galleries = returnVal
                                    callback(null)
                                }
                            })
                        },
                        function (callback) {
                            dao.getAdminFieldsData(params.user_id, function (err, returnVal) {
                                if (err) throw err
                                else {
                                    userInfo.adminFields = returnVal
                                    callback(null)
                                }
                            })
                        },
                        function (callback) {
                            dao.getOtherContactsData(params.user_id, function (err, returnVal) {
                                if (err) throw err
                                else {
                                    userInfo.otherContacts = returnVal
                                    callback(null)
                                }
                            })
                        }
                    ], function (err, result) {
                        if (err) throw err
                        validateUserInfo(userInfo)
                        return res.send({ success: 1, message: 'Retrived profile details.', data: userInfo })
                    })
                }
            })
        } else res.send({ success: 0, message: 'Invalid User!' })
    }
    sign.verifyToken(token, funcAction)
}

function getWorkHours(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    let funcAction = function (err, decoded) {
        if (err) return res.send({ success: -1, message: 'Failed to authenticate token.' })
        if (decoded.id == params.user_id) {
            dao.getWorkHoursByUserId(params.user_id, function (err, workhours) {
                if (err) throw err
                else {
                    if (workhours == 0) return res.send({ success: 1, message: 'Workhours is not set yet.', data: null })
                    else {
                        res.send({ success: 1, message: 'Retrieved the workhours', data: workhours })
                    }
                }
            })
        } else res.send({ success: 0, message: 'Invalid User!' })
    }
    sign.verifyToken(token, funcAction)
}

function getProfileImage(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    let funcAction = function (err, decoded) {
        if (err) return res.send({ success: -1, message: 'Failed to authenticate token.' })
        if (decoded.id == params.user_id) {
            dao.getProfileImageByUserId(params.view_id, function (err, returnVal) {
                if (err) throw err
                else {
                    res.send({ success: 1, message: 'Retrieved the Profile Image', data: returnVal })
                }
            })
        } else res.send({ success: 0, message: 'Invalid User!' })
    }
    sign.verifyToken(token, funcAction)
}

function getAdminFields(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    let funcAction = function (err, decoded) {
        if (err) return res.send({ success: -1, message: 'Failed to authenticate token.' })
        if (decoded.id == params.user_id) {
            dao.getAdminFields(function (err, adminFields) {
                if (err) throw err
                else {
                    if (adminFields.length == 0) return res.send({ success: 1, message: 'No Admin Fields', data: adminFields })
                    let results = []
                    let tempField = adminFields[0]
                    tempField.combo = []
                    if (tempField.field_type == 1) {
                        let combo = {
                            id: tempField.id_dropdownfield,
                            content: tempField.content
                        }
                        tempField.combo.push(combo)
                    }
                    for (var i = 1; i < adminFields.length; i++) {
                        var adminField = adminFields[i]
                        if (tempField.id_admin != adminField.id_admin) {
                            validateAdminField(tempField)
                            results.push(tempField)
                            tempField = adminField
                            tempField.combo = []
                        }
                        if (adminField.field_type == 1) {
                            let combo = {
                                id: adminField.id_dropdownfield,
                                content: adminField.content
                            }
                            tempField.combo.push(combo)
                        }
                    }
                    validateAdminField(tempField)
                    results.push(tempField)
                    return res.send({ success: 1, message: 'Retrieved Admin Fields', data: results })
                }
            })
        } else res.send({ success: 0, message: 'Invalid User!' })
    }
    sign.verifyToken(token, funcAction)
}

function getOtherContacts(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    let funcAction = function (err, decoded) {
        if (err) return res.send({ success: -1, message: 'Failed to authenticate token.' })
        if (decoded.id == params.user_id) {
            dao.getOtherContacts(function (err, otherContacts) {
                if (err) throw err
                else {
                    if (otherContacts.length == 0) return res.send({ success: 1, message: 'No Other Contacts registered', data: otherContacts })
                    return res.send({ success: 1, message: 'Retrieved Other Contacts', data: otherContacts })
                }
            })
        } else res.send({ success: 0, message: 'Invalid User!' })
    }
    sign.verifyToken(token, funcAction)
}

function completeProfile(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    let funcAction = function (err, decoded) {
        if (err) return res.send({ success: -1, message: 'Failed to authenticate token.' })
        if (decoded.id == parseInt(params.user_id)) {
            dao.saveProfile(params, function (err, returnVal) {
                if (err) throw err
                else {
                    async.parallel([
                        function (callback) {
                            if (params.workhours) {
                                dao.saveWorkHours(params.user_id, params.workhours, function (err, returnVal) {
                                    if (err) throw err
                                    else callback(null)
                                })
                            } else callback(null)
                        },
                        function (callback) {
                            if (params.adminFields) {
                                dao.saveAdminFields(params.user_id, params.adminFields, function (err, returnVal) {
                                    if (err) throw err
                                    else 
                                        callback(null)
                                })
                            } else callback(null)
                        },
                        function (callback) {
                            if (params.otherContacts) {
                                dao.saveOtherContacts(params.user_id, params.otherContacts, function (err, returnVal) {
                                    if (err) throw err
                                    else 
                                        callback(null)
                                })
                            } else callback(null)
                        }
                    ], function (err) {

                        if (err) throw err
                        return res.send({ success: 1, message: 'Successfully Completed Profile.' })
                    })
                }
            })
        } else res.send({ success: 0, message: 'Invalid User!' })
    }
    sign.verifyToken(token, funcAction)
}

function changeName(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    let funcAction = function (err, decoded) {
        if (err) return res.send({ success: -1, message: 'Failed to authenticate token.' })
        if (decoded.id == params.user_id) {
            dao.changeName(params.user_id, params.firstname, params.lastname, function (err, returnVal) {
                if (err) throw err
                return res.send({ success: 1, message: 'Successfully Changed the name.' })
            })
        } else res.send({ success: 0, message: 'Invalid User!' })
    }
    sign.verifyToken(token, funcAction)
}

function changeEmail(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    let funcAction = function (err, decoded) {
        if (err) return res.send({ success: -1, message: 'Failed to authenticate token.' })
        if (decoded.id == params.user_id) {
            sign.getUserByEmail(params.email, function (err, returnVal) {
                if (err) throw err
                else {
                    if (returnVal != 0) return res.send({ success: 0, message: "This email is already registered!" })
                    dao.changeEmail(params.user_id, params.email, function (err, returnVal) {
                        if (err) throw err
                        return res.send({ success: 1, message: 'Email has been changed. Verification Email has been sent' })
                    })
                }
            });
        } else res.send({ success: 0, message: 'Invalid User!' })
    }
    sign.verifyToken(token, funcAction)
}

function changeLocation(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    let funcAction = function (err, decoded) {
        if (err) return res.send({ success: -1, message: 'Failed to authenticate token.' })
        if (decoded.id == params.user_id) {
            let location = {
                latitude: params.latitude,
                longitude: params.longitude,
                address: params.address,
                state: params.state
            }
            dao.changeLocation(params.user_id, location, function (err, returnVal) {
                if (err) throw err
                return res.send({ success: 1, message: 'Location has been changed' })
            })
        } else res.send({ success: 0, message: 'Invalid User!' })
    }
    sign.verifyToken(token, funcAction)
}

function getGirlsService(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    let funcAction = function (err, decoded) {
        if (err) return res.send({ success: -1, message: 'Failed to authenticate token.' })
        if (decoded.id == params.user_id) {
            dao.getGirlsService(params.user_id, function (err, returnVal) {
                if (err) throw err
                return res.send({ success: 1, message: 'Retrieved Girls Service.', data: returnVal })
            })
        } else res.send({ success: 0, message: 'Invalid User!' })
    }
    sign.verifyToken(token, funcAction)
}

function saveGirlService(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    let funcAction = function (err, decoded) {
        if (err) return res.send({ success: -1, message: 'Failed to authenticate token.' })
        if (decoded.id == params.user_id) {
            dao.getGirlServiceByUserAndService(params.user_id, params.service_id, function (err, returnVal) {
                if (err) throw err
                if (returnVal == 0) {
                    if (params.value == 0) return res.send({ success: 1, message: "Saved Girl's service." })
                    if (params.value == 1) {
                        dao.addGirlService(params.user_id, params.service_id, function (err, returnVal) {
                            if (err) throw err
                            return res.send({ success: 1, message: "Saved Girl's service." })
                        })
                    }
                } else {
                    if (params.value == 1) return res.send({ success: 1, message: "Saved Girl's service." })
                    if (params.value == 0) {
                        dao.deleteGirlService(returnVal.id_girl_service, function (err, returnVal) {
                            if (err) throw err
                            return res.send({ success: 1, message: "Saved Girl's service." })
                        })
                    }
                }
            })
        } else res.send({ success: 0, message: 'Invalid User!' })
    }
    sign.verifyToken(token, funcAction)
}

function goLive(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    let funcAction = function (err, decoded) {
        if (err) return res.send({ success: -1, message: 'Failed to authenticate token.' })
        if (decoded.id == params.user_id) {
            dao.goLive(params.user_id, function (err, returnVal) {
                if (err) throw err
                return res.send({ success: 1, message: "Successfully Go Live!" })
            })
        } else res.send({ success: 0, message: 'Invalid User!' })
    }
    sign.verifyToken(token, funcAction)
}

function uploadProfileImage(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    let funcAction = function (err, decoded) {
        if (err) return res.send({ success: -1, message: 'Failed to authenticate token.' })
        if (decoded.id == params.user_id) {
            let file = req.file.path.replace('tempImages', 'images/profile')
            fs.rename(req.file.path, file, function (err) {
                if (err) throw err
                else {
                    async.parallel([
                        function (callback) {
                            dao.getProfileImageByUserId(params.user_id, function (err, returnVal) {
                                if (err) callback(err)
                                else {
                                    let originFile = __dirname + '/../images/profile/' + returnVal.imgurl
                                    fs.unlink(originFile, function(error) {
                                        if (error) callback(err)
                                        else callback(null)
                                    });
                                }
                            })
                        }, function (callback) {
                            callback(null)
                        }
                    ], function (err, result) {
                        if (err) throw err
                        dao.updateUserImage(params.user_id, req.file.filename, params.imgcode, function(err, returnVal) {
                            if (err) throw err
                            else res.send({ success: 1, message: "Successfully uploaded the file." }) 
                        })
                    })
                } 
            });
        } else res.send({ success: 0, message: 'Invalid User!' })
    }
    sign.verifyToken(token, funcAction)
}

function updateImageCode(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    let funcAction = function (err, decoded) {
        if (err) return res.send({ success: -1, message: 'Failed to authenticate token.' })
        if (decoded.id == params.user_id) {
            dao.updateUserImageCode(params.user_id, params.imgcode, function (err, returnVal) {
                if (err) throw err
                return res.send({ success: 1, message: "Successfully Updated ImageCode" })
            })
        } else res.send({ success: 0, message: 'Invalid User!' })
    }
    sign.verifyToken(token, funcAction)
}

function uploadGallery(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    let funcAction = function (err, decoded) {
        if (err) return res.send({ success: -1, message: 'Failed to authenticate token.' })
        if (decoded.id == params.user_id) {
            let file = req.file.path.replace('tempImages', 'images/gallery')
            fs.rename(req.file.path, file, function (err) {
                if (err) throw err
                else {
                    dao.addGallery(params.user_id, req.file.filename, function(err, returnVal) {
                        if (err) throw err
                        else res.send({ success: 1, message: "Successfully uploaded the file." }) 
                    })
                } 
            });
        } else res.send({ success: 0, message: 'Invalid User!' })
    }
    sign.verifyToken(token, funcAction)
}

function deleteGallery(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    let funcAction = function (err, decoded) {
        if (err) return res.send({ success: -1, message: 'Failed to authenticate token.' })
        if (decoded.id == params.user_id) {
            dao.getGalleryData(params.gallery_id, function (err, returnVal) {
                if (err) throw err
                else {
                    async.parallel([
                        function (callback) {
                            let originFile = __dirname + '/../images/gallery/' + returnVal.imgurl
                            if (fs.existsSync(originFile)) {
                                fs.unlink(originFile, function(error) {
                                    if (error) callback(error)
                                    else callback(null)
                                })
                            } else callback(null)
                        }, function (callback) {
                            dao.deleteGallery(params.gallery_id, function (error, returnVal) {
                                if (error) callback(error)
                                else callback(null) 
                            })
                        }
                    ], function (err) {
                        if (err) throw err
                        else res.send({ success: 1, message: "Successfully removed the gallery." }) 
                    })
                }
            })
        } else res.send({ success: 0, message: 'Invalid User!' })
    }
    sign.verifyToken(token, funcAction)
}

function getLiveStatus(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    let funcAction = function (err, decoded) {
        if (err) return res.send({ success: -1, message: 'Failed to authenticate token.' })
        if (decoded.id == params.user_id) {
            dao.getLiveStatusByUser(params.user_id, function(err, returnVal) {
                if (err) throw err
                else if (!returnVal) return res.send({ success: -1, message: 'Failed to get data' })
                else res.send({ success: 1, message: "Retrieved live status", data: returnVal }) 
            })
        } else res.send({ success: 0, message: 'Invalid User!' })
    }
    sign.verifyToken(token, funcAction)
}

exports.getMyProfileDetails = getMyProfileDetails
exports.getWorkHours = getWorkHours
exports.getProfileImage = getProfileImage
exports.getAdminFields = getAdminFields
exports.getOtherContacts = getOtherContacts
exports.completeProfile = completeProfile
exports.changeName = changeName
exports.changeEmail = changeEmail
exports.changeLocation = changeLocation
exports.getGirlsService = getGirlsService
exports.saveGirlService = saveGirlService
exports.goLive = goLive
exports.uploadProfileImage = uploadProfileImage
exports.updateImageCode = updateImageCode
exports.uploadGallery = uploadGallery
exports.deleteGallery = deleteGallery
exports.getLiveStatus = getLiveStatus