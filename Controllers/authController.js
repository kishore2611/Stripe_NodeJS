const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
// const { sendEmail } = require('../config/mailer')

//Register User 
const register = async (req, res) => {
    // if (!req.body.firstName) {
    //     res.status(400).send({
    //         status: 0,
    //         message: 'firstName is required.'
    //     });
    // }
    // else if (!req.body.lastName) {
    //     res.status(400).send({
    //         status: 0,
    //         message: 'lastName is required.'
    //     });
    // }
    if (!req.body.email) {
        res.status(400).send({
            status: 0,
            message: 'Email is required.'
        });
    }
    else if (!req.body.password) {
        res.status(400).send({
            status: 0,
            message: 'Password is required.'
        });
    }

    else {
        User.find({ email: req.body.email })
            .exec()
            .then(user => {
                if (user.length >= 1) {
                    res.status(400).send({
                        status: 0,
                        message: 'Email already exists!'
                    });
                }
                else {
                    bcrypt.hash(req.body.password, 10, (err, hash) => {
                        if (err) {
                            res.status(400).send({
                                status: 0,
                                message: err + ' password is incorrect!'
                            });
                        }
                        else {
                            if (req.file) {
                                profilePicture = req.file.path
                            }


                            const verificationCode = Math.floor(100000 + Math.random() * 900000);

                            const user = new User;
                            user.firstName = req.body.firstName;
                            user.lastName = req.body.lastName;
                            user.email = req.body.email;
                            user.role = req.body.role;
                            user.password = hash;
                            user.address = req.body.address;
                            user.profilePicture =  (req.file ? req.file.path : req.body.profilePicture)

                            user.verificationCode = verificationCode;

                            const token = jwt.sign(
                                {
                                    email: user.email,
                                    userId: user._id
                                },
                                process.env.JWT_KEY,
                                {
                                    expiresIn: '20hr'
                                }
                            );
                            User.findOneAndUpdate({ user_authentication: token })
                                .exec()
                            //  console.log(user[0].user_authentication);
                            user.user_authentication = token
                            // user.save()
                            user.save()

                                .then(result => {
                                    // sendEmail(user.email, verificationCode, "Email verification");


                                    return res.status(200).send({
                                        status: 1,
                                        message: 'User verification code successfully sent to email.',
                                        data: {
                                            verificationCode: user.verificationCode,
                                            token: token,
                                            result: result
                                        }
                                    });
                                })
                                .catch(errr => {
                                    res.status(400).send({
                                        status: 0,
                                        message: errr
                                    });
                                });
                        }
                    });
                }
            })
            .catch(err => {
                res.status(400).send({
                    status: 0,
                    message: err
                });
            });
    }
}

//verify User
const verifyUser = async (req, res) => {
    if (!req.body.user_id) {
        res.status(400).send({
            status: 0,
            message: 'User id field is required'
        });
    }
    else if (!req.body.verificationCode) {
        res.status(400).send({
            status: 0,
            message: 'Verification code field is required'
        });
    }
    else {
        User.find({ _id: req.body.user_id })
            .exec()
            .then(result => {
                if (!req.body.verificationCode) {
                    res.status(400).send({
                        status: 0,
                        message: 'Verification code is required.'
                    });
                }

                if (req.body.verificationCode == result[0].verificationCode) {

                    User.findByIdAndUpdate(req.body.user_id, { verified: 1, verificationCode: null }, (err, user) => {
                        if (err) {
                            res.status(400).send({
                                status: 0,
                                message: 'Something went wrong.'
                            });
                        }
                        if (user) {
                            const token = jwt.sign(
                                {
                                    email: user.email,
                                    userId: user._id
                                },
                                process.env.JWT_KEY,
                                {
                                    expiresIn: '20hr'
                                }
                            );
                            User.findOneAndUpdate({ user_authentication: token })
                                .exec()
                            //  console.log(user[0].user_authentication);
                            user.user_authentication = token
                            user.save()
                            return res.status(200).send({
                                status: 1,
                                message: 'Otp matched successfully.',

                                data: {
                                    token: user.user_authentication,
                                    _id: user._id
                                }
                            });
                            // res.status(200).send({
                            //     status: 1, 
                            //     message: 'Otp matched successfully.' 
                            // });
                        }
                    });
                }
                else {
                    res.status(200).send({
                        status: 0,
                        message: 'Verification code did not matched.'
                    });
                }
            })
            .catch(err => {
                res.status(400).send({
                    status: 0,
                    message: 'User not found'
                });
            });
    }
}


