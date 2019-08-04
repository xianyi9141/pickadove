const db = require('../utils/mysql_connector.js')
const sign = require('./sign.js')
const signManager = require('../controller/sign.js')

function getLoggedinUserInfoById(user_id, callback) {
    db.query('SELECT * FROM tbl_user where id_user=?', user_id, function (error, results, fields) {
        if (error) callback(err, null)
        else callback(null, results[0])
    })
}

function getLocationDetailsById(location_id, callback) {
    let selectQuery = "SELECT * FROM tbl_location where id_location=?"
    let query = db.format(selectQuery, location_id)
    db.query(query, function (err, results, fields) {
        if (err) callback(err, null)
        else {
            if (results.length == 0) callback(null, 0)
            else callback(null, results[0])
        }
    })
}

function getWorkHoursByUserId(user_id, callback) {
    let selectQuery = "SELECT * FROM tbl_workhours where id_user=?"
    let query = db.format(selectQuery, user_id)
    db.query(query, function (err, results, fields) {
        if (err) callback(err, null)
        else {
            // if (results.length == 0) callback(null, 0)
            callback(null, results)
        }
    })
}

function saveWorkHours(user_id, workHours, callback) {
    let deleteQuery = "DELETE FROM tbl_workhours WHERE id_user = '" + user_id + "'"
    db.query(deleteQuery, function (err, results, fields) {
        if (err) callback(err, null)
        else {
            let values = []
            for (let i = 0; i < workHours.length; i++) {
                let value = []
                let workhour = workHours[i]
                value.push(user_id)
                value.push(workhour.day)
                value.push(workhour.from)
                value.push(workhour.to)
                value.push(workhour.isPmFrom)
                value.push(workhour.isPmTo)
                values.push(value)
            }
            let insertQuery = "INSERT INTO tbl_workhours (id_user, w_day, w_from, w_to, isPmFrom, isPmTo) VALUES ?"
            db.query(insertQuery, [values], function (err, results, fields) {
                if (err) callback(err, null)
                else callback(null, true)
            })
        }
    })
}

function saveAdminFields(user_id, adminFields, callback) {
    let deleteQuery = "DELETE FROM tbl_girl_adminfield WHERE id_user = '" + user_id + "'"
    db.query(deleteQuery, function (err, results, fields) {
        if (err) callback(err, null)
        else {
            let values = []
            for (let i = 0; i < adminFields.length; i++) {
                let value = []
                let adminField = adminFields[i]
                value.push(user_id)
                value.push(adminField.id_admin)
                if (adminField.field_type == 0) {
                    value.push(adminField.content)
                    value.push(null)
                } else {
                    value.push(null)
                    value.push(adminField.content)
                }
                values.push(value)
            }
            let insertQuery = "INSERT INTO tbl_girl_adminfield (id_user, id_adminfield, content_entry, content_dropdown) VALUES ?"
            db.query(insertQuery, [values], function (err, results, fields) {
                if (err) callback(err, null)
                else callback(null, true)
            })
        }
    })
}

function saveOtherContacts(user_id, otherContacts, callback) {
    let deleteQuery = "DELETE FROM tbl_girl_other_contact WHERE id_user = '" + user_id + "'"
    db.query(deleteQuery, function (err, results, fields) {
        if (err) callback(err, null)
        else {
            let values = []
            for (let i = 0; i < otherContacts.length; i++) {
                let value = []
                let contact = otherContacts[i]
                value.push(user_id)
                value.push(contact.id_othercontact)
                value.push(contact.content)
                values.push(value)
            }
            let insertQuery = "INSERT INTO tbl_girl_other_contact (id_user, id_othercontact, content) VALUES ?"
            db.query(insertQuery, [values], function (err, results, fields) {
                if (err) callback(err, null)
                else callback(null, true)
            })
        }
    })
}

function getAdminFieldsData(user_id, callback) {
    let selectQuery = "select ta.id_adminfield as id_admin, field_type, label, tga.id_girl_adminfield as id_content, tga.content_entry, tga.content_dropdown"
        + " from tbl_adminfield ta left join "
        + "(select * from tbl_girl_adminfield where id_user = ?) tga on ta.id_adminfield = tga.id_adminfield"
        + " order by ta.id_adminfield asc"
    let query = db.format(selectQuery, user_id)
    db.query(query, function (err, results, fields) {
        if (err) callback(err, null)
        else {
            callback(null, results)
        }
    })
}

function getOtherContactsData(user_id, callback) {
    let selectQuery = "select too.id_othercontact, too.icon, too.label, tgo.content"
        + " from tbl_othercontact too left join "
        + "(select * from tbl_girl_other_contact where id_user = ?) tgo on too.id_othercontact = tgo.id_othercontact"
        + " order by too.id_othercontact"
    let query = db.format(selectQuery, user_id)
    db.query(query, function (err, results, fields) {
        if (err) callback(err, null)
        else {
            callback(null, results)
        }
    })
}

