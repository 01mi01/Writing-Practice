const {
  User,
  Text,
  Vocabulary,
  EnglishLevel,
  Certification,
  TextType,
} = require("../models");
const { Op } = require("sequelize");
const { getAdminMetrics } = require("../utils/adminMetrics");

exports.getAdminDashboard = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    const {
      minAge,
      maxAge,
      englishLevelIds,
      certificationIds,
      startDate,
      endDate,
      frequencyPeriod,
    } = req.query;

    // Build user filter - EXCLUDE ADMIN BY DEFAULT
    // Date filter applies to users.created_at ONLY
    const userFilter = { is_admin: false };

    // English level filter
    if (englishLevelIds) {
      const levelIdsArray = englishLevelIds
        .split(",")
        .map((id) => parseInt(id.trim()));
      userFilter.english_level_id = { [Op.in]: levelIdsArray };
    }

    // Certification filter
    if (certificationIds) {
      const certIdsArray = certificationIds
        .split(",")
        .map((id) => parseInt(id.trim()));
      userFilter.certification_type_id = { [Op.in]: certIdsArray };
    }

    // Age filter
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

    // Date filter applies to users.created_at ONLY
    if (startDate && endDate) {
      userFilter.created_at = {
        [Op.between]: [
          new Date(startDate + "T00:00:00.000Z"),
          new Date(endDate + "T23:59:59.999Z"),
        ],
      };
    } else if (startDate) {
      userFilter.created_at = { [Op.gte]: new Date(startDate + "T00:00:00.000Z") };
    } else if (endDate) {
      userFilter.created_at = { [Op.lte]: new Date(endDate + "T23:59:59.999Z") };
    }

    // Get filtered users
    const filteredUsers = await User.findAll({
      where: userFilter,
      attributes: ["user_id"],
    });

    const userIds = filteredUsers.map((u) => u.user_id);

    // Empty result shape
    if (userIds.length === 0) {
      return res.json({
        filters_applied: {
          minAge: minAge || null,
          maxAge: maxAge || null,
          englishLevelIds: englishLevelIds || null,
          certificationIds: certificationIds || null,
          startDate: startDate || null,
          endDate: endDate || null,
          frequencyPeriod: frequencyPeriod || "month",
        },
        statistics: {
          total_users: 0,
          total_texts: 0,
          avg_word_count: 0,
          avg_spelling_errors: 0,
          avg_vocab_per_user: 0,
          avg_current_streak: 0,
          avg_longest_streak: 0,
        },
        connector_usage: {
          total_basic: 0,
          total_advanced: 0,
          basic_percentage: 0,
          advanced_percentage: 0,
        },
        users_by_level: [],
        texts_by_type: [],
        charts: {
          frequency_data: [],
          vocabulary_usage_over_time: [],
          spelling_errors_over_time: [],
        },
      });
    }

    // Resolve frequency period
    let period = "month";
    if (frequencyPeriod === "week") period = "week";
    if (frequencyPeriod === "year") period = "year";

    // Get all metrics from utility
    const metrics = await getAdminMetrics(userIds, period);

    // Users by english level
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

    // Texts by type
    const textsByType = await Text.findAll({
      where: { user_id: { [Op.in]: userIds } },
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

    res.json({
      filters_applied: {
        minAge: minAge || null,
        maxAge: maxAge || null,
        englishLevelIds: englishLevelIds || null,
        certificationIds: certificationIds || null,
        startDate: startDate || null,
        endDate: endDate || null,
        frequencyPeriod: period,
      },
      statistics: {
        total_users: userIds.length,
        total_texts: metrics.totalTexts,
        avg_word_count: metrics.avgWordCount,
        avg_spelling_errors: metrics.avgSpellingErrors,
        avg_vocab_per_user: metrics.avgVocabPerUser,
        avg_current_streak: metrics.avgCurrentStreak,
        avg_longest_streak: metrics.avgLongestStreak,
      },
      connector_usage: metrics.connectors,
      users_by_level: usersByLevel,
      texts_by_type: textsByType,
      charts: metrics.charts,
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
