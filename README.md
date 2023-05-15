## `Setup the postgres database`
Install postgres 14+ version
better to leave the username, password for postgres as postgres, test...easy to remember

### using pgadmin: create database "bidhq_local"

### using psql, restore the db script

For example, 
Where your postgres Details:
username=postgres
password=test
db name = sample_test

Change the db settings in the file:
src->services->dbconfig.js

For example, on the basis of above:
```jsx
const sequelize = new Sequelize('sample_test', 'postgres', 'test', {
	host: 'localhost',
	dialect: 'postgres',
});
```
## `Database Migrations and Database Seed`
### Delete Database Migrations
```
npx sequelize db:migrate:undo:all
```

### Create Database Migrations
```
npx sequelize db:migrate
```

### Created Database Seed
```
npx sequelize db:seed:all
```
### -----------------------------Basic Api Instructions---------------------

``` Created the following authentication apis
```
1.User Signup 
2.User Login 
3.Email Verfication and confirmation
4.Forgot Password otp token generation
5.Reset Password 
6.User info - with token security 

Signup params:- 
url - http://localhost:8001/api/signup
email - required
password -required
first_name - required
last_name
user_type - [admin, user] bydefault user 

Login params:- 
url- http://localhost:8001/api/login
email 
password 

Forgot pwd params:- 
url - http://localhost:8001/forgot-password
email - required 

Reset password params:-
url: - http://localhost:8001/reset-password/:user_id 
example : http://localhost:8001/reset-password/MS==
password - required 
confirm_password - required 

User Info parmas:- 
url:- http://localhost:8001/user-data/:id
example:  http://localhost:8001/user-data/:1

Headers:-
Authorization :- token value 