/** Resend code */
const resendCode = async (req, res) => {
    if (!req.body.user_id) {
        res.status(400).send({
            status: 0,
            message: 'User id failed is required.'
        });
    }
    else {
        User.find({ _id: req.body.user_id })
            .exec()
            .then(result => {
                const verificationCode = Math.floor(100000 + Math.random() * 900000);

                User.findByIdAndUpdate(req.body.user_id, { verified: 0, verificationCode: verificationCode }, (err, _result) => {
                    if (err) {
                        res.status(400).send({
                            status: 0,
                            message: 'Something went wrong.'
                        });
                    }
                    if (_result) {
                        // sendEmail(result[0].email, verificationCode, "Verification Code Resend");
                        res.status(200).send({
                            status: 1,
                            message: 'Verification code resend successfully.',
                            verificationCode: verificationCode
                        });
                    }
                });
            })
            .catch(err => {
                res.status(400).send({
                    status: 0,
                    message: 'User not found'
                });
            });
    }
}

//Login
const login = async (req, res) => {
    if (!req.body.email) {
        return res.status(400).send({
            status: 0,
            message: 'Email field is required.'
        });
    }
    else if (!req.body.password) {
        return res.status(400).send({
            status: 0,
            message: 'Password field is required.'
        });
    }
    else {
        User.find({ email: req.body.email })
            .exec()
            .then(user => {
                if (user.length < 1) {
                    return res.status(404).send({
                        status: 0,
                        message: 'Email not found!'
                    });
                }
                else {
                    bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                        if (err) {
                            return res.status(400).send({
                                status: 0,
                                message: 'Auth Failed'
                            });
                        }
                        if (result) {

                            if (user[0].verified == 0) {
                                return res.status(400).send({
                                    status: 0,
                                    message: 'Please verify your account.'
                                });

                            }
                            else {
                                const token = jwt.sign(
                                    {
                                        email: user[0].email,
                                        userId: user[0]._id
                                    },
                                    process.env.JWT_KEY,
                                    {
                                        expiresIn: '20hr'
                                    }
                                );
                                User.findOneAndUpdate({ user_authentication: token })
                                    .exec()
                                //  console.log(user[0].user_authentication);
                                user[0].user_authentication = token
                                user[0].save()
                                return res.status(200).send({
                                    status: 1,
                                    message: 'User logged in successfully!',
                                    token: token,
                                    data: user[0].email
                                });
                            }
                        }
                        return res.status(400).send({
                            status: 0,
                            message: 'Incorrect password.'
                        });
                    })
                }
            })
            .catch(err => {
                res.status(400).send({
                    status: 0,
                    message: err
                });
            });
    }
}


//Forgot Password
const forgotPassword = async (req, res) => {
    try {
        if (!req.body.email) {
            res.status(400).send({
                status: 0,
                message: 'Email field is required'
            });
        }
        else {
            User.findOne({ email: req.body.email })
                .exec()
                .then(user => {
                    if (user.length < 1) {
                        return res.status(404).send({
                            status: 0,
                            message: 'Email not found!'
                        });
                    }
                    else {
                        const verificationCode = Math.floor(100000 + Math.random() * 900000);

                        User.findByIdAndUpdate(user._id, { verificationCode: verificationCode }, (err, _result) => {
                            if (err) {
                                res.status(400).send({
                                    status: 0,
                                    message: 'Something went wrong.'
                                });
                            }
                            if (_result) {
                                // sendEmail(user.email, verificationCode, 'Forgot Password');
                                res.status(200).send({
                                    status: 1,
                                    message: 'Code successfully send to email.',
                                    data: {
                                        user_id: user._id,
                                        verificationCode: verificationCode
                                    }
                                });
                            }
                        });
                    }
                })
                .catch(err => {
                    res.status(400).send({
                        status: 0,
                        message: 'User not found'
                    });
                });
        }
    }
    catch (err) {
        res.status(404).send({
            status: 0,
            message: 'error: ' + err.message
        })
    }
}

