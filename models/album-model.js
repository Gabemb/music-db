const Sequelize = require('sequelize');
const sequelizeConnection = require('../db');

const Album = sequelizeConnection.define('album', {
	title: {
		type: Sequelize.STRING,
		validate: {
			min: 1,
			max: 100,
			notEmpty: true
		}
	}
});

//instead of min and max we could also use {len: [1, 100]}

module.exports = Album;
