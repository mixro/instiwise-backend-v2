const isSelfOrAdmin = (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const isAdmin = req.user.isAdmin;

  if (id === userId || isAdmin) {
    return next();
  }

  return res
    .status(403)
    .json({ success: false, message: 'Access denied', error: 'forbidden' });
};

export default isSelfOrAdmin;