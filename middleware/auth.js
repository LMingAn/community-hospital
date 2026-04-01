function requireAdmin(req, res, next) {
  const adminToken = req.signedCookies.adminToken;
  if (!adminToken) {
    return res.status(401).json({ success: false, message: '未登录或登录已过期' });
  }
  next();
}

module.exports = { requireAdmin };
