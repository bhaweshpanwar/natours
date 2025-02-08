const pool = require('./../db');

// Create a new user ////////////////////////////////////role = 'user'
exports.createUser = async ({ name, email, password, role }) => {
  const query = `
    INSERT INTO public."users" ("name", "email", "password","passwordConfirm", "role")
    VALUES ($1, $2, $3,$3, $4)
    RETURNING id, name, email, role;
  `;

  const values = [name, email, password, role];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Find a user by email
exports.findUserByEmail = async (email) => {
  const query = `
      SELECT id, name, email, password,role 
      FROM public."users" 
      WHERE email = $1 AND active = true;
    `;
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

// Find a user by id
exports.findUserById = async (id) => {
  const query = `SELECT id, name , email, password_changed_at,password,role,photo FROM public."users" WHERE id = $1 AND active = true;`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

/*userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};*/

/*exports.changedPasswordAfter = (passwordChangedAt, JWTTimestamp) => {
  if (!passwordChangedAt) {
    console.log('Hello');

    // No password change recorded; return false
    return false;
  }

  const changedTimestamp = Math.floor(
    new Date(passwordChangedAt).getTime() / 1000
  );

  // console.log('passwordChangedAt', passwordChangedAt);
  // console.log('JWTTimestamp', JWTTimestamp);
  return JWTTimestamp < changedTimestamp;
};

exports.createPasswordResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString('hex');

  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  const expirationTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

  return { resetToken, hashedToken, expirationTime };
};*/

exports.updatePasswordResetToken = async (
  userID,
  hashedToken,
  expirationTime
) => {
  const query = `UPDATE public."users"
                SET password_reset_token = $1,
                password_reset_expires = $2
                WHERE id = $3 AND active = true
                RETURNING id, email;`;

  const values = [hashedToken, expirationTime, userID];

  const result = await pool.query(query, values);

  if (result.rowCount === 0) {
    throw new Error('Failed to save password reset token.');
  }

  return result.rows[0];
};
