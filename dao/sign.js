const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../utils/mysql_connector.js');
const config = require('../config/config.js');

// modules
function getUserByEmail(email, callback) {
    let selectQuery = "SELECT * FROM tbl_user where email=?";
    let query = db.format(selectQuery, email);
    db.query(query, function (err, results, fields) {
        if (err) callback(err, null);
        else {
            if (results.length == 0) callback(null, 0);
            else callback(null, results[0]);
        }
    });
}

function getUserById(user_id, callback) {
    let selectQuery = "SELECT * FROM tbl_user where id_user=?";
    let query = db.format(selectQuery, user_id);
    db.query(query, function (err, results, fields) {
        if (err) callback(err, null);
        else {
            if (results.length == 0) callback(null, 0);
            else callback(null, results[0]);
        }
    });
}

function updateLocationId(user_id, location_id, callback) {
    let updateQuery = "UPDATE ?? SET ?? = ? WHERE ?? = ?"
    let query = db.format(updateQuery,["tbl_user","id_location", location_id, "id_user",user_id])
    db.query(query, function(err, results, fields) {
        if (err) callback(err, null)
        else {
            callback(null, true)
        }
    })
}

function addLocation(location, callback) {
    let insertQuery = "INSERT INTO ?? (??,??, ??, ??) VALUES (?,?,?,?)"
    let query = db.format(insertQuery, ["tbl_location", "address", "state", "latitude", "longitude", location.address, location.state, location.latitude, location.longitude])
    db.query(query, function(err, results, fields) {
        if (err) callback(err, null)
        else {
            callback(null, results.insertId)
        }
    })
}

function updateLastLogIn(user_id, callback) {
    let updateQuery = "UPDATE ?? SET ?? = NOW() WHERE ?? = ?"
    let query = db.format(updateQuery,["tbl_user","date_lastlogin","id_user",user_id])
    db.query(query, function(err, results, fields) {
        if (err) callback(err, null)
        else {
            callback(null, true)
        }
    })
}

function registerUser(email, password, firstname, lastname, usertype, location, callback) {
    let hashedPassword = bcrypt.hashSync(password, 8);
    let insertQuery = "INSERT INTO ?? (??,??, ??, ??, ??) VALUES (?,?,?,?,?)";
    let query = db.format(insertQuery, ["tbl_user", "email", "password", "firstname", "lastname", "usertype", email, hashedPassword, firstname, lastname, usertype]);
    db.query(query, function (err, results, fields) {
        if (err) callback(err, null);
        else {
            if (location) {
                addLocation(location, function(err, locationId) {
                    if (err) callback(err, null)
                    else {
                        updateLocationId(results.insertId, locationId, function(err, returnVal) {
                            if (err) callback(err, null)
                            else {
                                callback(null, results.insertId)
                            }
                        })
                    }
                })
            } else {
                callback(null, results.insertId);
            }
        }
    });
}

function addVerificationCode(user_id, code, callback) {
    let deleteQuery = "DELETE FROM tbl_verification WHERE id_user = '" + user_id + "'; DROP EVENT if exists expireVerification;"
    db.query(deleteQuery, function (err, results, fields) {
        if (err) callback(err, null)
        else {
            let insertQuery = db.format("INSERT INTO tbl_verification (??, ??) VALUES (?,?)", ['id_user', 'code', user_id, code])
            db.query(insertQuery, function (err, results, fields) {
                if (err) callback(err, null)
                else {
                    let eventQuery = "CREATE EVENT IF NOT EXISTS expireVerification ON SCHEDULE AT CURRENT_TIMESTAMP + INTERVAL  1 MINUTE DO DELETE FROM tbl_verification WHERE created_at <= DATE_SUB(NOW(), INTERVAL 1 MINUTE);"
                    db.query(eventQuery, function (err, results1, fields) {
                        if (err) callback(err, null)
                        else {
                            callback(null, results.insertId)
                        }
                    })
                }
            })
        }
    })
}

function isVerificationCodeExisting(user_id, code, callback) {
    let selectQuery = "SELECT * FROM tbl_verification where id_user=? and code=?"
    let query = db.format(selectQuery, [user_id, code]);
    db.query(query, function (err, results, fields) {
        if (err) callback(err, null);
        else {
            if (results.length == 0) callback(null, 0);
            else callback(null, 1);
        }
    });
}

