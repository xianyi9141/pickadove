const db = require('../utils/mysql_connector.js');

function getProfileList(params, callback) {
    let selectQuery = "SELECT floor(datediff(now(), birthday) / 365) as age, tu.id_user, email, firstname, lastname," +
        " imgurl, tu.id_location, height, isVerified, isFeatured, address," +
        " COUNT( CASE WHEN c.commenttype = 0 THEN 1 END ) AS comments, COUNT( CASE WHEN c.commenttype = 1 THEN 1 END ) AS complaints" +
        " from tbl_user tu" +
        " left join tbl_location tl on tu.id_location = tl.id_location" +
        " left JOIN tbl_comment c on tu.id_user = c.id_commented_user " +
        " where usertype = 1 and tu.status = 2 and islive = 1" +
        " and tu.id_user != " + params.user_id
    if (params.state) selectQuery += " and tl.state = '" + params.state + "'"
    if (params.name) selectQuery += " and (firstname like '%" + params.name + "%' || lastname like '%" + params.name + "%')"
    if (params.ageFrom) selectQuery += " and datediff(now(), birthday) / 365 >= " + params.ageFrom
    if (params.ageTo) selectQuery += " and datediff(now(), birthday) / 365 <= " + params.ageTo
    if (params.heightFrom) selectQuery += " and height >= " + params.heightFrom
    if (params.heightTo) selectQuery += " and height <= " + params.heightTo
    if (params.location) selectQuery += " and address like '%" + params.location + "%'"
    if (params.service) {
        let services = params.service.join(", ")
        if (params.service.length)
            selectQuery += " and tu.id_user in (select distinct(id_user) users from tbl_girl_service where id_service in (" + services + "))"
    }
    selectQuery += " GROUP BY tu.id_user"
    db.query(selectQuery, function (err, results, fields) {
        if (err) callback(err, null)
        else callback(null, results)
    })
}

function getTopProfile(params, callback) {
    let selectQuery = "SELECT floor(datediff(now(), birthday) / 365) as age, tu.id_user, email, firstname, lastname," +
        " imgurl, tu.id_location, height, isVerified, isFeatured, address, contact_mobile, " +
        " COUNT( CASE WHEN c.commenttype = 0 THEN 1 END ) AS comments, COUNT( CASE WHEN c.commenttype = 1 THEN 1 END ) AS complaints" +
        " from tbl_user tu" +
        " left join tbl_location tl on tu.id_location = tl.id_location" +
        " left JOIN tbl_comment c on tu.id_user = c.id_commented_user " +
        " where usertype = 1 and tu.status = 2 and islive = 1" +
        " and isFeatured = 1 and isVerified = 1"
    " and tu.id_user != " + params.user_id
    if (params.state) selectQuery += " and tl.state = '" + params.state + "'"
    if (params.name) selectQuery += " and (firstname like '%" + params.name + "%' || lastname like '%" + params.name + "%')"
    if (params.ageFrom) selectQuery += " and datediff(now(), birthday) / 365 >= " + params.ageFrom
    if (params.ageTo) selectQuery += " and datediff(now(), birthday) / 365 <= " + params.ageTo
    if (params.heightFrom) selectQuery += " and height >= " + params.heightFrom
    if (params.heightTo) selectQuery += " and height <= " + params.heightTo
    if (params.location) selectQuery += " and address like '%" + params.location + "%'"
    if (params.service) {
        let services = params.service.join(", ")
        if (params.service.length)
            selectQuery += " and tu.id_user in (select distinct(id_user) users from tbl_girl_service where id_service in (" + services + "))"
    }
    selectQuery += " GROUP BY tu.id_user order by rand() limit 1"
    db.query(selectQuery, function (err, results, fields) {
        if (err) callback(err, null)
        else callback(null, results[0])
    })
}

function getLastCommentForUser(user_id, callback) {
    let selectQuery = "select tc.id_comment, tc.id_user, tc.`comment`, tc.commenttype, tc.created_at, tu.firstname, tu.lastname"
        + " from tbl_comment tc left join tbl_user tu on tc.id_user = tu.id_user"
        + " where id_commented_user = " + user_id + " order by created_at desc limit 1"
    db.query(selectQuery, function (err, results, fields) {
        if (err) callback(err, null)
        else callback(null, results[0])
    })
}

