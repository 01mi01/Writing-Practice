const BASIC_CONNECTORS = ['and', 'but', 'so', 'because'];

const ADVANCED_CONNECTORS = [
  // Additive
  'furthermore',
  'moreover',
  'additionally',
  'besides',
  'in addition',
  'alternatively',
  'what is more',
  'not only that',
  'above all',
  'also',
  'regarding',
  'incidentally',
  'by the way',

  // Comparative - similar
  'likewise',
  'similarly',
  'in the same way',
  'correspondingly',
  'in a similar manner',
  'compared with',
  'in comparison',

  // Comparative - dissimilar
  'on the one hand',
  'on the other hand',
  'by contrast',
  'conversely',
  'in contrast',

  // Appositive - expository
  'that is',
  'in other words',
  'in other terms',
  'to put it differently',
  'namely',
  'to be more specific',
  'in this case',
  'in view of this',

  // Appositive - exemplificatory
  'for instance',
  'for example',
  'to illustrate',
  'such as',
  'as an example',
  'as shown by',
  'in particular',
  'particularly',
  'notably',
  'mainly',
  'especially',
  'as follows',
  'as exemplified by',
  'including',

  // Adversative
  'even though',
  'though',
  'although',
  'however',
  'nevertheless',
  'nonetheless',
  'notwithstanding',
  'despite this',
  'all the same',
  'in spite of this',
  'even so',
  'whereas',
  'after all',
  'even if',

  // Avowal
  'in fact',
  'as a matter of fact',
  'indeed',

  // Corrective
  'instead',
  'rather',
  'on the contrary',
  'at least',
  'or rather',

  // Dismissive
  'in any case',
  'at any rate',
  'anyhow',

  // Causal - simple
  'hence',
  'therefore',
  'consequently',
  'accordingly',
  'thus',

  // Causal - emphatic
  'as a result',
  'in consequence',

  // Causal - specific
  'for this reason',
  'on this basis',
  'for this purpose',
  'with this in mind',
  'to this end',
  'as a consequence',

  // Conditional
  'in that case',
  'otherwise',
  'under the circumstances',
  'provided that',
  'given that',
  'assuming that',
  'in the event that',

  // Temporal - sequential
  'afterwards',
  'after that',
  'subsequently',
  'thereupon',
  'following this',
  'prior to this',

  // Temporal - simultaneous
  'meanwhile',
  'simultaneously',
  'at the same time',
  'in the meantime',

  // Temporal - preceding
  'previously',
  'before that',
  'hitherto',
  'beforehand',
  'thereafter',

  // Temporal - ordered
  'first of all',
  'firstly',
  'secondly',
  'thirdly',
  'to begin with',
  'to start with',
  'in the first place',
  'lastly',

  // Temporal - conclusive
  'finally',
  'at last',
  'in the end',
  'eventually',
  'as a final point',

  // Summary
  'to sum up',
  'in short',
  'briefly',
  'in conclusion',
  'to conclude',
  'to summarize',
  'in summary',
  'in brief',
  'all in all',
  'in essence',
  'overall',
  'on the whole',
  'altogether',
];

module.exports = { BASIC_CONNECTORS, ADVANCED_CONNECTORS };