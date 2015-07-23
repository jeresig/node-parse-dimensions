var dimensions = require("../");

var tests = require("./dimensions.json");

Object.keys(tests).forEach(function(type) {
    var dimension = tests[type];
    var output = dimensions.parseDimensions(dimension);

    for (var i = 0; i < output.length; i++) {
        if (!output[i].height) {
            console.log(output[i]);
        }
    }
});