var template = require('template-cache').namespace('test');
var path = require('path');

template.load(path.join(__dirname, './support/tpl/'));

exports.template = template;
