module.exports = (sequelize, DataTypes) => {
    const Test = sequelize.define('Test', {
      // Define your model attributes here
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // Add other attributes as needed
    });
  
    // Define associations here if any
    Test.associate = function(models) {
      // Example: Test.belongsTo(models.OtherModel);
    };
  
    return Test;
  };
  