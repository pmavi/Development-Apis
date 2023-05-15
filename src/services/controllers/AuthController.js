"use strict";

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const validator = require('validator');

const { SendEmailToUser } = require("../../helper-libs/helper");
const { Users} = require("../models/index");

// #--------------User Login --------------------------# 
module.exports.Login = async (req, res, next) => {

    if (req.method === "POST") {
        try {
            let request_data = req.body;
            if(!request_data.email || !request_data.password){
                return res.json({
                    status:false,
                    message:'Missing parameter? Either name or password'
                })
            }
            // Check if User Exist or not ?
            const user = await Users.scope("withPassword").findOne({
                where: {
                    email: request_data.email,
                },
            });

            // Check/Match User Password
            if (!user || !(await bcrypt.compare(request_data.password, user.password))) {
                return res.json({
                    status: false,
                    message: "Email or password is incorrect",
                });
            }

            //Check? if user email verified or not 
            if (user?.email_verified_at) {
              
            // Create token
            const token = jwt.sign(
                {
                    user_id: user.id,
                    user_type: user.user_type,
                    expiresIn: 7200
                },
                process.env.JWT_SECRET_TOKEN
            );
                return res.json({
                    status: true,
                    message: "Logged in successfully",
                    data:token
                });
            } 
            else{
                return res.json({
                    status: false,
                    message: "Please verify the email first!",
                }); 
            } 

        } catch (error) {
            return res.json({
                error: error,
                status: false,
                message: "Something went wrong. Please try again.",
            });
        }
    }

};

// #--------------User Signup --------------------------# 
module.exports.Signup = async (req, res, next) => {
    if (req.method === "POST") {
        try {
            let request_data = req.body;

            // required parameters -check
            if(!request_data.email ||  !request_data.first_name || !request_data.password || !request_data.confirm_password){
                return res.json({
                    status:false,
                    message:'Required parameters email,password ,confirm password and first name!'
                })
            }
            
            // email/password validator 
            const email_validate_check = validator.isEmail(request_data.email);
            if(!email_validate_check){
                return res.json({
                    status:false,
                    message:'Invalid Email Address!'
                })
            }
            const password_validate_check = validator.isLength(request_data.password,
                {min: 6});
            if(!password_validate_check){
                return res.json({
                    status:false,
                    message:'Password length should be minimum 6!'
                })
            }

            // confirm password match check 
            if(request_data.password != request_data.confirm_password){
                return res.json({
                    status:false,
                    message:'Confirm Password does not matched!'
                })
            }
            if (
                await Users.findOne({
                    where: {
                        email: request_data.email,
                    },
                })
            ) {
                return res.send({
                    status: false,
                    message: "Email already exists! Please try with a different email.",
                });
            }
            if (request_data.password) {
                request_data.password = await bcrypt.hash(request_data.password, 10);
            }

            // Create new user
            let user = await Users.create(request_data);

            // Create token
            let token = jwt.sign(
                {
                    user_id: user.id,
                    user_type:user.user_type,
                    expiresIn: 7200 
                },
                process.env.JWT_SECRET_TOKEN,
               
            );

            //  Send email
            let email_params = {
                VERIFICATION_URL: `${process.env.APP_URL}/verify-account/${Buffer.from(String(user.id)).toString("base64")}`,
                REGISTERED_NAME: `${request_data?.first_name} `,
                HOME_URL: `${process.env.APP_URL}`,
            };
            let email_template = await fs.readFileSync(`${appRoot}/views/templates/VerifyAccount.html`, "utf8");
            email_template = email_template.replace(/VERIFICATION_URL|HOME_URL|REGISTERED_NAME/gi, function (matched) {
                return email_params[matched];
            });

            let mail_options = {
                html: email_template,
                subject: "Sample App!",
                to: request_data?.email,
                from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_ADDRESS}>`,
            };
            await SendEmailToUser(mail_options)
                .then((info) => {
                    console.log("Nodemailer Email sent -------------------- ", info.response);
                })
                .catch((error) => {
                    console.log("Nodemailer error ---------- ", error);
                });

            /*** Email End ***/
            
            return res.json({
                status: true,
                message: "User Successfully Registered",
                data:token
            });
        } catch (error) {
            return res.json({
                error: error,
                status: false,
                message: "Something went wrong. Please try again.",
            });
        }
    }

};

// #----------------------------Verify Account -------------------------
module.exports.AccountVerifySuccess = async (req, res, next) => {
    try {
        let current_date = new Date();
        let user_id = Buffer.from(req.params.user_id, "base64").toString();

        let user = await Users.findOne({
            where: {
                id: user_id,
            },
        });

        if (!user?.email_verified_at) {
            user.email_verified_at = current_date;
            user.save();

            let email_parameter = {
                HOME_URL: `${process.env.APP_URL}`,
                USER_EMAIL:`${user?.email}`
            };
            let email_template = await fs.readFileSync(`${appRoot}/views/templates/AccountVerified.html`, "utf8");
            email_template = email_template.replace(/HOME_URL|USER_EMAIL/gi, function (matched) {
                return email_parameter[matched];
            });

            let mail_options = {
                html: email_template,
                subject: "Sample App!",
                to: user?.email,
                from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_ADDRESS}>`,
            };

            await SendEmailToUser(mail_options)
                .then(async (info) => {
                    console.log("Nodemailer Email sent -------------------- ", info.response);
                })
                .catch((error) => {
                    console.log("Nodemailer error ---------- ", error);
                });
           
        }

       res.render("frontend-ui/EmailConfirmationMessage");
    } catch (error) {
        res.redirect(`${process.env.APP_URL}/login`);
    }
};

