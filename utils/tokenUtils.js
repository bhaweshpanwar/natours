const crypto = require('crypto');

const createPasswordResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  const expirationTime = new Date(Date.now() + 10 * 60 * 1000);

  return { resetToken, hashedToken, expirationTime };
};

module.exports = createPasswordResetToken;