function getProfileImageByUserId(user_id, callback) {
    let selectQuery = "SELECT imgurl, imgcode FROM tbl_user where id_user=?"
    let query = db.format(selectQuery, user_id)
    db.query(query, function (err, results, fields) {
        if (err) callback(err, null)
        else {
            if (results.length == 0) callback(null, null)
            else callback(null, results[0])
        }
    })
}

function getAdminFields(callback) {
    let query = "SELECT *, ta.id_adminfield as id_admin FROM tbl_adminfield ta left join tbl_dropdownfield td on ta.id_adminfield = td.id_adminfield order by ta.id_adminfield, td.id_dropdownfield"
    db.query(query, function (err, results, fields) {
        if (err) callback(err, null)
        else {
            callback(null, results)
        }
    })
}

function getOtherContacts(callback) {
    let query = "select id_othercontact, icon, label from tbl_othercontact order by id_othercontact"
    db.query(query, function (err, results, fields) {
        if (err) callback(err, null)
        else {
            callback(null, results)
        }
    })
}

function saveProfile(paramas, callback) {
    let updateQuery = "UPDATE ?? SET ?? = ?, ?? = ?, ?? = ?, ?? = ?, ?? = ?, ?? = ?, status = 2 WHERE ?? = ?"
    let query = db.format(updateQuery, ["tbl_user", "birthday", paramas.birthday, "height", paramas.height, "contact_mobile", paramas.mobile, "contact_wechat", paramas.wechat, "contact_whatsapp", paramas.whatsapp, "contact_preferred", paramas.preferred, "id_user", paramas.user_id])
    db.query(query, function (err, results, fields) {
        if (err) callback(err, null)
        else {
            callback(null, true)
        }
    })
}

function changeName(user_id, firstname, lastname, callback) {
    let updateQuery = "UPDATE ?? SET ?? = ?, ?? = ? WHERE ?? = ?"
    let query = db.format(updateQuery, ["tbl_user", "firstname", firstname, "lastname", lastname, "id_user", user_id])
    db.query(query, function (err, results, fields) {
        if (err) callback(err, null)
        else {
            callback(null, true)
        }
    })
}

function changeEmail(user_id, email, callback) {
    let updateQuery = "UPDATE ?? SET ?? = ? WHERE ?? = ?"
    let query = db.format(updateQuery, ["tbl_user", "email", email, "id_user", user_id])
    db.query(query, function (err, results, fields) {
        if (err) callback(err, null)
        else {
            sign.changeUserStatus(user_id, 0, function (err, returnValue) {
                if (err) callback(err, null)
                else {
                    let verificationCode = Math.floor(100000 + Math.random() * 900000)
                    sign.addVerificationCode(user_id, verificationCode, function (err, insertId) {
                        if (err) callback(err, null)
                        else {
                            // signManager.sendVerificationEmail(email, verificationCode, function (err) {
                            // if (err) callback(err, null)
                            callback(null, true)
                            // })
                        }
                    })
                }
            })
        }
    })
}

function updateLocationinfo(location_id, location, callback) {
    let updateQuery = "UPDATE ?? SET ?? = ?, ?? = ?, ?? = ?, ?? = ? WHERE ?? = ?"
    let query = db.format(updateQuery, ["tbl_location", "address", location.address, "state", location.state, "latitude", location.latitude, "longitude", location.longitude, "id_location", location_id])
    db.query(query, function (err, results, fields) {
        if (err) callback(err, null)
        else {
            callback(null, true)
        }
    })
}

function changeLocation(user_id, location, callback) {
    sign.getUserById(user_id, function (err, returnVal) {
        if (err) callback(err)
        else {
            if (returnVal == 0) callback(err)
            else {
                if (returnVal.id_location) {
                    updateLocationinfo(returnVal.id_location, location, function(err, returnValue) {
                        if (err) callback(err, null)
                        else {
                            callback(null, returnVal.id_location)
                        }
                    })
                } else {
                    sign.addLocation(location, function(err, locationId) {
                        if (err) callback(err, null)
                        else {
                            sign.updateLocationId(user_id, locationId, function(err, returnValue) {
                                if (err) callback(err, null)
                                else {
                                    callback(null, locationId)
                                }
                            })
                        }
                    })
                }
            }
        }
    })
}

function getGirlsService(user_id, callback) {
    let selectQuery = "select ts.id_services, label, (case when tgs.id_girl_service is null then 0 else 1 end) as value from tbl_service ts"
        + " left join (select * from tbl_girl_service where id_user = ?) tgs on ts.id_services = tgs.id_service"
        + " where ts.active = 1"
        + " order by ts.id_services"
    let query = db.format(selectQuery, user_id)
    db.query(query, function (err, results, fields) {
        if (err) callback(err, null)
        else {
            callback(null, results)
        }
    })
}

