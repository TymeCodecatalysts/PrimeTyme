module.exports = (sequelize, DataTypes) => {
	var Contacts = sequelize.define('Contacts', {
		contactFirstName: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				notEmpty: true,
			}
		},
		contactLastName: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				notEmpty: true,
			}
		},
		contactNumber: {
			type: DataTypes.INTEGER,
			unique: true,
			allowNull: false,
			validate: {
				notEmpty: true,
			}
		}
	});

	Contacts.associate = function(models) {
		models.Contacts.belongsTo(models.User);
		models.Contacts.belongsToMany(models.Post, {through: 'contacts_and_messages'});
		models.Contacts.hasMany(models.Post);
	};
	return Contacts;
};