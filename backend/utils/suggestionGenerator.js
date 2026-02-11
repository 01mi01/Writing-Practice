const {
  BASIC_CONNECTORS,
  ADVANCED_CONNECTORS,
} = require("../constants/connectors");

// Configuration - easy to change
const CONFIG = {
  MIN_WORD_COUNT: 100,
  BASIC_CONNECTOR_MAX_RATIO: 0.15,
  MIN_WORDS_FOR_CONNECTOR_ANALYSIS: 50,
};

// Helper function to get random connectors
const getRandomConnectors = (connectors, count) => {
  const shuffled = [...connectors].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

// Helper function to get multi-word connectors
const getMultiWordConnectors = (connectors) => {
  return connectors.filter((c) => c.includes(" "));
};

const generateSuggestions = (wordCount, basicCount, advancedCount) => {
  const totalConnectors = basicCount + advancedCount;
  const basicRatio = wordCount > 0 ? basicCount / wordCount : 0;

  // ONLY ONE suggestion is returned - mutually exclusive rules
  // Evaluated top to bottom - FIRST match wins

  // ========================================
  // CASE 1: No connectors at all (highest priority)
  // ========================================
  if (
    wordCount >= CONFIG.MIN_WORDS_FOR_CONNECTOR_ANALYSIS &&
    totalConnectors === 0
  ) {
    return {
      type: "missing_connectors",
      severity: "warning",
      message: "El texto no contiene conectores.",
      recommendation:
        "Comienza utilizando conectores básicos para enlazar tus ideas y mejorar la fluidez.",
      suggested_connectors: BASIC_CONNECTORS,
    };
  }

  // ========================================
  // CASE 2: At least one connector, but text is short
  // ========================================
  if (wordCount < CONFIG.MIN_WORD_COUNT && totalConnectors > 0) {
    const multiWordConnectors = getMultiWordConnectors(ADVANCED_CONNECTORS);
    const randomMultiWord = getRandomConnectors(multiWordConnectors, 8);

    return {
      type: "length",
      severity: "warning",
      message: `El texto es demasiado corto (${wordCount} palabras).`,
      recommendation:
        "Intenta expandir tus ideas añadiendo más detalles, ejemplos o explicaciones. Utiliza conectores avanzados para desarrollar y relacionar tus ideas. Intenta alcanzar al menos 100 palabras.",
      suggested_connectors: randomMultiWord,
    };
  }

  // ========================================
  // CASE 3: Text is long enough (≥100 words) - analyze connector quality
  // ========================================
  if (wordCount >= CONFIG.MIN_WORD_COUNT) {
    // Sub-case 3a: Too many basic connectors
    if (basicRatio > CONFIG.BASIC_CONNECTOR_MAX_RATIO) {
      const randomAdvanced = getRandomConnectors(ADVANCED_CONNECTORS, 10);

      return {
        type: "excessive_basic_connectors",
        severity: "info",
        message: "Se detectó un uso frecuente de conectores básicos.",
        recommendation:
          'Intenta reemplazar algunos conectores básicos (and, but, so) con alternativas avanzadas para mejorar la claridad y fluidez del texto.',
        suggested_connectors: randomAdvanced,
      };
    }

    // Sub-case 3b: Good connector ratio (≥100 words, acceptable ratio)
    return {
      type: "positive_feedback",
      severity: "success",
      message: `¡Excelente trabajo! El texto tiene una longitud adecuada (${wordCount} palabras) y un uso balanceado de conectores.`,
      recommendation:
        "¡Sigue practicando!",
      suggested_connectors: [],
    };
  }

  // ========================================
  // FALLBACK (should never reach here, but just in case)
  // ========================================
  return {
    type: "no_suggestion",
    severity: "info",
    message: `El texto es demasiado corto (${wordCount} palabras).`,
    recommendation: "Continúa escribiendo para recibir sugerencias.",
    suggested_connectors: [],
  };
};

module.exports = { generateSuggestions, CONFIG };
