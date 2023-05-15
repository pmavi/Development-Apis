const jwt = require("jsonwebtoken");

const { Users } = require("../services/models/index");


module.exports.verify_token  = async (req, res, next) => {
    let auth_token = req.headers['authorization'];
    try {
        if (!auth_token) {
           
            return res.json({
                status: false,
                message: "Invalid Token",
            });
            
        }


       let decoded_data = jwt.verify(auth_token, process.env.JWT_SECRET_TOKEN);

        // Check Auth user
        const auth_user = await Users.findOne({
            where: {
                id: decoded_data.user_id,
            },
        });
        if (decoded_data?.user_id !== auth_user?.id) {
            return res.redirect("/");
        }

        req.auth_user = auth_user;
    } catch (error) {
        console.error(" error -----------------", error);
        return res.json({
            status: false,
            message: "Something went wrong. Please try again.",
        });
    }

    next();
};