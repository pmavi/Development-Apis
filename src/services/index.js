let express = require("express");
const multer = require("multer");

const router = express.Router();
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads");
    },
    filename: function (req, file, cb) {
        const split_mime = file.mimetype.split("/");
        const extension = typeof split_mime[1] !== "undefined" ? split_mime[1] : "jpeg";
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({
    storage: storage,
});

const AuthController = require("./controllers/AuthController");
const jwtTokenVerify = require("../middleware/jwtVerify");

//--------------------------- Auth Api Routers ---------------------------/

router.post("/api/signup",upload.none(), AuthController.Signup);
router.post("/api/login",upload.none(), AuthController.Login);
router.get("/account-verify/:user_id",AuthController.ResendVerificationEmail);
router.post("/account-verify", upload.none(), AuthController.ResendVerificationEmail);
router.get("/verify-account/:user_id", AuthController.AccountVerifySuccess);
router.post("/forgot-password", upload.none(), AuthController.ForgotPassword);
router.post("/reset-password/:user_id", upload.none(), AuthController.ResetPassword);
router.get("/user-data/:id",jwtTokenVerify.verify_token, AuthController.UserData);


module.exports = router;