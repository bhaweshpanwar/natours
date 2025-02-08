const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const pool = require('../db');

exports.deleteOne = (tableName) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const query = `DELETE FROM public."${tableName}" WHERE id = $1`;
    const result = await pool.query(query, [id]);

    if (result.rowCount === 0) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.createOne = (tableName) =>
  catchAsync(async (req, res, next) => {
    const { body } = req;
    const columns = Object.keys(body).join(', ');
    const values = Object.values(body);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

    const query = `INSERT INTO public."${tableName}" (${columns}) VALUES (${placeholders}) RETURNING *;`;
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return next(new AppError('Failed to create document', 400));
    }

    res.status(201).json({
      status: 'success',
      data: {
        data: result.rows[0],
      },
    });
  });

exports.updateOne = (tableName) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { body } = req;

    const updates = Object.keys(body)
      .map((key, i) => `"${key}" = $${i + 2}`)
      .join(', ');
    const values = [id, ...Object.values(body)];

    if (updates.length > 0) {
      const query = `UPDATE public."${tableName}" SET ${updates} WHERE id = $1 RETURNING *;`;
      const result = await pool.query(query, values);

      if (result.rowCount === 0) {
        return next(new AppError('No document found with that ID', 404));
      }

      res.status(200).json({
        status: 'success',
        data: {
          data: result.rows[0],
        },
      });
    } else {
      return next(new AppError('No updates provided', 400));
    }
  });

exports.getOne = (tableName) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const query = `SELECT * FROM public."${tableName}" WHERE id = $1;`;
    const result = await pool.query(query, [id]);

    if (result.rowCount === 0) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: result.rows[0],
      },
    });
  });

exports.getAll = (tableName, filterOptions = '') =>
  catchAsync(async (req, res, next) => {
    const { query } = req;
    let filterQuery = '';

    if (filterOptions) {
      const filters = Object.entries(filterOptions)
        .map(([key, value]) => `"${key}" = '${value}'`)
        .join(' AND ');
      filterQuery = `WHERE ${filters}`;
    }

    const sqlQuery = `SELECT * FROM public."${tableName}" ${filterQuery};`;
    const result = await pool.query(sqlQuery);

    res.status(200).json({
      status: 'success',
      results: result.rowCount,
      data: {
        data: result.rows,
      },
    });
  });
