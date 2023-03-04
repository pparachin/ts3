const User = require("../database/models/User");

async function getUsers(){
    let users = [];
    await User.find({}, function (error, result){
       if(!error){
           users.push(result);
       } else {
       }
    }).clone().catch(function (error){console.log(error)})
    return users;
}

module.exports.getUsers = getUsers;