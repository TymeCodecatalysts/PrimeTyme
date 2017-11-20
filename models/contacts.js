module.exports = (sequelize, DataTypes) => {
	var Contacts = sequelize.define('Contacts', {
		contact_first_name: DataTypes.STRING,
		contact_last_name: DataTypes.STRING,
		contact_number: DataTypes.STRING,
		contact_status: DataTypes.BOOLEAN
	});

	Contacts.associate = function(models) {
		Contacts.belongsTo(models.User);
		Contacts.belongsToMany(models.Post, {through: 'contacts_and_messages'});
	};
	return Contacts;
};