/**
 * Returns an object's property
 *
 * @param {Array[string]} p - The object's deep property chained in a array of strings
 * @param {Object<string, any>} payload - The property's object
 * 
 * @returns {string}
 */
function getProperty(p, o) {
  return p.reduce((xs, x) => (xs && xs[x] ? xs[x] : null), o)
}

// Exports
exports.getProperty = getProperty
