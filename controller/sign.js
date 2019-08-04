const bcrypt = require('bcryptjs');
const dao = require('../dao/sign.js');
const nodemailer = require('nodemailer');

// signup
function signup(req, res) {
    let params = req.body;
    if (!params.email) return res.send({ success: 0, message: "Email is required!" });

    dao.getUserByEmail(params.email, function (err, returnVal) {
        if (err) throw err;
        else {
            if (returnVal != 0) return res.send({ success: 0, message: "This email is already registered!" });
            dao.registerUser(params.email, params.password, params.firstname, params.lastname, params.usertype, params.location, function (err, userId) {
                if (err) throw err;
                else {
                    // return res.send({ success: 1, message: "Successfully signed up", data: userId });
                    login(req, res);
                }
            });
        }
    });
};

// login
function login(req, res) {
    let params = req.body;
    if (!params.email) {
        return res.send({ success: 0, message: "Email is required!" });
    }
    if (!params.password) {
        return res.send({ success: 0, message: "Password is required!" });
    }
    dao.getUserByEmail(params.email, function (err, returnVal) {
        if (err) throw err;
        else {
            if (returnVal == 0) return res.send({ success: 0, message: "No registered email!" });
            let passwordIsValid = bcrypt.compareSync(params.password, returnVal.password);
            if (!passwordIsValid) {
                return res.send({ success: 0, message: 'Credential failed' });
            } else {
                dao.updateLastLogIn(returnVal.id_user, function (err, returnValue) {
                    if (err) throw err
                    else {
                        let token = dao.getTokenFromUserId(returnVal.id_user);
                        if (returnVal.status == 0) {
                            let verificationCode = Math.floor(100000 + Math.random() * 900000);
                            dao.addVerificationCode(returnVal.id_user, verificationCode, function (err, insertId) {
                                if (err) throw err;
                                else {
                                    // sendVerificationEmail(returnVal.email, function (err) {
                                    // if (err) return res.send({ success: 0, message: 'Failed to send verification email' }); 
                                    return res.send({ success: 1, message: 'Verification Email has been sent', data: { token: token, status: 0, user_id: returnVal.id_user, type: returnVal.usertype } });
                                    // });
                                }
                            })
                        } else return res.send({ success: 1, message: 'Successfully logged in', data: { token: token, status: returnVal.status, user_id: returnVal.id_user, type: returnVal.usertype } });
                    }
                })
            }
        }
    })
}

function verifyUser(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    let funcAction = function (err, decoded) {
        if (err) return res.send({ success: -1, message: 'Failed to authenticate token.' })
        if (decoded.id == params.user_id) {
            dao.isVerificationCodeExisting(params.user_id, params.code, function (err, returnVal) {
                if (err) throw err
                else {
                    if (returnVal == 0) return res.send({ success: 0, message: "Verification failed. Send the request a verification code again." })
                    if (returnVal == 1) {
                        dao.changeUserStatus(params.user_id, 1, function (err, returnValue) {
                            if (err) throw err
                            else {
                                if (returnValue) {
                                    return res.send({ success: 1, message: 'Verification Successed' })
                                }
                            }
                        })
                    }
                }
            })
        }
    }
    dao.verifyToken(token, funcAction)
}

function requestVerificationCode(req, res) {
    let params = req.body
    let token = req.headers['authorization']
    let funcAction = function (err, decoded) {
        if (err) return res.send({ success: -1, message: 'Failed to authenticate token.' })
        if (decoded.id == params.user_id) {
            let verificationCode = Math.floor(100000 + Math.random() * 900000)
            dao.addVerificationCode(params.user_id, verificationCode, function (err, insertId) {
                if (err) throw err
                else {
                    // sendVerificationEmail(returnVal.email, verificationCode, function (err) {
                    // if (err) return res.send({ success: 0, message: 'Failed to send verification email' })
                    return res.send({ success: 1, message: 'Verification Email has been sent' })
                    // })
                }
            })
        }
    }
    dao.verifyToken(token, funcAction)
}

