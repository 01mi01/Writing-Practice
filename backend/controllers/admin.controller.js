const {
  User,
  Text,
  Vocabulary,
  EnglishLevel,
  Certification,
  TextType,
} = require("../models");
const { Op } = require("sequelize");

exports.getAdminDashboard = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    const {
      minAge,
      maxAge,
      englishLevelIds,
      startDate,
      endDate,
      frequencyPeriod,
    } = req.query;

    // Build user filter - EXCLUDE ADMIN BY DEFAULT
    const userFilter = { is_admin: false };

    // Multiple English levels support
    if (englishLevelIds) {
      const levelIdsArray = englishLevelIds
        .split(",")
        .map((id) => parseInt(id.trim()));
      userFilter.english_level_id = { [Op.in]: levelIdsArray };
    }

    // Age filtering
    if (minAge || maxAge) {
      const today = new Date();

      if (maxAge) {
        const minBirthDate = new Date(
          today.getFullYear() - maxAge - 1,
          today.getMonth(),
          today.getDate(),
        );
        userFilter.birth_date = { [Op.gte]: minBirthDate };
      }

      if (minAge) {
        const maxBirthDate = new Date(
          today.getFullYear() - minAge,
          today.getMonth(),
          today.getDate(),
        );
        userFilter.birth_date = userFilter.birth_date
          ? { ...userFilter.birth_date, [Op.lte]: maxBirthDate }
          : { [Op.lte]: maxBirthDate };
      }
    }

    // Get filtered users
    const filteredUsers = await User.findAll({
      where: userFilter,
      attributes: ["user_id"],
    });

    const userIds = filteredUsers.map((u) => u.user_id);

    if (userIds.length === 0) {
      return res.json({
        message: "No users match the filters",
        statistics: {
          total_users: 0,
          total_texts: 0,
          total_vocab_words: 0,
          avg_texts_per_user: 0,
          avg_vocab_per_user: 0,
          avg_word_count: 0,
        },
        users_by_level: [],
        texts_by_type: [],
        recent_texts: [],
        frequency_data: [],
      });
    }

    // Build text filter (for date range) - FIXED TIMEZONE HANDLING
    const textFilter = { user_id: { [Op.in]: userIds } };

    if (startDate && endDate) {
      const start = new Date(startDate + "T00:00:00.000Z");
      const end = new Date(endDate + "T23:59:59.999Z");

      textFilter.created_at = {
        [Op.between]: [start, end],
      };
    } else if (startDate) {
      const start = new Date(startDate + "T00:00:00.000Z");
      textFilter.created_at = { [Op.gte]: start };
    } else if (endDate) {
      const end = new Date(endDate + "T23:59:59.999Z");
      textFilter.created_at = { [Op.lte]: end };
    }

    const totalUsers = userIds.length;

    const totalTexts = await Text.count({ where: textFilter });

    const totalVocabWords = await Vocabulary.count({
      where: { user_id: { [Op.in]: userIds } },
    });

    const avgTextsPerUser =
      totalUsers > 0 ? (totalTexts / totalUsers).toFixed(2) : 0;

    const avgVocabPerUser =
      totalUsers > 0 ? (totalVocabWords / totalUsers).toFixed(2) : 0;

    const avgWordCount = await Text.findOne({
      where: textFilter,
      attributes: [
        [
          require("sequelize").fn(
            "AVG",
            require("sequelize").col("word_count"),
          ),
          "avg_word_count",
        ],
      ],
    });

    const usersByLevel = await User.findAll({
      where: userFilter,
      attributes: [
        "english_level_id",
        [
          require("sequelize").fn("COUNT", require("sequelize").col("user_id")),
          "count",
        ],
      ],
      include: [
        {
          model: EnglishLevel,
          as: "englishLevel",
          attributes: ["level_name"],
        },
      ],
      group: [
        "User.english_level_id",
        "englishLevel.level_id",
        "englishLevel.level_name",
      ],
    });

    const textsByType = await Text.findAll({
      where: textFilter,
      attributes: [
        "text_type_id",
        [
          require("sequelize").fn("COUNT", require("sequelize").col("text_id")),
          "count",
        ],
      ],
      include: [
        {
          model: TextType,
          as: "textType",
          attributes: ["type_name"],
        },
      ],
      group: ["Text.text_type_id", "textType.type_id", "textType.type_name"],
    });

    const recentTexts = await Text.findAll({
      where: textFilter,
      limit: 10,
      order: [["created_at", "DESC"]],
      attributes: ["text_id", "title", "word_count", "created_at"],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["username"],
        },
      ],
    });

    let period = "month"; // default
    if (frequencyPeriod === "week") period = "week";
    if (frequencyPeriod === "day") period = "day";
    if (frequencyPeriod === "year") period = "year";

    const frequencyData = await Text.findAll({
      where: textFilter,
      attributes: [
        [
          require("sequelize").fn(
            "DATE_TRUNC",
            period,
            require("sequelize").col("created_at"),
          ),
          "period",
        ],
        [
          require("sequelize").fn("COUNT", require("sequelize").col("text_id")),
          "count",
        ],
      ],
      group: [
        require("sequelize").literal(`DATE_TRUNC('${period}', created_at)`),
      ],
      order: [
        [
          require("sequelize").literal(`DATE_TRUNC('${period}', created_at)`),
          "ASC",
        ],
      ],
      raw: true,
    });

    res.json({
      message: "Admin Dashboard",
      filters_applied: {
        minAge: minAge || null,
        maxAge: maxAge || null,
        englishLevelIds: englishLevelIds || null,
        startDate: startDate || null,
        endDate: endDate || null,
        frequencyPeriod: period,
      },
      statistics: {
        total_users: totalUsers,
        total_texts: totalTexts,
        total_vocab_words: totalVocabWords,
        avg_texts_per_user: parseFloat(avgTextsPerUser),
        avg_vocab_per_user: parseFloat(avgVocabPerUser),
        avg_word_count: avgWordCount
          ? parseFloat(avgWordCount.dataValues.avg_word_count).toFixed(2)
          : 0,
      },
      users_by_level: usersByLevel,
      texts_by_type: textsByType,
      recent_texts: recentTexts,
      frequency_data: frequencyData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching admin dashboard" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    const { minAge, maxAge, englishLevelIds } = req.query;

    // EXCLUDE ADMIN BY DEFAULT
    const userFilter = { is_admin: false };

    // Multiple English levels support
    if (englishLevelIds) {
      const levelIdsArray = englishLevelIds
        .split(",")
        .map((id) => parseInt(id.trim()));
      userFilter.english_level_id = { [Op.in]: levelIdsArray };
    }

    // Age filtering
    if (minAge || maxAge) {
      const today = new Date();

      if (maxAge) {
        const minBirthDate = new Date(
          today.getFullYear() - maxAge - 1,
          today.getMonth(),
          today.getDate(),
        );
        userFilter.birth_date = { [Op.gte]: minBirthDate };
      }

      if (minAge) {
        const maxBirthDate = new Date(
          today.getFullYear() - minAge,
          today.getMonth(),
          today.getDate(),
        );
        userFilter.birth_date = userFilter.birth_date
          ? { ...userFilter.birth_date, [Op.lte]: maxBirthDate }
          : { [Op.lte]: maxBirthDate };
      }
    }

    const users = await User.findAll({
      where: userFilter,
      attributes: [
        "user_id",
        "username",
        "email",
        "birth_date",
        "created_at",
        "is_admin",
        "current_streak",
        "longest_streak",
      ],
      include: [
        {
          model: EnglishLevel,
          as: "englishLevel",
          attributes: ["level_name"],
        },
        {
          model: Certification,
          as: "certification",
          attributes: ["certification_name"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json({
      filters_applied: {
        minAge: minAge || null,
        maxAge: maxAge || null,
        englishLevelIds: englishLevelIds || null,
      },
      total_users: users.length,
      users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching users" });
  }
};

exports.getUserMetrics = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    const userId = req.params.userId;
    const { frequencyPeriod } = req.query;

    const user = await User.findByPk(userId, {
      attributes: [
        "user_id",
        "username",
        "email",
        "birth_date",
        "current_streak",
        "longest_streak",
      ],
      include: [
        {
          model: EnglishLevel,
          as: "englishLevel",
          attributes: ["level_name"],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const textCount = await Text.count({ where: { user_id: userId } });

    const vocabCount = await Vocabulary.count({ where: { user_id: userId } });

    const avgWordCount = await Text.findOne({
      where: { user_id: userId },
      attributes: [
        [
          require("sequelize").fn(
            "AVG",
            require("sequelize").col("word_count"),
          ),
          "avg_word_count",
        ],
      ],
    });

    const texts = await Text.findAll({
      where: { user_id: userId },
      attributes: [
        "text_id",
        "title",
        "word_count",
        "spelling_errors",
        "created_at",
      ],
      order: [["created_at", "DESC"]],
    });

    let period = "month"; // default
    if (frequencyPeriod === "week") period = "week";
    if (frequencyPeriod === "day") period = "day";
    if (frequencyPeriod === "year") period = "year";

    const frequencyData = await Text.findAll({
      where: { user_id: userId },
      attributes: [
        [
          require("sequelize").fn(
            "DATE_TRUNC",
            period,
            require("sequelize").col("created_at"),
          ),
          "period",
        ],
        [
          require("sequelize").fn("COUNT", require("sequelize").col("text_id")),
          "count",
        ],
      ],
      group: [
        require("sequelize").literal(`DATE_TRUNC('${period}', created_at)`),
      ],
      order: [
        [
          require("sequelize").literal(`DATE_TRUNC('${period}', created_at)`),
          "ASC",
        ],
      ],
      raw: true,
    });

    res.json({
      user,
      metrics: {
        total_texts: textCount,
        total_vocab_words: vocabCount,
        avg_word_count: avgWordCount
          ? parseFloat(avgWordCount.dataValues.avg_word_count).toFixed(2)
          : 0,
      },
      texts,
      frequency_data: frequencyData,
      frequency_period: period,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching user metrics" });
  }
};
