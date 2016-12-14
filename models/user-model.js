const Sequelize = require('sequelize');
const sequelizeConnection = require('../db');

// Models:
const Playlist = require('../models/playlist-model');


const User = sequelizeConnection.define('user', {
		userId: {
		type: Sequelize.UUID,
		defaultValue: Sequelize.UUIDV4
	},
	username: {
		type: Sequelize.STRING,
		validate: {
			notEmpty: true,
			len: [5, 35]
		}
	},
	email: {
		type: Sequelize.STRING,
		validate: {
			isEmail: true,
			notEmpty: true,
			max: 40
		}
	},
	password: {
		type: Sequelize.STRING,
		validate: {
			notEmpty: true,
			len: [5, 55]
		}
	}
});

//Rubiya's password encryption user model
// // Password Encryption (via: https://nodeontrain.xyz/tuts/secure_password/)
// const bcrypt = require('bcrypt');

// var User = sequelizeConnection.define('user', {
// 	userId: {
// 		type: Sequelize.UUID,
// 		defaultValue: Sequelize.UUIDV4
// 	},
// 	username: {
// 		type: Sequelize.STRING,
// 		validate: {
// 			notEmpty: true,
// 			min: 6,
// 			max: 25
// 		}
// 	},
// 	email: {
// 		type: Sequelize.STRING,
// 		allowNull: false,
// 		validate: {
// 			isEmail: true,
// 			notEmpty: true,
// 			max: 255
// 		}
// 	},
// 	password_digest: {
// 		type: Sequelize.STRING,
// 		validate: {
// 			notEmpty: true
// 		}
// 	},
// 	password: {
// 		type: Sequelize.VIRTUAL,
// 		allowNull: false,
// 		validate: {
// 			notEmpty: true
// 		}
// 	},
// 	password_confirmation: {
// 		type: Sequelize.VIRTUAL
// 	}
// }, {
// 	freezeTableName: true,
// 	indexes: [{unique: true, fields: ['email']}],
// 	instanceMethods: {
// 		authenticate: function(value) {
// 			if (bcrypt.compareSync(value, this.password_digest))
// 				return this;
// 			else
// 				return false;
			
// 		}
// 	}
// });



module.exports = User;