//Verify Code
const verifyCode = async (req, res) => {
    try {
        if (!req.body.user_id) {
            res.status(400).send({
                status: 0,
                message: 'User id field is required'
            });
        }
        else if (!req.body.verificationCode) {
            res.status(400).send({
                status: 0,
                message: 'Verification code field is required'
            });
        }
        else {
            User.findOne({ _id: req.body.user_id })
                .exec()
                .then(result => {
                    if (!req.body.verificationCode) {
                        res.status(400).send({
                            status: 0,
                            message: 'Verification code is required.'
                        });
                    }

                    if (req.body.verificationCode == result.verificationCode) {

                        User.findByIdAndUpdate(req.body.user_id, { verified: 1, verificationCode: null }, (err, _result) => {
                            if (err) {
                                res.status(400).send({
                                    status: 0,
                                    message: 'Something went wrong.'
                                });
                            }
                            if (_result) {
                                res.status(200).send({
                                    status: 1,
                                    message: 'Otp matched successfully.'
                                });
                            }
                        });
                    }
                    else {
                        res.status(200).send({
                            status: 0,
                            message: 'Verification code did not matched.'
                        });
                    }
                })
                .catch(err => {
                    res.status(400).send({
                        status: 0,
                        message: 'User not found'
                    });
                });
        }
    }
    catch (err) {
        res.status(404).send({
            status: 0,
            message: 'error: ' + err.message
        })
    }
}

//Reset Password
const resetPassword = async (req, res) => {
    try {
        if (!req.body.user_id) {
            res.status(400).send({
                status: 0,
                message: 'User id field is required.'
            });
        }
        else if (!req.body.new_password) {
            res.status(400).send({
                status: 0,
                message: 'New password field is required.'
            });
        }
        else {
            User.find({ _id: req.body.user_id })
                .exec()
                .then(user => {

                    bcrypt.hash(req.body.new_password, 10, (error, hash) => {
                        if (error) {
                            return res.status(400).send({
                                status: 0,
                                message: error
                            });
                        }
                        else {
                            User.findByIdAndUpdate(req.body.user_id, { password: hash }, (err, _result) => {
                                if (err) {
                                    res.status(400).send({
                                        status: 0,
                                        message: 'Something went wrong.'
                                    });
                                }
                                if (_result) {
                                    res.status(200).send({
                                        status: 1,
                                        message: 'Password updated successfully.'
                                    });
                                }
                            });
                        }
                    });
                })
                .catch(err => {
                    res.status(400).send({
                        status: 0,
                        message: 'catch Error: ' + err.message
                    });
                });
        }
    }
    catch (err) {
        res.status(404).send({
            status: 0,
            message: 'error: ' + err.message
        });
    }
}


//Update Password
const updatePassword = async (req, res) => {
    try {
        if (!req.body.password) {
            res.status(400).send({
                status: 0,
                message: 'Old password field is required.'
            });
        }
        else if (!req.body.new_password) {
            res.status(400).send({
                status: 0,
                message: 'New password field is required.'
            });
        }
        else {
            const user = await User.findOne({ _id: req.user._id })
            const isMatch = await bcrypt.compare(req.body.password, user.password)
            if (!isMatch) {
                res.status(400).send({
                    status: 0,
                    message: "Old password is incorrect"
                })
            }
            else {
                const hashedpassword = await bcrypt.hash(req.body.new_password, 10)
                const newUser = await User.findByIdAndUpdate({ _id: req.user._id }, { password: hashedpassword })
                await newUser.save()

                res.status(200).send({
                    status: 1,
                    message: newUser.email + " has been updated successfully"
                })
            }
        }
    }
    catch (err) {
        res.status(404).send({
            status: 0,
            message: 'error: ' + err.message
        })
    }
}




