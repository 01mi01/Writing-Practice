const { BASIC_CONNECTORS, ADVANCED_CONNECTORS } = require('../constants/connectors');


const countConnectors = (text) => {
  const lowerText = text.toLowerCase();

  let basicCount = 0;
  let advancedCount = 0;
  const countedRanges = [];

  const isOverlapping = (start, end) =>
    countedRanges.some((r) => start < r.end && end > r.start);

  // Count multi-word connectors first
  const multiWordAdvanced = ADVANCED_CONNECTORS.filter((c) => c.includes(" "));
  multiWordAdvanced.forEach((connector) => {
    const regex = new RegExp(`\\b${connector}\\b`, "gi");
    let match;
    while ((match = regex.exec(lowerText)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      if (!isOverlapping(start, end)) {
        console.log("ADVANCED (multi):", connector);
        advancedCount++;
        countedRanges.push({ start, end });
      }
    }
  });

  // Count single-word basic connectors
  const singleWordBasic = BASIC_CONNECTORS.filter((c) => !c.includes(" "));
  singleWordBasic.forEach((connector) => {
    const regex = new RegExp(`\\b${connector}\\b`, "gi");
    let match;
    while ((match = regex.exec(lowerText)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      if (!isOverlapping(start, end)) {
        console.log("BASIC:", connector);
        basicCount++;
        countedRanges.push({ start, end });
      }
    }
  });

  // Count single-word advanced connectors
  const singleWordAdvanced = ADVANCED_CONNECTORS.filter((c) => !c.includes(" "));
  singleWordAdvanced.forEach((connector) => {
    const regex = new RegExp(`\\b${connector}\\b`, "gi");
    let match;
    while ((match = regex.exec(lowerText)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      if (!isOverlapping(start, end)) {
        console.log("ADVANCED (single):", connector);
        advancedCount++;
        countedRanges.push({ start, end });
      }
    }
  });

  return { basicCount, advancedCount };
};

module.exports = { countConnectors };