function getGirlServiceByUserAndService(user_id, service_id, callback) {
    let selectQuery = "SELECT * FROM tbl_girl_service where id_user=? and id_service=?";
    let query = db.format(selectQuery, [user_id, service_id])
    db.query(query, function (err, results, fields) {
        if (err) callback(err, null)
        else {
            if (results.length == 0) callback(null, 0)
            else callback(null, results[0])
        }
    })
}

function addGirlService(user_id, service_id, callback) {
    let insertQuery = db.format("INSERT INTO tbl_girl_service (??, ??) VALUES (?,?)", ['id_user', 'id_service', user_id, service_id])
    db.query(insertQuery, function (err, results, fields) {
        if (err) callback(err, null)
        else callback(null, results.insertId)
    })
}

function deleteGirlService(girl_service_id, callback) {
    let insertQuery = db.format("DELETE FROM tbl_girl_service WHERE id_girl_service=?", girl_service_id)
    db.query(insertQuery, function (err, results, fields) {
        if (err) callback(err, null)
        else callback(null, true)
    })
}

function goLive(user_id, callback) {
    let updateQuery = "UPDATE tbl_user SET islive = 1 WHERE ?? = ?"
    let query = db.format(updateQuery, ["id_user", user_id])
    db.query(query, function (err, results, fields) {
        if (err) callback(err, null)
        else {
            callback(null, true)
        }
    })
}

function updateUserImage(user_id, filename, imgcode, callback) {
    let updateQuery = "UPDATE tbl_user SET imgurl = ?, imgcode = ? WHERE id_user = ?"
    let query = db.format(updateQuery, [filename, imgcode, user_id])
    db.query(query, function (err, results, fields) {
        if (err) callback(err, null)
        else {
            callback(null, true)
        }
    })
}

function addGallery(user_id, filename, callback) {
    let deleteQuery = db.format("INSERT INTO tbl_gallery (??, ??) VALUES (?,?)", ['id_user', 'imgurl', user_id, filename])
    db.query(deleteQuery, function (err, results, fields) {
        if (err) callback(err, null)
        else callback(null, results.insertId)
    })
}

function getGalleryData(gallery_id, callback) {
    let selectQuery = "SELECT * FROM tbl_gallery where id_gallery=?"
    let query = db.format(selectQuery, gallery_id)
    db.query(query, function (err, results, fields) {
        if (err) callback(err, null)
        else {
            if (results.length == 0) callback(null, null)
            else callback(null, results[0])
        }
    })
}

function deleteGallery(gallery_id, callback) {
    let deleteQuery = db.format("DELETE FROM tbl_gallery WHERE id_gallery=?", gallery_id)
    db.query(deleteQuery, function (err, results, fields) {
        if (err) callback(err, null)
        else callback(null, true)
    })
}

function updateUserImageCode(user_id, imgcode, callback) {
    let updateQuery = "UPDATE tbl_user SET imgcode = ? WHERE id_user = ?"
    let query = db.format(updateQuery, [imgcode, user_id])
    db.query(query, function (err, results, fields) {
        if (err) callback(err, null)
        else {
            callback(null, true)
        }
    })
}

function getLiveStatusByUser(user_id, callback) {
    let selectQuery = "SELECT islive FROM tbl_user where id_user=?"
    let query = db.format(selectQuery, user_id)
    db.query(query, function (err, results, fields) {
        if (err) callback(err, null)
        else {
            if (results.length == 0) callback(null, null)
            else callback(null, results[0])
        }
    })
}

exports.getLoggedinUserInfoById = getLoggedinUserInfoById
exports.getLocationDetailsById = getLocationDetailsById
exports.getWorkHoursByUserId = getWorkHoursByUserId
exports.getProfileImageByUserId = getProfileImageByUserId
exports.getGalleryData = getGalleryData
exports.getAdminFields = getAdminFields
exports.getOtherContacts = getOtherContacts
exports.getAdminFieldsData = getAdminFieldsData
exports.getOtherContactsData = getOtherContactsData
exports.saveProfile = saveProfile
exports.saveWorkHours = saveWorkHours
exports.saveAdminFields = saveAdminFields
exports.saveOtherContacts = saveOtherContacts
exports.changeName = changeName
exports.changeEmail = changeEmail
exports.changeLocation = changeLocation
exports.getGirlsService = getGirlsService
exports.getGirlServiceByUserAndService = getGirlServiceByUserAndService
exports.addGirlService = addGirlService
exports.deleteGirlService = deleteGirlService
exports.goLive = goLive
exports.updateUserImage = updateUserImage
exports.updateUserImageCode = updateUserImageCode
exports.addGallery = addGallery
exports.deleteGallery = deleteGallery
exports.getLiveStatusByUser = getLiveStatusByUser