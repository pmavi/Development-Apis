const nodemailer = require("nodemailer");

module.exports.SendEmailToUser = async (mailData) => {
    return new Promise((resolve, reject) => {
        let transporter = nodemailer.createTransport({
            // secure: false,
            tls: { rejectUnauthorized: false },
            port: process.env.MAIL_PORT,
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD,
            },
        });
        transporter.sendMail(mailData, function (error, info) {
            if (error) {
                reject(error);
            } else {
                resolve(info)
            }
        });
    });
};
