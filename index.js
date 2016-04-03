"use strict";

const parseFraction = function(num) {
    const parts = num.split("/");
    return parseFloat(parts[0]) / parseFloat(parts[1]);
};

module.exports = {
    extraRules: [
        [/\((.*?)\)/, function(match, dimension) {
            dimension.label = match[1];
        }],
    ],

    dimensionRules: [
        [/([\d.]+)\s*(?:mm)?\s*[x×]\s*([\d.]+)\s*mm/i, (match, dimension) => {
            dimension.width = match[1];
            dimension.height = match[2];
        }],
        [/([\d.]+)\s*(?:cm)?\s*[x×]\s*([\d.]+)\s*(cm)/i, (match, dimension) => {
            dimension.width = match[1];
            dimension.height = match[2];
            dimension.unit = match[3];
        }],
        [/([\d.]+)\s*((?:\d+\/\d+)?)\s*(?:in)?\s*[x×]\s*([\d.]+)\s*((?:\d+\/\d+)?)\s*(in)/i, (match, dimension) => { // eslint-disable-line max-line
            dimension.width = (parseFloat(match[1]) +
                (match[2] ? parseFraction(match[2]) : 0));
            dimension.height = (parseFloat(match[3]) +
                (match[4] ? parseFraction(match[4]) : 0));
            dimension.unit = match[5];
        }],
        [/([\d.]+)\s*(?:in)?\s*[x×]\s*([\d.]+)\s*(in)/i, (match, dimension) => {
            dimension.width = match[1];
            dimension.height = match[2];
            dimension.unit = match[3];
        }],
        [/^([\d.]+)\s*mm/i, (match, dimension) => {
            dimension.width = match[1];
            dimension.height = match[1];
        }],
        [/^([\d.]+)\s*(cm)/i, (match, dimension) => {
            dimension.width = match[1];
            dimension.height = match[1];
            dimension.unit = match[2];
        }],
        [/^([\d.]+)\s*((?:\d+\/\d+)?)\s*(in)/i, (match, dimension) => {
            dimension.width = (parseFloat(match[1]) +
                (match[2] ? parseFraction(match[2]) : 0));
            dimension.height = (parseFloat(match[1]) +
                (match[2] ? parseFraction(match[2]) : 0));
            dimension.unit = match[3];
        }],
        [/diam.*?([\d.]+)\s*mm/i, (match, dimension) => {
            dimension.width = match[1];
            dimension.height = match[1];
        }],
        [/diam.*?([\d.]+)\s*(cm)/i, (match, dimension) => {
            dimension.width = match[1];
            dimension.height = match[1];
            dimension.unit = match[2];
        }],
        [/diam.*?([\d.]+)\s*((?:\d+\/\d+)?)\s*(in)/i, (match, dimension) => {
            dimension.width = (parseFloat(match[1]) +
                (match[2] ? parseFraction(match[2]) : 0));
            dimension.height = (parseFloat(match[1]) +
                (match[2] ? parseFraction(match[2]) : 0));
            dimension.unit = match[3];
        }],
    ],

    conversion: {
        ft: 304.8,
        in: 25.4,
        m: 1000,
        cm: 10,
        mm: 1,
    },

    parseDimension(str, flip, unit) {
        unit = unit || "mm";

        let dimension = {
            original: str,
            unit: unit,
        };

        str = this.cleanString(str);

        for (const rule of this.dimensionRules) {
            const match = rule[0].exec(str);
            if (match) {
                if (this.debug) {
                    console.log("hit", rule[0]);
                }

                if (!dimension) {
                    dimension = {};
                }

                rule[1].call(this, match, dimension);

                this.convertDimension(dimension, unit);
                break;
            }
        }

        for (const rule of this.extraRules) {
            const match = rule[0].exec(str);
            if (match) {
                if (this.debug) {
                    console.log("extra hit", rule[0]);
                }

                rule[1].call(this, match, dimension);
            }
        }

        // Flip the width/height, if requested
        if (flip) {
            const tmp = dimension.width;
            dimension.width = dimension.height;
            dimension.height = tmp;
        }

        return dimension;
    },

    // Converts all dimensions to be in the specified unit
    convertDimension(dimension, unit) {
        unit = unit || "mm";

        // Bail if no dimension is provided
        if (!dimension.unit) {
            return dimension;
        }

        for (const prop in dimension) {
            if (typeof dimension[prop] === "string" &&
                    prop !== "original" && prop !== "unit") {
                dimension[prop] = parseFloat(dimension[prop]);
            }

            if (typeof dimension[prop] === "number") {
                dimension[prop] = this.convertNumber(
                    dimension[prop], dimension.unit, unit);
            }
        }

        dimension.unit = unit;

        return dimension;
    },

    // Convert a single number from one unit to another
    convertNumber(num, fromUnit, toUnit) {
        // Multiply by the unit
        num = (num * this.conversion[fromUnit.toLowerCase()]);

        // Divide by the expected unit and round the result
        return +(num / this.conversion[toUnit]).toFixed(2);
    },

    parseDimensions(text, flip) {
        text = text.replace(/\(.*?\)/g, (match) => match.replace(/;/g, ","));

        const parts = text.split(/\s*;\s*/);
        return parts.map((part) => this.parseDimension(part, flip));
    },

    stripPunctuation(str) {
        return str
            .replace(/(\d),(\d)/g, "$1.$2")
            .replace(/\s+/, " ")
            .replace(/[\[\]]/g, " ")
            .trim();
    },

    moveParens(str) {
        return str.replace(/(\(.*?\))(.+)$/, "$2 $1");
    },

    cleanString(str) {
        //str = str.toLowerCase();
        str = this.moveParens(str);
        str = this.stripPunctuation(str);
        return str;
    },
};