function getProfileDetailsById(view_id, callback) {
    let selectQuery = "select id_user, email, firstname, lastname, tu.id_location, birthday, height, imgurl, description, contact_mobile, contact_wechat, contact_whatsapp, contact_preferred, isVerified, isFeatured" +
        " ,tl.address, tl.state, tl.latitude, tl.longitude" +
        " from tbl_user tu left join tbl_location tl on tu.id_location = tl.id_location" +
        " where id_user = " + view_id
    db.query(selectQuery, function (err, results, fields) {
        if (err) callback(err, null)
        else callback(null, results[0])
    })
}

function getGalleriesById(user_id, callback) {
    let selectQuery = "select id_gallery, imgurl, islock from tbl_gallery where id_user = ?"
    let query = db.format(selectQuery, user_id)
    db.query(query, function (err, results, fields) {
        if (err) callback(err, null);
        else callback(null, results);
    });
}

function viewProfile(user_id, view_id, callback) {
    let insertQuery = db.format("INSERT INTO tbl_profileview (??, ??) VALUES (?,?)", ['id_user', 'viewed_user_id', user_id, view_id])
    db.query(insertQuery, function (err, results, fields) {
        if (err) callback(err, null)
        else callback(null, results.insertId)
    })
}

function getAdminFieldsData(user_id, callback) {
    let selectQuery = "select ta.id_adminfield as id_admin, field_type, label, tga.id_girl_adminfield as id_content, tga.content_entry, tga.content as content_combo"
        + " from tbl_adminfield ta left join "
        + "(select tgg.id_girl_adminfield, tgg.content_entry, tgg.content_dropdown, td.content, tgg.id_adminfield from tbl_girl_adminfield tgg "
        + " left join tbl_dropdownfield td on tgg.content_dropdown = td.id_dropdownfield and tgg.id_adminfield = td.id_adminfield where id_user = ?) tga"
        + " on ta.id_adminfield = tga.id_adminfield"
        + " order by ta.id_adminfield asc"
    let query = db.format(selectQuery, user_id)
    db.query(query, function (err, results, fields) {
        if (err) callback(err, null)
        else {
            callback(null, results)
        }
    })
}

function getHistoryByUserId(user_id, callback) {
    let selectQuery = "select viewed_user_id as id_user, max(id_profileview) as history_id, tu.firstname,  tu.lastname, floor(datediff(now(), tu.birthday) / 365) as age, tu.imgurl, tl.address" +
        " from tbl_profileview tp left join tbl_user tu on tp.viewed_user_id = tu.id_user" +
        " left join tbl_location tl on tu.id_location = tl.id_location" +
        " where tp.id_user = " + user_id + " group by viewed_user_id" +
        " order by max(id_profileview) desc limit 5"
    db.query(selectQuery, function (err, results, fields) {
        if (err) callback(err, null)
        else callback(null, results)
    })
}

function getRevealedCount(view_id, callback) {
    let selectQuery = "select * from tbl_contactreveal where id_user = " + view_id
    db.query(selectQuery, function (err, results, fields) {
        if (err) callback(err, null)
        else callback(null, results[0])
    })
}

function insertRevealedCount(view_id, revealednum, callback) {
    let insertQuery = db.format("INSERT INTO tbl_contactreveal (??, ??) VALUES (?,?)", ['id_user', 'revealednum', view_id, revealednum])
    db.query(insertQuery, function (err, results, fields) {
        if (err) callback(err, null)
        else callback(null, results.insertId)
    })
}

function updateRevealedCount(view_id, revealednum, callback) {
    let updateQuery = "update tbl_contactreveal set revealednum = " + revealednum + " where id_user = " + view_id
    db.query(updateQuery, function (err, results, fields) {
        if (err) callback(err, null)
        else callback(null, true)
    })
}

function getGalleryCount(gallery_id, callback) {
    let selectQuery = "select * from tbl_galleryview where id_gallery = " + gallery_id
    db.query(selectQuery, function (err, results, fields) {
        if (err) callback(err, null)
        else callback(null, results[0])
    })
}