//LogOut
const logOut = async (req, res) => {
    try {
        // if (!req.body.user_id) {
        //     res.status(400).send({ status: 0, message: 'User ID field is required' });
        // }
        // else if (!req.headers.authorization) {
        //     res.status(400).send({ status: 0, message: 'Authentication Field is required' });
        // }

        // else {
        const updateUser = await User.findOneAndUpdate({ _id: req.user._id }, {
            user_authentication: null,
            user_device_type: null,
            user_device_token: null
        });
        res.status(200).send({
            status: 1,
            message: 'User logout Successfully.',
            updateUser
        });
        // console.log(updateUser);
        // }

        // res.headers('tolen', 'none', {
        // httpOnly: true
        // })

        // return res.status(200).headers("token", null, {expires: new Date(Date.now()), httpOnly: true}).send({
        //     status: 1, 
        //     message: 'User logged Out successfully!', 
        //     data: {}
        //     // token: null
        // })

        // res.status(200).send({
        //     data: {}
        // })
    }
    catch (err) {
        res.status(500).send({
            status: 0,
            message: 'error: ' + err.message
        })
    }
}

//** Social Login *//
const socialLogin = async (req, res) => {
    try {
        const alreadyUserAsSocialToke = await User.findOne({ user_social_token: req.body.user_social_token })
        if (alreadyUserAsSocialToke) {
            if (alreadyUserAsSocialToke.user_type !== req.body.user_type) {
                return res.status(400).send({ status: 0, message: "Invalid User Type!" });
            }
        }
        if (!req.body.user_social_token) {
            return res.status(400).send({ status: 0, message: 'User Social Token field is required' });
        }
        else if (!req.body.user_social_type) {
            return res.status(400).send({ status: 0, message: 'User Social Type field is required' });
        }
        else if (!req.body.user_device_type) {
            return res.status(400).send({ status: 0, message: 'User Device Type field is required' });
        }
        else if (!req.body.user_device_token) {
            return res.status(400).send({ status: 0, message: 'User Device Token field is required' });
        }
        else {
            const checkUser = await User.findOne({ user_social_token: req.body.user_social_token });
            if (!checkUser) {
                const newRecord = new User();
                // if(req.file){
                //     newRecord.user_image    = req.file.path
                //  }
                // const customer = await stripe.customers.create({
                //     description: 'New Customer Created',
                // });
                // newRecord.stripe_id = customer.id;
                // newRecord.user_image = req.body.user_image ? req.body.user_image : ""
                // newRecord.user_image = req.body.user_image
                // newRecord.user_image = req.file ? req.file.path : req.body.user_image,
                newRecord.user_social_token = req.body.user_social_token,///
                    newRecord.user_social_type = req.body.user_social_type,
                    newRecord.user_device_type = req.body.user_device_type,
                    newRecord.user_device_token = req.body.user_device_token,
                // newRecord.user_name = req.body.user_name,////
                newRecord.email = req.body.email,
                    //newRecord.user_type = req.body.user_type,
                    newRecord.verified = 1
                // await newRecord.generateAuthToken();
                const token = await jwt.sign(
                    {
                        email: newRecord.email,
                        _id: newRecord._id
                    },
                    process.env.JWT_KEY,
                    {
                        expiresIn: '20hr'
                    }
                );
                newRecord.user_authentication = token
                const saveLogin = await newRecord.save();
                return res.status(200).send({ status: 1, message: 'Login Successfully', saveLogin: saveLogin, token: token });
            } else {
                // const token = await checkUser.generateAuthToken();
                const user = this
                const token = jwt.sign(
                    {
                        email: user.email,
                        _id: user._id
                    },
                    process.env.JWT_KEY,
                    {
                        expiresIn: '20hr'
                    }
                );
                // User.findOneAndUpdate({ user_authentication: token })
                const upatedRecord = await User.findOneAndUpdate({ _id: checkUser._id },
                    { user_device_type: req.body.user_device_type, user_device_token: req.body.user_device_token, verified: 1, user_authentication: token }
                    , { new: true });
                return res.status(200).send({ status: 1, message: 'Login Successfully', token: token, data: upatedRecord });
            }
        }
        // console.log(upatedRecord)
    }
    catch (error) {
        console.log('error *** ', error);
        res.status(500).json({
            status: 0,
            message: error.message + "kdfkjhdjkfhjkd"
        });
    }
}



module.exports = {
    register,
    verifyUser,
    resendCode,
    login,
    forgotPassword,
    verifyCode,
    resetPassword,
    updatePassword,
    logOut,
    socialLogin
}