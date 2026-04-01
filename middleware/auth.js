function requireAdmin(req, res, next) {
  if (!req.session.admin) {
    return res.status(401).json({ success: false, message: '未登录或登录已失效' });
  }
  next();
}

module.exports = { requireAdmin };
