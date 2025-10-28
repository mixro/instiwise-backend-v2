const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ success: false, message: 'Unauthorized', error: 'auth_error' });
  }

  if (!req.user.isAdmin) {
    return res
      .status(403)
      .json({ success: false, message: 'Admin access required', error: 'forbidden' });
  }

  next();
};

export default verifyAdmin;