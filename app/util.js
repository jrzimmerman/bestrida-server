module.exports = {
  stringify: function (obj) {
    return JSON.stringify(obj, null, 2);
  },

  csvString: function (string) {
    var escapedString = string.replace(/\"/g, '""');
    var quotedString = '"' + escapedString + '"';
    return quotedString;
  }
};
