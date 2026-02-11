const { BASIC_CONNECTORS, ADVANCED_CONNECTORS } = require('../constants/connectors');


const countConnectors = (text) => {
  const lowerText = text.toLowerCase();
  
  let basicCount = 0;
  let advancedCount = 0;
  
  // Count multi-word connectors first (to avoid double-counting)
  const multiWordConnectors = ADVANCED_CONNECTORS.filter(c => c.includes(' '));
  multiWordConnectors.forEach(connector => {
    const regex = new RegExp(`\\b${connector}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) {
      advancedCount += matches.length;
    }
  });
  
  // Count single-word connectors
  const singleWordBasic = BASIC_CONNECTORS.filter(c => !c.includes(' '));
  singleWordBasic.forEach(connector => {
    const regex = new RegExp(`\\b${connector}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) {
      basicCount += matches.length;
    }
  });
  
  const singleWordAdvanced = ADVANCED_CONNECTORS.filter(c => !c.includes(' '));
  singleWordAdvanced.forEach(connector => {
    const regex = new RegExp(`\\b${connector}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) {
      advancedCount += matches.length;
    }
  });
  
  return { basicCount, advancedCount };
};

module.exports = { countConnectors };