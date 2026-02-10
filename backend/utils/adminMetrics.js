const { Text, Vocabulary, User } = require("../models");
const { Op } = require("sequelize");
const { calculateStreaks } = require("./streakCalculator");

const getAdminMetrics = async (userIds, period) => {
  const textFilter = { user_id: { [Op.in]: userIds } };

  // Total texts
  const totalTexts = await Text.count({ where: textFilter });

  // Avg word count per text
  const avgWordCountResult = await Text.findOne({
    where: textFilter,
    attributes: [
      [
        require("sequelize").fn("AVG", require("sequelize").col("word_count")),
        "avg_word_count",
      ],
    ],
  });
  const avgWordCount = avgWordCountResult
    ? parseFloat(avgWordCountResult.dataValues.avg_word_count || 0).toFixed(2)
    : 0;

  // Avg spelling errors per text
  const avgSpellingResult = await Text.findOne({
    where: textFilter,
    attributes: [
      [
        require("sequelize").fn(
          "AVG",
          require("sequelize").col("spelling_errors"),
        ),
        "avg_spelling",
      ],
    ],
  });
  const avgSpellingErrors = avgSpellingResult
    ? parseFloat(avgSpellingResult.dataValues.avg_spelling || 0).toFixed(2)
    : 0;

  // Connector usage totals
  const connectorResult = await Text.findOne({
    where: textFilter,
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
  const totalBasic = parseInt(connectorResult.dataValues.total_basic) || 0;
  const totalAdvanced =
    parseInt(connectorResult.dataValues.total_advanced) || 0;
  const totalConnectors = totalBasic + totalAdvanced;
  const basicPercentage =
    totalConnectors > 0
      ? parseFloat(((totalBasic / totalConnectors) * 100).toFixed(2))
      : 0;
  const advancedPercentage =
    totalConnectors > 0
      ? parseFloat(((totalAdvanced / totalConnectors) * 100).toFixed(2))
      : 0;

  // Avg vocabulary list size per user
  const totalVocabWords = await Vocabulary.count({
    where: { user_id: { [Op.in]: userIds } },
  });
  const avgVocabPerUser =
    userIds.length > 0
      ? parseFloat((totalVocabWords / userIds.length).toFixed(2))
      : 0;

  // Calculate streaks for each user and average them
  let totalCurrentStreak = 0;
  let totalLongestStreak = 0;

  for (const userId of userIds) {
    const userTexts = await Text.findAll({
      where: { user_id: userId },
      attributes: ["created_at"],
      raw: true,
    });
    const { currentStreak, longestStreak } = calculateStreaks(userTexts);
    totalCurrentStreak += currentStreak;
    totalLongestStreak += longestStreak;
  }

  const avgCurrentStreak =
    userIds.length > 0
      ? parseFloat((totalCurrentStreak / userIds.length).toFixed(2))
      : 0;
  const avgLongestStreak =
    userIds.length > 0
      ? parseFloat((totalLongestStreak / userIds.length).toFixed(2))
      : 0;

  // Frequency chart (week / month / year)
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
    group: [require("sequelize").literal(`DATE_TRUNC('${period}', created_at)`)],
    order: [
      [
        require("sequelize").literal(`DATE_TRUNC('${period}', created_at)`),
        "ASC",
      ],
    ],
    raw: true,
  });

  // Vocabulary usage over time (per month)
  const vocabUsageOverTime = await Text.findAll({
    where: textFilter,
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

  // Spelling errors over time (per month)
  const spellingErrorsOverTime = await Text.findAll({
    where: textFilter,
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

  return {
    totalTexts,
    avgWordCount: parseFloat(avgWordCount),
    avgSpellingErrors: parseFloat(avgSpellingErrors),
    connectors: {
      total_basic: totalBasic,
      total_advanced: totalAdvanced,
      basic_percentage: basicPercentage,
      advanced_percentage: advancedPercentage,
    },
    avgVocabPerUser,
    avgCurrentStreak,
    avgLongestStreak,
    charts: {
      frequency_data: frequencyData,
      vocabulary_usage_over_time: vocabUsageOverTime,
      spelling_errors_over_time: spellingErrorsOverTime,
    },
  };
};

module.exports = { getAdminMetrics };