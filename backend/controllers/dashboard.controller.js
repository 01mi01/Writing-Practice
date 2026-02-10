const { User, Text, Vocabulary, TextType } = require("../models");
const { Op } = require("sequelize");
const { calculateStreaks } = require("../utils/streakCalculator");

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Get all texts for streak calculation
    const allTexts = await Text.findAll({
      where: { user_id: userId },
      attributes: ["created_at"],
      raw: true,
    });

    // Calculate streaks from text dates
    const { currentStreak, longestStreak } = calculateStreaks(allTexts);

    // Update user streak fields in database
    await User.update(
      {
        current_streak: currentStreak,
        longest_streak: longestStreak,
        last_activity_date:
          allTexts.length > 0
            ? allTexts.sort(
                (a, b) => new Date(b.created_at) - new Date(a.created_at),
              )[0].created_at
            : null,
      },
      { where: { user_id: userId } },
    );

    // Total texts written
    const totalTexts = await Text.count({
      where: { user_id: userId },
    });

    // Total words written (sum of all word_count)
    const totalWordsResult = await Text.findOne({
      where: { user_id: userId },
      attributes: [
        [
          require("sequelize").fn(
            "SUM",
            require("sequelize").col("word_count"),
          ),
          "total_words",
        ],
      ],
    });
    const totalWords = totalWordsResult
      ? parseInt(totalWordsResult.dataValues.total_words) || 0
      : 0;

    // Average word count per text
    const avgWordCountResult = await Text.findOne({
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
    const avgWordCount = avgWordCountResult
      ? parseFloat(avgWordCountResult.dataValues.avg_word_count).toFixed(2)
      : 0;

    // Vocabulary words count
    const vocabCount = await Vocabulary.count({
      where: { user_id: userId },
    });

    // Frequency data - texts per month
    const frequencyDataMonth = await Text.findAll({
      where: { user_id: userId },
      attributes: [
        [
          require("sequelize").fn(
            "DATE_TRUNC",
            "month",
            require("sequelize").col("created_at"),
          ),
          "period",
        ],
        [
          require("sequelize").fn("COUNT", require("sequelize").col("text_id")),
          "count",
        ],
      ],
      group: [require("sequelize").literal(`DATE_TRUNC('month', created_at)`)],
      order: [
        [
          require("sequelize").literal(`DATE_TRUNC('month', created_at)`),
          "ASC",
        ],
      ],
      raw: true,
    });

    // Frequency data - texts per week
    const frequencyDataWeek = await Text.findAll({
      where: { user_id: userId },
      attributes: [
        [
          require("sequelize").fn(
            "DATE_TRUNC",
            "week",
            require("sequelize").col("created_at"),
          ),
          "period",
        ],
        [
          require("sequelize").fn("COUNT", require("sequelize").col("text_id")),
          "count",
        ],
      ],
      group: [require("sequelize").literal(`DATE_TRUNC('week', created_at)`)],
      order: [
        [require("sequelize").literal(`DATE_TRUNC('week', created_at)`), "ASC"],
      ],
      raw: true,
    });

    // Frequency data - texts per year
    const frequencyDataYear = await Text.findAll({
      where: { user_id: userId },
      attributes: [
        [
          require("sequelize").fn(
            "DATE_TRUNC",
            "year",
            require("sequelize").col("created_at"),
          ),
          "period",
        ],
        [
          require("sequelize").fn("COUNT", require("sequelize").col("text_id")),
          "count",
        ],
      ],
      group: [require("sequelize").literal(`DATE_TRUNC('year', created_at)`)],
      order: [
        [require("sequelize").literal(`DATE_TRUNC('year', created_at)`), "ASC"],
      ],
      raw: true,
    });

    // Total spelling errors (overall)
    const totalSpellingErrorsResult = await Text.findOne({
      where: { user_id: userId },
      attributes: [
        [
          require("sequelize").fn(
            "SUM",
            require("sequelize").col("spelling_errors"),
          ),
          "total_spelling_errors",
        ],
      ],
    });
    const totalSpellingErrors = totalSpellingErrorsResult
      ? parseInt(totalSpellingErrorsResult.dataValues.total_spelling_errors) ||
        0
      : 0;

    // Connector usage - calculate percentages
    const connectorStats = await Text.findOne({
      where: { user_id: userId },
      attributes: [
        [
          require("sequelize").fn(
            "SUM",
            require("sequelize").col("basic_connectors_count"),
          ),
          "total_basic",
        ],
        [
          require("sequelize").fn(
            "SUM",
            require("sequelize").col("advanced_connectors_count"),
          ),
          "total_advanced",
        ],
      ],
    });

    const totalBasic = parseInt(connectorStats.dataValues.total_basic) || 0;
    const totalAdvanced =
      parseInt(connectorStats.dataValues.total_advanced) || 0;
    const totalConnectors = totalBasic + totalAdvanced;

    const basicPercentage =
      totalConnectors > 0
        ? ((totalBasic / totalConnectors) * 100).toFixed(2)
        : 0;
    const advancedPercentage =
      totalConnectors > 0
        ? ((totalAdvanced / totalConnectors) * 100).toFixed(2)
        : 0;

    // Vocabulary usage over time (line chart data)
    const vocabUsageOverTime = await Text.findAll({
      where: { user_id: userId },
      attributes: [
        [
          require("sequelize").fn(
            "DATE_TRUNC",
            "month",
            require("sequelize").col("created_at"),
          ),
          "period",
        ],
        [
          require("sequelize").fn(
            "SUM",
            require("sequelize").col("vocab_words_used"),
          ),
          "total_vocab_used",
        ],
      ],
      group: [require("sequelize").literal(`DATE_TRUNC('month', created_at)`)],
      order: [
        [
          require("sequelize").literal(`DATE_TRUNC('month', created_at)`),
          "ASC",
        ],
      ],
      raw: true,
    });

    // Spelling errors over time (line chart data)
    const spellingErrorsOverTime = await Text.findAll({
      where: { user_id: userId },
      attributes: [
        [
          require("sequelize").fn(
            "DATE_TRUNC",
            "month",
            require("sequelize").col("created_at"),
          ),
          "period",
        ],
        [
          require("sequelize").fn(
            "AVG",
            require("sequelize").col("spelling_errors"),
          ),
          "avg_errors",
        ],
      ],
      group: [require("sequelize").literal(`DATE_TRUNC('month', created_at)`)],
      order: [
        [
          require("sequelize").literal(`DATE_TRUNC('month', created_at)`),
          "ASC",
        ],
      ],
      raw: true,
    });

    // Word count over time (line chart data)
    const wordCountOverTime = await Text.findAll({
      where: { user_id: userId },
      attributes: [
        [
          require("sequelize").fn(
            "DATE_TRUNC",
            "month",
            require("sequelize").col("created_at"),
          ),
          "period",
        ],
        [
          require("sequelize").fn(
            "AVG",
            require("sequelize").col("word_count"),
          ),
          "avg_word_count",
        ],
      ],
      group: [require("sequelize").literal(`DATE_TRUNC('month', created_at)`)],
      order: [
        [
          require("sequelize").literal(`DATE_TRUNC('month', created_at)`),
          "ASC",
        ],
      ],
      raw: true,
    });

    // Text distribution by type
    const textsByType = await Text.findAll({
      where: { user_id: userId },
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
      summary: {
        total_texts: totalTexts,
        total_words_written: totalWords,
        avg_word_count: parseFloat(avgWordCount),
        vocabulary_size: vocabCount,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        total_spelling_errors: totalSpellingErrors,
      },
      connector_usage: {
        total_basic: totalBasic,
        total_advanced: totalAdvanced,
        basic_percentage: parseFloat(basicPercentage),
        advanced_percentage: parseFloat(advancedPercentage),
      },
      charts: {
        frequency_per_week: frequencyDataWeek,
        frequency_per_month: frequencyDataMonth,
        frequency_per_year: frequencyDataYear,
        vocabulary_usage_over_time: vocabUsageOverTime,
        spelling_errors_over_time: spellingErrorsOverTime,
        word_count_over_time: wordCountOverTime,
        texts_by_type: textsByType,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching dashboard" });
  }
};
