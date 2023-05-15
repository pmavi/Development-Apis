const Sequelize = require("sequelize");

const sequelizeConfig = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
});

try {
    sequelizeConfig
        .authenticate()
        .then(() => {
            console.log("Connection has been established successfully.");
        })
        .catch((err) => {
            console.log("Unable to connect to the database:", err);
        });
} catch (err) {
    console.log("an error occured", err);
}

module.exports = sequelizeConfig;