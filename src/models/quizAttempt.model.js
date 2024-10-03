module.exports = (sequelize, DataTypes) => {
    const QuizAttempt = sequelize.define('QuizAttempt', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        studentId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'Students', key: 'id' },
        },
        quizId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'Quizzes', key: 'id' },
        },
        score: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        maxScore: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        timestamps: true,
    });

    QuizAttempt.associate = function (models) {
        QuizAttempt.belongsTo(models.Student, { foreignKey: 'studentId' });
        QuizAttempt.belongsTo(models.Quiz, { foreignKey: 'quizId' });
    };

    return QuizAttempt;
};
