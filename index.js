var parseFraction = function(num) {
    var parts = num.split("/");
    return parseFloat(parts[0]) / parseFloat(parts[1]);
};

module.exports = {
    extraRules: [
        [/\((.*?)\)/, function(match, dimension) {
            dimension.label = match[1];
        }]
    ],

    dimensionRules: [
        [/([\d.]+)\s*(?:mm)?\s*x\s*([\d.]+)\s*mm/, function(match, dimension) {
            dimension.width = match[1];
            dimension.height = match[2];
        }],
        [/([\d.]+)\s*(?:cm)?\s*x\s*([\d.]+)\s*(cm)/, function(match, dimension) {
            dimension.width = match[1];
            dimension.height = match[2];
            dimension.unit = match[3];
        }],
        [/([\d.]+)\s*((?:\d+\/\d+)?)\s*(?:in)?\s*x\s*([\d.]+)\s*((?:\d+\/\d+)?)\s*(in)/, function(match, dimension) {
            dimension.width = (parseFloat(match[1]) +
                (match[2] ? parseFraction(match[2]) : 0));
            dimension.height = (parseFloat(match[3]) +
                (match[4] ? parseFraction(match[4]) : 0));
            dimension.unit = match[5];
        }],
        [/([\d.]+)\s*(?:in)?\s*x\s*([\d.]+)\s*(in)/, function(match, dimension) {
            dimension.width = match[1];
            dimension.height = match[2];
            dimension.unit = match[3];
        }],
        [/^([\d.]+)\s*mm/, function(match, dimension) {
            dimension.width = match[1];
            dimension.height = match[1];
        }],
        [/^([\d.]+)\s*(cm)/, function(match, dimension) {
            dimension.width = match[1];
            dimension.height = match[1];
            dimension.unit = match[2];
        }],
        [/^([\d.]+)\s*((?:\d+\/\d+)?)\s*(in)/, function(match, dimension) {
            dimension.width = (parseFloat(match[1]) +
                (match[2] ? parseFraction(match[2]) : 0));
            dimension.height = (parseFloat(match[1]) +
                (match[2] ? parseFraction(match[2]) : 0));
            dimension.unit = match[3];
        }]
    ],

    conversion: {
        "ft": 304.8,
        "in": 25.4,
        "cm": 10,
        "mm": 1
    },

    parseDimension: function(str) {
        var dimension = {
            original: str,
            unit: "mm"
        };

        str = this.cleanString(str);

        for (var i = 0; i < this.dimensionRules.length; i++) {
            var rule = this.dimensionRules[i];
            var match = rule[0].exec(str);
            if (match) {
                if (this.debug) {
                    console.log("hit", rule[0]);
                }

                if (!dimension) {
                    dimension = {};
                }

                rule[1].call(this, match, dimension);

                this.convertDimension(dimension);
                break;
            }
        }

        for (var i = 0; i < this.extraRules.length; i++) {
            var rule = this.extraRules[i];
            var match = rule[0].exec(str);
            if (match) {
                if (this.debug) {
                    console.log("extra hit", rule[0]);
                }

                rule[1].call(this, match, dimension);
            }
        }

        return dimension;
    },

    // Converts all dimensions to be in millimeters
    convertDimension: function(dimension) {
        for (var prop in dimension) {
            if (typeof dimension[prop] === "string" &&
                    prop !== "original" && prop !== "unit") {
                dimension[prop] = parseFloat(dimension[prop]);
            }

            if (typeof dimension[prop] === "number") {
                // Multiply by the unit and round the result
                dimension[prop] = Math.round(dimension[prop] *
                    this.conversion[dimension.unit]);
            }
        }

        dimension.unit = "mm";

        return dimension;
    },

    parseDimensions: function(text) {
        text = text.replace(/\(.*?\)/g, function(match) {
            return match.replace(/;/g, ",");
        });

        var parts = text.split(/\s*;\s*/);

        return parts.map(function(part) {
            return this.parseDimension(part);
        }.bind(this));
    },

    stripPunctuation: function(str) {
        return str
            .replace(/(\d),(\d)/g, "$1.$2")
            .replace(/\s+/, " ")
            .trim();
    },

    moveParens: function(str) {
        return str.replace(/(\(.*?\))(.+)$/, "$2 $1");
    },

    cleanString: function(str) {
        //str = str.toLowerCase();
        str = this.moveParens(str);
        str = this.stripPunctuation(str);
        return str;
    }
};