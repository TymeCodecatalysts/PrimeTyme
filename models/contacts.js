module.exports = (sequelize, DataTypes) => {
	var Contacts = sequelize.define('Contacts', {
		contact_first_name: DataTypes.STRING,
		contact_last_name: DataTypes.STRING,
		contact_number: DataTypes.STRING,
	});

	Contacts.associate = function(models) {
		models.Contacts.belongsTo(models.User);
		models.Contacts.belongsToMany(models.Post, {through: 'contacts_and_messages'});
		models.Contacts.hasMany(models.Post);
	};
	return Contacts;
};