function insertGalleryCount(gallery_id, viewednum, callback) {
    let insertQuery = db.format("INSERT INTO tbl_galleryview (??, ??) VALUES (?,?)", ['id_gallery', 'viewcounts', gallery_id, viewednum])
    db.query(insertQuery, function (err, results, fields) {
        if (err) callback(err, null)
        else callback(null, results.insertId)
    })
}

function updateGalleryCount(gallery_id, viewednum, callback) {
    let updateQuery = "update tbl_galleryview set viewcounts = " + viewednum + " where id_gallery = " + gallery_id
    db.query(updateQuery, function (err, results, fields) {
        if (err) callback(err, null)
        else callback(null, true)
    })
}

function likeGallery(user_id, gallery_id, callback) {
    let insertQuery = db.format("INSERT INTO tbl_gallerylike (??, ??) VALUES (?,?)", ['id_user', 'id_gallery', user_id, gallery_id])
    db.query(insertQuery, function (err, results, fields) {
        if (err) callback(err, null)
        else callback(null, results.insertId)
    })
}

function dislikeGallery(user_id, gallery_id, callback) {
    let insertQuery = db.format("DELETE FROM tbl_gallerylike where id_user = ? and id_gallery=?", [user_id, gallery_id])
    db.query(insertQuery, function (err, results, fields) {
        if (err) callback(err, null)
        else callback(null, true)
    })
}

function getComments(commented_user, parentid, comment_type, callback) {
    let checkParent = ""
    if (parentid == 0) checkParent = " is NULL"
    else checkParent = " = " + parentid
    let selectQuery = "select id_comment, tc.id_user, comment, tc.created_at, firstname, lastname, email from tbl_comment tc" +
        " left join tbl_user tu on tc.id_user = tu.id_user" +
        " where parentid" + checkParent + " and commenttype = " + comment_type +
        " and id_commented_user = " + commented_user +
        " order by tc.created_at"
    db.query(selectQuery, function (err, results, fields) {
        if (err) callback(err, null)
        else callback(null, results)
    });
}

function getCommentsTest(commented_user) {
    return new Promise((resolve, reject) => {
        let selectQuery = "select id_comment, tc.id_user, comment, tc.created_at, firstname, lastname, email from tbl_comment tc" +
            " left join tbl_user tu on tc.id_user = tu.id_user" +
            " where parentid is NULL and commenttype = 0" +
            " and id_commented_user = " + commented_user +
            " order by tc.created_at"
        db.query(selectQuery, (err, results, fields) => {
            if (err) reject(err)
            else resolve(results)
        })
    })
}

function leaveComment(params, callback) {
    let parentid = null
    if (params.parentid) parentid = params.parentid
    let insertQuery = db.format("INSERT INTO tbl_comment (id_user, id_commented_user, comment, commenttype, parentid) VALUES (?,?,?,?,?)", [params.user_id, params.commented_user, params.comment, params.comment_type, parentid])
    db.query(insertQuery, function (err, results, fields) {
        if (err) callback(err, null)
        else callback(null, results.insertId)
    })
}

function lockGallery(gallery_id, islock, callback) {
    let updateQuery = "update tbl_gallery set islock = " + islock + " where id_gallery = " + gallery_id
    db.query(updateQuery, function (err, results, fields) {
        if (err) callback(err, null)
        else callback(null, true)
    })
}

exports.getProfileList = getProfileList
exports.getTopProfile = getTopProfile
exports.getLastCommentForUser = getLastCommentForUser
exports.getProfileDetailsById = getProfileDetailsById
exports.getGalleriesById = getGalleriesById
exports.viewProfile = viewProfile
exports.getAdminFieldsData = getAdminFieldsData
exports.getHistoryByUserId = getHistoryByUserId
exports.getRevealedCount = getRevealedCount
exports.insertRevealedCount = insertRevealedCount
exports.updateRevealedCount = updateRevealedCount
exports.getGalleryCount = getGalleryCount
exports.insertGalleryCount = insertGalleryCount
exports.updateGalleryCount = updateGalleryCount
exports.likeGallery = likeGallery
exports.dislikeGallery = dislikeGallery
exports.getComments = getComments
exports.getCommentsTest = getCommentsTest
exports.leaveComment = leaveComment
exports.lockGallery = lockGallery