/*class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
    this.queryParams = [];
  }

  filter() {
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    const conditionsObject = { ...this.queryString };
    excludedFields.forEach((el) => delete conditionsObject[el]);

    if (Object.keys(conditionsObject).length > 0) {
      const operators = ['>', '>=', '<', '<='];
      const whereClauses = [];

      Object.keys(conditionsObject).forEach((key, index) => {
        let value = conditionsObject[key];
        let operator = '=';

        for (let op of operators) {
          if (value.startsWith(op)) {
            operator = op;
            value = value.slice(op.length).trim();
            break;
          }
        }

        whereClauses.push(`${key} ${operator} $${index + 1}`);
        this.queryParams.push(value);
      });

      this.query += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').map((field) => {
        return field.startsWith('-')
          ? `"${field.slice(1)}" DESC`
          : `"${field}" ASC`;
      });
      this.query += ` ORDER BY ${sortBy.join(', ')}`;
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',');
      const includedFields = fields
        .filter((field) => !field.startsWith('-'))
        .map((field) => `"${field.trim()}"`);

      const excludedFields = fields
        .filter((field) => field.startsWith('-'))
        .map((field) => field.slice(1).trim());

      if (excludedFields.length > 0) {
        const allFields = [
          'id',
          'name',
          'rating',
          'price',
          'maxGroupSize',
          'difficulty',
          'ratingsAverage',
          'ratingsQuantity',
          'priceDiscount',
          'summary',
          'description',
          'imageCover',
          'images',
          'duration',
        ];
        const remainingFields = allFields.filter(
          (field) => !excludedFields.includes(field)
        );
        this.query = this.query.replace(
          '*',
          remainingFields.map((field) => `"${field}"`).join(', ')
        );
      } else {
        this.query = this.query.replace('*', includedFields.join(', '));
      }
    }
    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 100;
    const offset = (page - 1) * limit;

    this.query += ` LIMIT $${this.queryParams.length + 1} OFFSET $${
      this.queryParams.length + 2
    }`;
    this.queryParams.push(limit, offset);

    return this;
  }
}

module.exports = APIFeatures;*/

// class APIFeatures {
//   constructor(query, queryString) {
//     this.query = query;
//     this.queryString = queryString;
//     this.queryParams = [];
//   }

//   /**
//    * Dynamically replaces `t.*` with specific fields based on the `fields` query parameter.
//    */
//   limitFields() {
//     if (this.queryString.fields) {
//       const fields = this.queryString.fields.split(',');
//       const includedFields = fields
//         .filter((field) => !field.startsWith('-'))
//         .map((field) => `t."${field.trim()}"`);

//       const excludedFields = fields
//         .filter((field) => field.startsWith('-'))
//         .map((field) => field.slice(1).trim());

//       if (excludedFields.length > 0) {
//         const allFields = [
//           'id',
//           'name',
//           'rating',
//           'price',
//           'maxGroupSize',
//           'difficulty',
//           'ratingsAverage',
//           'ratingsQuantity',
//           'priceDiscount',
//           'summary',
//           'description',
//           'imageCover',
//           'images',
//           'startDates',
//           'duration',
//           'locations',
//           'guides',
//           'start_location_id',
//         ];
//         const remainingFields = allFields.filter(
//           (field) => !excludedFields.includes(field)
//         );
//         this.query = this.query.replace(
//           't.*',
//           remainingFields.map((field) => `t."${field}"`).join(', ')
//         );
//       } else {
//         this.query = this.query.replace('t.*', includedFields.join(', '));
//       }
//     }
//     return this;
//   }

//   /**
//    * Handles filter conditions dynamically.
//    */
//   filter() {
//     const excludedFields = ['page', 'sort', 'limit', 'fields', 'groupBy'];
//     const conditionsObject = { ...this.queryString };
//     excludedFields.forEach((el) => delete conditionsObject[el]);

//     if (Object.keys(conditionsObject).length > 0) {
//       const operators = ['>', '>=', '<', '<='];
//       const whereClauses = [];

//       Object.keys(conditionsObject).forEach((key, index) => {
//         let value = conditionsObject[key];
//         let operator = '=';

//         for (let op of operators) {
//           if (value.startsWith(op)) {
//             operator = op;
//             value = value.slice(op.length).trim();
//             break;
//           }
//         }

//         whereClauses.push(`${key} ${operator} $${index + 1}`);
//         this.queryParams.push(value);
//       });

//       this.query += ` WHERE ${whereClauses.join(' AND ')}`;
//     }

//     return this;
//   }

//   /**
//    * Adds sorting based on query parameters.
//    */
//   sort() {
//     if (this.queryString.sort) {
//       const sortBy = this.queryString.sort.split(',').map((field) => {
//         return field.startsWith('-')
//           ? `"${field.slice(1)}" DESC`
//           : `"${field}" ASC`;
//       });
//       this.query += ` ORDER BY ${sortBy.join(', ')}`;
//     }