function addResetPasswordKey(user_id, email, callback) {
    let deleteQuery = "DELETE FROM tbl_forgot WHERE id_user = '" + user_id + "'; DROP EVENT if exists expireResetKey;"
    db.query(deleteQuery, function (err, results, fields) {
        if (err) callback(err, null)
        else {
            let reset_key = bcrypt.hashSync(email, 8)
            reset_key = reset_key.replace(/[^a-zA-Z0-9]/g, '')
            let insertQuery = db.format("INSERT INTO tbl_forgot (??, ??) VALUES (?,?)", ['id_user', 'reset_key', user_id, reset_key])
            db.query(insertQuery, function (err, results, fields) {
                if (err) callback(err, null)
                else {
                    let eventQuery = "CREATE EVENT IF NOT EXISTS expireResetKey ON SCHEDULE AT CURRENT_TIMESTAMP + INTERVAL 5 MINUTE DO DELETE FROM tbl_forgot WHERE created_at <= DATE_SUB(NOW(), INTERVAL 5 MINUTE);"
                    db.query(eventQuery, function (err, results1, fields) {
                        if (err) callback(err, null)
                        else {
                            callback(null, reset_key)
                        }
                    })
                }
            })
        }
    })
}

function getUserIdByResetKey(reset_key, callback) {
    let selectQuery = "SELECT * FROM tbl_forgot where reset_key=?"
    let query = db.format(selectQuery, reset_key)
    db.query(query, function (err, results, fields) {
        if (err) callback(err, null);
        else {
            if (results.length == 0) callback(null, 0);
            else callback(null, results[0].id_user)
        }
    });
}

function changeUserStatus(user_id, status, callback) {
    let updateQuery = "UPDATE ?? SET ?? = ? WHERE ?? = ?"
    let query = db.format(updateQuery,["tbl_user","status",status,"id_user",user_id])
    db.query(query, function(err, results, fields) {
        if (err) callback(err, null)
        else {
            callback(null, true)
        }
    })
}

function resetPassword(user_id, password, callback) {
    let hashedPassword = bcrypt.hashSync(password, 8)
    let updateQuery = "UPDATE ?? SET ?? = ? WHERE ?? = ?"
    let query = db.format(updateQuery,["tbl_user","password",hashedPassword,"id_user",user_id])
    db.query(query, function(err, results, fields) {
        if (err) callback(err, null)
        else {
            callback(null, true)
        }
    })
}

function getLoggedinUserInfoById(user_id, callback) {
    db.query('SELECT * FROM tbl_user where id_user=?', user_id, function (error, results, fields) {
        if (error) callback(err, null);
        else callback(null, results[0]);
    });
};

function getTokenFromUserId(user_id) {
    let token = jwt.sign({ id: user_id }, config.token_key, {
        expiresIn: 86400 // expires in 24 hours
    });
    return token;
}

function verifyToken(token, callback) {
    jwt.verify(token, config.token_key, function (err, decoded) {
        if (err) callback(err, null);
        else callback(null, decoded);
    });
}

function assyncVerifyToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, config.token_key, (err, decoded) => {
            if (err) reject(err)
            else resolve(decoded)
        })
    })
}

exports.getUserByEmail = getUserByEmail;
exports.getUserById = getUserById;
exports.updateLastLogIn = updateLastLogIn;
exports.registerUser = registerUser;
exports.getLoggedinUserInfoById = getLoggedinUserInfoById;
exports.getTokenFromUserId = getTokenFromUserId;
exports.verifyToken = verifyToken;
exports.assyncVerifyToken = assyncVerifyToken;
exports.addVerificationCode = addVerificationCode;
exports.addResetPasswordKey = addResetPasswordKey;
exports.isVerificationCodeExisting = isVerificationCodeExisting;
exports.getUserIdByResetKey = getUserIdByResetKey;
exports.resetPassword = resetPassword;
exports.changeUserStatus = changeUserStatus;
exports.addLocation = addLocation;
exports.updateLocationId = updateLocationId;