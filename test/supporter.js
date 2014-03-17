var template = require('template-cache');
var path = require('path');

template.load(path.join(__dirname, './support/tpl/'));

exports.template = template;
