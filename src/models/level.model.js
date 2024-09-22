module.exports = (sequelize, DataTypes) => {
    const Level = sequelize.define('Level', {
    id:{
        type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    title:{
        type: DataTypes.STRING,
        allowNull: false
    }
    ,
    courseId:{
        type: DataTypes.UUID,
        allowNull: false
    },
},
{
    timestamps: true,
});
    Level.associate = function(models) {


      Level.belongsTo(models.Course, { foreignKey: 'courseId',onUpdate :"CASCADE",onDelete :"CASCADE" });

      

    };
  
    return Level;
  };
  