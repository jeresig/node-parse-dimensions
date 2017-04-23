# Node.js Parse Dimensions

Parse physical object dimensions and convert them into a standardized form.

## Example

```
const pd = require("parse-dimensions");

console.log(pd.parseDimension("4in x 5in"));
// { original: '4in x 5in', unit: 'mm', width: 101.6, height: 127 }

console.log(pd.parseDimension("4.2cm x 5.1cm"));
// { original: '4.2cm x 5.1cm', unit: 'mm', width: 42, height: 51 }
```

You can see a full list of all the types of dimension strings handled in the [test file](https://github.com/jeresig/node-parse-dimensions/blob/master/tests/dimensions.json).

Created by [John Resig](https://johnresig.com/) for parsing dimensions from museums, universities, galleries, and dealers for [Ukiyo-e.org](https://ukiyo-e.org/).

## Installation

```
npm install parse-dimensions
```

## API

### `parseDimension(dimensionString, [flip])`

Parse a string that holds some dimensions and returns an object
representing the dimensions. By default it assumes that the width is
first. Pass a boolean as the second argument to assume the height is first.

### `parseDimensions(dimensionsString, [flip])`

Parse a string that holds a set of dimensions and returns an array of objects
representing the dimensions. It assumes that the dimensions are separated by
semicolons by default.

### `convertNumber(number, fromUnit, toUnit)`

Convert a number from one dimension unit to another. For example:
`convertNumber(10, "mm", "cm")` will return `1`.

### `convertDimension(dimensionObject, toUnit)`

Given a dimension object (as produced by `parseDimension`) convert it to use
a different dimension. Returns the modified dimension object.

## License

Released under an MIT license.
