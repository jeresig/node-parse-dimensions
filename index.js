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
        ft: 304.8,
        in: 25.4,
        m: 1000,
        cm: 10,
        mm: 1
    },

    parseDimension: function(str, flip) {
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

                this.convertDimension(dimension, dimension.unit);
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

        // Flip the width/height, if requested
        if (flip) {
            var tmp = dimension.width;
            dimension.width = dimension.height;
            dimension.height = tmp;
        }

        return dimension;
    },

    // Converts all dimensions to be in the specified unit
    convertDimension: function(dimension, unit) {
        unit = unit || "mm";

        for (var prop in dimension) {
            if (typeof dimension[prop] === "string" &&
                    prop !== "original" && prop !== "unit") {
                dimension[prop] = parseFloat(dimension[prop]);
            }

            if (typeof dimension[prop] === "number") {
                // Multiply by the unit
                dimension[prop] = (dimension[prop] *
                    this.conversion[dimension.unit]);

                // Divide by the expected unit and round the result
                dimension[prop] = Math.round(dimension[prop] /
                    this.conversion[unit]);
            }
        }

        dimension.unit = unit;

        return dimension;
    },

    parseDimensions: function(text, flip) {
        text = text.replace(/\(.*?\)/g, function(match) {
            return match.replace(/;/g, ",");
        });

        var parts = text.split(/\s*;\s*/);

        return parts.map(function(part) {
            return this.parseDimension(part, flip);
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