function forgotPassword(req, res) {
    let email = req.body.email
    dao.getUserByEmail(email, function (err, returnVal) {
        if (err) throw err
        else {
            if (returnVal == 0) return res.send({ success: 0, message: "No registered email!" })
            dao.addResetPasswordKey(returnVal.id_user, email, function (err, reset_key) {
                if (err) throw err
                else {
                    // sendResetPasswordEmail(req, reset_key, function (err) {
                    // if (err) return res.send({ success: 0, message: 'Failed to send email' }) 
                    return res.send({ success: 1, message: 'Change Password Link has been sent' })
                    // })
                }
            })
        }
    })
}

function verifyResetKey(req, res) {
    let reset_key = req.body.reset_key
    dao.getUserIdByResetKey(reset_key, function (err, returnVal) {
        if (err) throw err
        else {
            if (returnVal == 0) return res.send({ success: 0, message: "Invalid key!" })
            if (returnVal) return res.send({ success: 1, message: 'Valid.', data: { user_id: returnVal } })
        }
    })
}

function resetPassword(req, res) {
    let params = req.body
    dao.getUserIdByResetKey(params.reset_key, function (err, returnVal) {
        if (err) throw err
        else {
            if (returnVal == 0) return res.send({ success: 0, message: "Invalid key!" })
            if (returnVal != params.user_id) return res.send({ success: 0, message: "Invalid key!" })
            dao.resetPassword(params.user_id, params.password, function (err, returnVal) {
                if (err) throw err
                else {
                    return res.send({ success: 1, message: 'Password has been changed.' })
                }
            })
        }
    })
}

function changePassword(req, res) {
    let params = req.body;
    let token = req.headers['authorization'];
    let funcAction = function (err, decoded) {
        if (err) return res.send({ success: -1, message: 'Failed to authenticate token.' })
        if (decoded.id == params.user_id) {
            dao.getUserById(params.user_id, function (err, returnVal) {
                if (err) throw err
                else {
                    if (returnVal == 0) return res.send({ success: 0, message: "Invalid User!" })
                    let passwordIsValid = bcrypt.compareSync(params.previousPassword, returnVal.password);
                    if (!passwordIsValid) {
                        return res.send({ success: 0, message: 'Credential failed' });
                    } else {
                        dao.resetPassword(params.user_id, params.newPassword, function (err, returnVal) {
                            if (err) throw err
                            else {
                                return res.send({ success: 1, message: 'Password has been changed.' })
                            }
                        })
                    }
                }
            })
        } else res.send({ success: 0, message: 'Invalid User!' })
    }
    dao.verifyToken(token, funcAction);
}

// get logged in user info
function getLoggedinUser(req, res) {
    let params = req.body;
    let token = req.headers['authorization'];
    let funcAction = function (err, decoded) {
        if (err) return res.send({ success: -1, message: 'Failed to authenticate token.' });
        dao.getLoggedinUserInfoById(decoded.id, function (err, userInfo) {
            if (err) throw err;
            else return res.send({ success: 1, message: 'Retrived logged in user informatino.', data: userInfo });
        });
    }
    dao.verifyToken(token, funcAction);
};

function sendVerificationEmail(email, code, callback) {
    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: 'zzbb8855@gmail.com',
            pass: '123456khs'
        }
    });

    var mailOptions = {
        from: 'PickADove <no-reply@mail.pickadove.com>',
        to: email,
        subject: 'Verification Code from Pick A Dove',
        text: code
    };
    console.log("sending email to ", email);
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            callback(error);
            return;
        }

        console.log('Message sent: ' + info.response);
        callback(null);
    });
}

function sendResetPasswordEmail(req, reset_key, callback) {
    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: 'zzbb8855@gmail.com',
            pass: '123456khs'
        }
    });

    var mailOptions = {
        from: 'PickADove <no-reply@mail.pickadove.com>',
        to: req.body.email,
        subject: 'Change Password from following link',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/reset/' + reset_key + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
    };
    console.log("sending reset email to ", req.body.email);
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            callback(error);
            return;
        }

        console.log('Reset Password Mail has been sent: ' + info.response);
        callback(null);
    });
}

exports.login = login;
exports.signup = signup;
exports.verifyUser = verifyUser;
exports.requestVerificationCode = requestVerificationCode;
exports.forgotPassword = forgotPassword;
exports.verifyResetKey = verifyResetKey;
exports.resetPassword = resetPassword;
exports.changePassword = changePassword;
exports.getLoggedinUser = getLoggedinUser;
exports.sendVerificationEmail = sendVerificationEmail