// #----------------------------resend email for verification -------------------------
module.exports.ResendVerificationEmail = async (req, res, next) => {
    if (req.method == "POST") {
        try {
            const request_data = req.body;
            let email_parametars = {
                Verification_URL: `${process.env.APP_URL}/verify-account/${Buffer.from(String(request_body.id)).toString("base64")}`,
                REGISTERED_NAME: `${request_data?.first_name} ${request_data?.last_name}`,
                HOME_URL: `${process.env.APP_URL}`,
            };
            let email_template = await fs.readFileSync(`${appRoot}/views/templates/VerifyAccount.html`, "utf8");
            email_template = email_template.replace(/Verification_URL|HOME_URL|REGISTERED_NAME/gi, function (matched) {
                return email_parametars[matched];
            });

            let mail_options = {
                html: email_template,
                subject: "Sample App!",
                to: request_body?.email,
                from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_ADDRESS}>`,
            };
            await SendEmailToUser(mail_options)
                .then((info) => {
                    console.log("Nodemailer Email sent -------------------- ", info.response);
                })
                .catch((error) => {
                    console.log("Nodemailer error ---------- ", error);
                });
            /***  Email End ***/

            return res.json({
                status: true,
                message: "Resent Successfully",
                redirect_url: `${process.env.APP_URL}/account-verify/${request_body.id}`,
            });
        } catch (error) {
            return res.json({
                error: error,
                status: false,
                message: "Something went wrong. Please try again.",
            });
        }
    }
    let user = await Users.findOne({
        where: {
            id: req.params.user_id,
        },
    }).then((response) => {
        return response;
    });

   
};
// #----------------------------forgot password -------------------------
module.exports.ForgotPassword = async (req, res, next) => {
    try {
        if (req.method === "POST") {
            let request_data = req.body;

            const user = await Users.findOne({
                where: {
                    email: request_data.email,
                },
            });

            // check user email 
            if (!user) {
                return res.json({
                    status: false,
                    message: "Email is incorrect",
                });
            } else {
                let expiry_time = new Date();
                // set token expiry time
                expiry_time.setMinutes(expiry_time.getMinutes() + 30);

                let token = Buffer.from(String(user.id)).toString("base64");
                await Users.update(
                    {
                        otp_token: token,
                        reset_password_expires: expiry_time,
                    },
                    {
                        where: {
                            email: request_data.email,
                        },
                    }
                );
                let email_parameters = {
                    RESET_PWD_URL: `${process.env.APP_URL}/reset-password/${token}`,
                    USERNAME: `${request_data?.email}`,
                    HOME_URL: `${process.env.APP_URL}`,
                };
                let email_template = await fs.readFileSync(`${appRoot}/views/templates/ForgotPassword.html`, "utf8");
                email_template = email_template.replace(/RESET_PWD_URL|HOME_URL|USERNAME/gi, function (matched) {
                    return email_parameters[matched];
                });

                /***  Email start ***/
                let mail_options = {
                    html: email_template,
                    subject: "Sample App!",
                    to: request_data?.email,
                    from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_ADDRESS}>`,
                };
                let resp_mail = await SendEmailToUser(mail_options);
                if (resp_mail) {
                    return res.json({
                        status: true,
                        email: user.email,
                        message: " Email Sent",
                    });
                } else {
                    return res.json({
                        status: false,
                        message: "Unable to send send reset link at mail",
                    });
                }
            }
        }
    } catch (error) {
        return res.json({
            error: error,
            status: false,
            message: "Something went wrong. Please try again.",
        });
    }

   
};

