const db = require('../utils/mysql_connector.js')
const bcrypt = require('bcryptjs');

function getAdminUsersCount(callback) {
    let selectQuery = "SELECT count(id_user) as counts, usertype from tbl_user group by usertype"
    db.query(selectQuery, function (err, results, fields) {
        if (err) callback(err, null)
        else callback(null, results)
    })
}

function getAdminProfile(user_id, callback) {
    let selectQuery = "select id_user, email, firstname, lastname from tbl_user where id_user = ?"
    let query = db.format(selectQuery, user_id)
    db.query(query, function (err, results, fields) {
        if (err) callback(err, null)
        else callback(null, results[0])
    })
}

function getAdminUserListByType(user_type, callback) {
    let selectQuery = "select id_user, email, firstname, lastname, state, birthday from tbl_user tu" +
        " left join tbl_location tl on tu.id_location = tl.id_location where usertype = ?"
    let query = db.format(selectQuery, user_type)
    db.query(query, function (err, results, fields) {
        if (err) callback(err, null)
        else callback(null, results)
    })
}

function getAdminsList(callback) {
    let selectQuery = "select id_user, email, firstname, lastname from tbl_user tu where usertype = 2"
    db.query(selectQuery, function (err, results, fields) {
        if (err) callback(err, null)
        else callback(null, results)
    })
}

function changeAdminUserPassword(change_user_id, password, callback) {
    let hashedPassword = bcrypt.hashSync(password, 8)
    let updateQuery = "update tbl_user set password = '" + hashedPassword + "' where id_user = " + change_user_id
    db.query(updateQuery, function (err, results, fields) {
        if (err) callback(err, null)
        else callback(null, true)
    })
}

function insertAdminField(field_type, label, isrequired, callback) {
    let insertQuery = db.format("INSERT INTO tbl_adminfield (field_type, label, isrequired) VALUES (?,?,?)", [field_type, label, isrequired])
    db.query(insertQuery, function (err, results, fields) {
        if (err) callback(err, null)
        else callback(null, results.insertId)
    })
}

function insertAdminDropDownContent(adminFieldId, contents, callback) {
    let values = []
    for (let i = 0; i < contents.length; i++) {
        let value = []
        value.push(adminFieldId)
        value.push(contents[i])
        values.push(value)
    }
    let insertQuery = "INSERT INTO tbl_dropdownfield (id_adminfield, content) VALUES ?"
    db.query(insertQuery, [values], function (err, results, fields) {
        if (err) callback(err, null)
        else callback(null, true)
    })
}

function deleteDropDownContentsByAdminFieldId(adminfeild_id, callback) {
    let deleteQuery = "delete from tbl_dropdownfield where id_adminfield = " + adminfeild_id
    db.query(deleteQuery, function (err, results, fields) {
        if (err) callback(err, null)
        else callback(null, true)
    })
}

function deleteGrildAdminFieldByAdminFieldId(adminfeild_id, callback) {
    let deleteQuery = "delete from tbl_girl_adminfield where id_adminfield = " + adminfeild_id
    db.query(deleteQuery, function (err, results, fields) {
        if (err) callback(err, null)
        else callback(null, true)
    })
}

function deleteAdminFieldById(adminfeild_id, callback) {
    let deleteQuery = "delete from tbl_adminfield where id_adminfield = " + adminfeild_id
    db.query(deleteQuery, function (err, results, fields) {
        if (err) callback(err, null)
        else callback(null, true)
    })
}

function addAdminOtherContact(label, filename, callback) {
    let deleteQuery = db.format("INSERT INTO tbl_othercontact (??, ??) VALUES (?,?)", ['label', 'icon', label, filename])
    db.query(deleteQuery, function (err, results, fields) {
        if (err) callback(err, null)
        else callback(null, results.insertId)
    })
}

function getOtherContactById(othercontact_id, callback) {
    let selectQuery = "SELECT icon, label FROM tbl_othercontact where id_othercontact=?"
    let query = db.format(selectQuery, othercontact_id)
    db.query(query, function (err, results, fields) {
        if (err) callback(err, null)
        else {
            if (results.length == 0) callback(null, null)
            else callback(null, results[0])
        }
    })
}

function updateOtherContact(othercontact_id, label, icon, callback) {
    let setIconPart = ""
    if (icon != null) setIconPart = "icon = '" + icon + "',"
    let updateQuery = "update tbl_othercontact set " + setIconPart + " label = '" + label + "' where id_othercontact = " + othercontact_id
    db.query(updateQuery, function (err, results, fields) {
        if (err) callback(err, null)
        else callback(null, true)
    })
}

function deleteGirlOtherContactByContactId(othercontact_id, callback) {
    let deleteQuery = "delete from tbl_girl_other_contact where id_othercontact = " + othercontact_id
    db.query(deleteQuery, function (err, results, fields) {
        if (err) callback(err, null)
        else callback(null, true)
    })
}

function deleteAdminOtherContactByContactId(othercontact_id, callback) {
    let deleteQuery = "delete from tbl_othercontact where id_othercontact = " + othercontact_id
    db.query(deleteQuery, function (err, results, fields) {
        if (err) callback(err, null)
        else callback(null, true)
    })
}

exports.getAdminUsersCount = getAdminUsersCount
exports.getAdminProfile = getAdminProfile
exports.getAdminUserListByType = getAdminUserListByType
exports.getAdminsList = getAdminsList
exports.changeAdminUserPassword = changeAdminUserPassword
exports.insertAdminField = insertAdminField
exports.insertAdminDropDownContent = insertAdminDropDownContent
exports.deleteDropDownContentsByAdminFieldId = deleteDropDownContentsByAdminFieldId
exports.deleteGrildAdminFieldByAdminFieldId = deleteGrildAdminFieldByAdminFieldId
exports.deleteAdminFieldById = deleteAdminFieldById
exports.addAdminOtherContact = addAdminOtherContact
exports.getOtherContactById = getOtherContactById
exports.updateOtherContact = updateOtherContact
exports.deleteGirlOtherContactByContactId = deleteGirlOtherContactByContactId
exports.deleteAdminOtherContactByContactId = deleteAdminOtherContactByContactId