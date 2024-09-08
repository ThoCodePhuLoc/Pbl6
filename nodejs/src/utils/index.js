'user strict';
const _ = require('lodash');

const getInforData = (data, pick) => {
    return _.pick(data, pick);
}

module.exports = {
    getInforData,
}