// #----------------reset password ---------------------
module.exports.ResetPassword = async (req, res, next) => {
    try {
        let user_id = Buffer.from(req.params.user_id, "base64").toString();

        if (req.method === "POST") {
            let request_data = req.body;
            let current_date = new Date();

            // Required parms
            if (!request_data.password || !request_data.confirm_password) {
                return res.json({
                    status: false,
                    message: "Missing Parameters.",
                });
            }

            // match password check
            if (request_data.password !== request_data.confirm_password) {
                return res.json({
                    status: false,
                    message: "Password and Confirm Password does not match",
                });
            }
            if (request_data.password.length < 6) {
                return res.json({
                    status: false,
                    message: "Password value should be greater than 6",
                });
            }
            if (request_data.confirm_password.length < 6) {
                return res.json({
                    status: false,
                    message: "Confirm Password value should be greater than 6",
                });
            }

            const user = await Users.findOne({
                where: {
                    id: user_id,
                    otp_token: req.params.user_id,
                },
            });
            if (user) {

                // password expiry check
                if (current_date > user.reset_password_expires) {
                    return res.json({
                        status: false,
                        message: "Reset Link Expired!",
                    });
                } else {
                    if (request_data.password) {
                        request_data.password = await bcrypt.hash(request_data.password, 10);
                    }

                    const verifyUser = await Users.update(
                        {
                            password: request_data.password,
                        },
                        {
                            where: {
                                email: user.email,
                            },
                        }
                    );
                    if (verifyUser) {
                        return res.json({
                            status: true,
                            message: "Your password has been changed, now you can log in. ",
                        });
                    } else {
                        return res.json({
                            status: false,
                            message: "Unable to reset the password",
                        });
                    }
                }
            } else {
                return res.json({
                    status: false,
                    message: "User not found!",
                });
            }
        }
    } catch (error) {
        return res.json({
            error: error,
            status: false,
            message: "Something went wrong. Please check your details.",
        });
    }

    
};

// #----------------------------get users list -------------------------
module.exports.UserData = async (req, res, next) => {
    try {
        // check if token id and parm id matched?
        if( String(req.auth_user.id) !== req.params.id  ){
            return res.json({
                status: false,
                message:'Token does not matched!'
            });
        }
        // find user details 
        const users = await Users.findOne({id:req.params.user_id});
        if(users){
            return res.json({
                status: true,
                data:users 
            });
        }
        else{
            return res.json({
                status: false,
                data:users ,
                message:'You dont have any user yet'
            });
        }
            
        
    }
    catch(error){
        return res.json({
            error: error,
            status: false,
            message: "Something went wrong. Please check your details.",
        });
    }
}
