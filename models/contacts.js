module.exports = (sequelize, DataTypes) => {
	var Contacts = sequelize.define('Contacts', {
		contactFirstName: DataTypes.STRING,
		contactLastName: DataTypes.STRING,
		contactNumber: DataTypes.STRING,
	});

	Contacts.associate = function(models) {
		models.Contacts.belongsTo(models.User);
		models.Contacts.belongsToMany(models.Post, {through: 'contacts_and_messages'});
		models.Contacts.hasMany(models.Post);
	};
	return Contacts;
};