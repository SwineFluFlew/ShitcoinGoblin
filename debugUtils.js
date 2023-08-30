const { debugMode } = require('./settings');

const debugLog = (message) => {
    if (debugMode) {
        console.log(message);
    }
};

module.exports = debugLog;