module.exports = {
    dimensionRules: [
        [/([\d.]+)\s*(?:mm)?\s*x\s*([\d.]+)\s*mm/, function(match, dimension) {
            dimension.width = match[1];
            dimension.height = match[2];
        }],
        [/([\d.]+)\s*(?:cm)?\s*x\s*([\d.]+)\s*cm/, function(match, dimension) {
            dimension.width = match[1];
            dimension.height = match[2];
        }],
        [/([\d.]+)\s*((?:\d+\/\d+)?)\s*(?:in)?\s*x\s*([\d.]+)\s*((?:\d+\/\d+)?)\s*in/, function(match, dimension) {
            dimension.width = match[1];
            dimension.height = match[3];
        }],
        [/([\d.]+)\s*(?:in)?\s*x\s*([\d.]+)\s*in/, function(match, dimension) {
            dimension.width = match[1];
            dimension.height = match[2];
        }]
    ],

    parseDimension: function(str) {
        var dimension = {
            original: str
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

                for (var prop in dimension) {
                    if (typeof dimension[prop] === "string" && prop !== "original") {
                        dimension[prop] = parseFloat(dimension[prop]);
                    }
                }
                break;
            }
        }

        return dimension;
    },

    parseDimensions: function(text) {
        var parts = text.split(/\s*;\s*/);

        return parts.map(function(part) {
            return this.parseDimension(part);
        }.bind(this));
    },

    stripPunctuation: function(str) {
        return str
            .replace(/\s+/, " ")
            .trim();
    },

    cleanString: function(str) {
        str = str.toLowerCase();
        str = this.stripPunctuation(str);
        return str;
    }
};