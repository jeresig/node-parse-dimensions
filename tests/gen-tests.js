var dimensions = require("../");

var tests = require("./dimensions.json");

dimensions.debug = true;

Object.keys(tests).forEach(function(type) {
    var dimension = tests[type];
    var output = dimensions.parseDimensions(dimension);

    for (var i = 0; i < output.length; i++) {
        console.log(output[i]);
    }
});