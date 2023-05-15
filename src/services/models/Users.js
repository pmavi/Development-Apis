"use strict";

const Sq = require("sequelize");
const sequelize = require("../dbconfig");

const Users = sequelize.define(
    "users",
    {
        id: {
            type: Sq.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        first_name: {
            type: Sq.STRING,
            defaultValue: null,
        },
        last_name: {
            type: Sq.STRING,
            defaultValue: null,
        },
        email: {
            type: Sq.STRING,
            defaultValue: null,
        },
        password: Sq.STRING,
        user_type: {
            defaultValue: "user",
            type: Sq.ENUM("admin", "user"),
        },
      
        email_verified_at: {
            defaultValue: null,
            type: Sq.DATE,
        },
        otp_token: {
            defaultValue: null,
            type: Sq.STRING,
        },
        reset_password_expires_in: {
            defaultValue: null,
            type: Sq.DATE,
        },
      
        created_by: Sq.INTEGER,
        updated_by: Sq.INTEGER,
        deleted_by: Sq.INTEGER,
    },
    {
        timestamps: true,
        freezeTableName: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        defaultScope: {
            attributes: { exclude: ["password"] },
        },
        scopes: {
            withPassword: { attributes: {} },
        },
    }
);

module.exports = Users;


