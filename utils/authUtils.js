const changedPasswordAfter = (passwordChangedAt, JWTTimestamp) => {
  if (!passwordChangedAt) {
    // No password change recorded; return false
    return false;
  }
  // console.log(passwordChangedAt);

  // if (passwordChangedAt === null) return false;

  const changedTimestamp = Math.floor(
    new Date(passwordChangedAt).getTime() / 1000
  );

  // console.log('passwordChangedAt', passwordChangedAt);
  // console.log('JWTTimestamp', JWTTimestamp);
  return JWTTimestamp < changedTimestamp;
};

module.exports = changedPasswordAfter;
