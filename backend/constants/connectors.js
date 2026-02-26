const BASIC_CONNECTORS = ['and', 'but', 'so', 'because'];

const ADVANCED_CONNECTORS = [
  // Contrast & concession
  'however', 'nevertheless', 'nonetheless', 'notwithstanding',
  'whereas', 'on the other hand', 'in contrast', 'that said',
  'even so', 'all the same', 'be that as it may', 'despite this',
  'on the contrary', 'conversely', 'by contrast', 'yet',
  'although', 'even though', 'in spite of this',

  // Addition & reinforcement
  'furthermore', 'moreover', 'additionally', 'in addition',
  'what is more', 'not only that', 'above all', 'besides',
  'equally important', 'coupled with this', 'alongside this',
  'to add to this', 'on top of that',

  // Cause & effect
  'consequently', 'therefore', 'thus', 'as a result',
  'hence', 'for this reason', 'as a consequence', 'accordingly',
  'it follows that', 'this means that', 'owing to this',

  // Sequence & order
  'first of all', 'firstly', 'secondly', 'thirdly',
  'to begin with', 'to start with', 'subsequently',
  'following this', 'prior to this', 'at this point',
  'eventually', 'finally', 'lastly', 'in the first place',
  'to conclude', 'as a final point',

  // Clarification & exemplification
  'for instance', 'for example', 'in particular', 'in other words',
  'that is to say', 'to illustrate', 'namely', 'to put it differently',
  'such as', 'as an example', 'to be more specific',
  'in this case', 'as shown by',

  // Summary & conclusion
  'in conclusion', 'to summarize', 'to sum up', 'in summary',
  'overall', 'in short', 'in brief', 'all in all',
  'taking everything into account', 'on balance', 'in the end',
  'to conclude', 'in essence',

  // Similarity
  'similarly', 'likewise', 'in the same way', 'by the same token',
  'correspondingly', 'in a similar manner',

  // Time & simultaneity
  'meanwhile', 'simultaneously', 'at the same time', 'in the meantime',
  'thereafter', 'beforehand', 'in the interim',

  // Condition & supposition
  'alternatively', 'otherwise', 'provided that', 'in that case',
  'under these circumstances', 'given that', 'assuming that',
  'in the event that',

  // Emphasis
  'indeed', 'in fact', 'as a matter of fact', 'undoubtedly',
  'certainly', 'without doubt', 'it is worth noting',
  'significantly', 'notably', 'above all',
];

module.exports = { BASIC_CONNECTORS, ADVANCED_CONNECTORS };