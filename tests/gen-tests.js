var dimensions = require("../");

var tests = require("./dimensions.json");

Object.keys(tests).forEach(function(type) {
    var dimension = tests[type];

    console.log(dimensions.parseDimensions(dimension));
});