//     return this;
//   }

//   /**
//    * Adds pagination to the query.
//    */
//   paginate() {
//     const page = parseInt(this.queryString.page, 10) || 1;
//     const limit = parseInt(this.queryString.limit, 10) || 100;
//     const offset = (page - 1) * limit;

//     this.query += ` LIMIT $${this.queryParams.length + 1} OFFSET $${
//       this.queryParams.length + 2
//     }`;
//     this.queryParams.push(limit, offset);

//     return this;
//   }

//   /**
//    * Dynamically handles `GROUP BY` clauses.
//    */
//   groupBy() {
//     const staticGroupBy = `t.id, sl.description, sl.coordinates`;
//     if (this.queryString.groupBy) {
//       const groupByFields = this.queryString.groupBy
//         .split(',')
//         .map((field) => `t."${field.trim()}"`);
//       this.query += ` GROUP BY ${staticGroupBy}, ${groupByFields.join(', ')}`;
//     } else {
//       this.query += ` GROUP BY ${staticGroupBy}`;
//     }
//     return this;
//   }
// }

// module.exports = APIFeatures;

class APIFeatures {
  constructor(query, queryString = {}) {
    this.query = query;
    this.queryString = queryString;
    this.queryParams = [];
  }

  /**
   * Dynamically replaces `t.*` with specific fields based on the `fields` query parameter.
   */
  limitFields() {
    if (!this.queryString.fields) return this; // Skip if fields parameter is absent

    const fields = this.queryString.fields.split(',');
    const includedFields = fields
      .filter((field) => !field.startsWith('-'))
      .map((field) => `t."${field.trim()}"`);

    const excludedFields = fields
      .filter((field) => field.startsWith('-'))
      .map((field) => field.slice(1).trim());

    if (excludedFields.length > 0) {
      const allFields = [
        'id',
        'name',
        'rating',
        'price',
        'maxGroupSize',
        'difficulty',
        'ratingsAverage',
        'ratingsQuantity',
        'priceDiscount',
        'summary',
        'description',
        'imageCover',
        'images',
        'startDates',
        'duration',
        'locations',
        'guides',
        'start_location_id',
      ];
      const remainingFields = allFields.filter(
        (field) => !excludedFields.includes(field)
      );
      this.query = this.query.replace(
        't.*',
        remainingFields.map((field) => `t."${field}"`).join(', ')
      );
    } else {
      this.query = this.query.replace('t.*', includedFields.join(', '));
    }

    return this;
  }

  /**
   * Handles filter conditions dynamically.
   */
  filter() {
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'groupBy'];
    const conditionsObject = { ...this.queryString };
    excludedFields.forEach((el) => delete conditionsObject[el]);

    if (Object.keys(conditionsObject).length === 0) return this; // Skip if no filters

    const operators = ['>', '>=', '<', '<='];
    const whereClauses = [];

    Object.keys(conditionsObject).forEach((key, index) => {
      let value = conditionsObject[key];
      let operator = '=';

      for (let op of operators) {
        if (value.startsWith(op)) {
          operator = op;
          value = value.slice(op.length).trim();
          break;
        }
      }

      whereClauses.push(`${key} ${operator} $${index + 1}`);
      this.queryParams.push(value);
    });

    this.query += ` WHERE ${whereClauses.join(' AND ')}`;
    return this;
  }

  /**
   * Adds sorting based on query parameters.
   */
  sort() {
    if (!this.queryString.sort) return this; // Skip if sort parameter is absent

    const sortBy = this.queryString.sort.split(',').map((field) => {
      return field.startsWith('-')
        ? `"${field.slice(1)}" DESC`
        : `"${field}" ASC`;
    });

    this.query += ` ORDER BY ${sortBy.join(', ')}`;
    return this;
  }

  /**
   * Adds pagination to the query.
   */
  paginate() {
    const page = parseInt(this.queryString.page || 1, 10);
    const limit = parseInt(this.queryString.limit || 100, 10);
    const offset = (page - 1) * limit;

    this.query += ` LIMIT $${this.queryParams.length + 1} OFFSET $${
      this.queryParams.length + 2
    }`;
    this.queryParams.push(limit, offset);

    return this;
  }

  /**
   * Dynamically handles `GROUP BY` clauses.
   */
  groupBy() {
    const staticGroupBy = `t.id, sl.description, sl.coordinates`;

    if (!this.queryString.groupBy) {
      this.query += ` GROUP BY ${staticGroupBy}`;
      return this;
    }

    const groupByFields = this.queryString.groupBy
      .split(',')
      .map((field) => `t."${field.trim()}"`);
    this.query += ` GROUP BY ${staticGroupBy}, ${groupByFields.join(', ')}`;

    return this;
  }
}

module.exports = APIFeatures;
