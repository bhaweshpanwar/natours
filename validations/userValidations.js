const Joi = require('joi');

const userSchema = Joi.object({
  name: Joi.string().min(3).max(30).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 3 characters',
    'string.max': 'Name must be less than or equal to 30 characters',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'A valid email is required',
    'string.empty': 'Email is required',
  }),
  password: Joi.string().min(8).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 8 characters',
  }),
  passwordConfirm: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords must match',
    'string.empty': 'Password confirmation is required',
  }),
  role: Joi.string().valid('user', 'admin').default('user'),
});

module.exports = { userSchema };
