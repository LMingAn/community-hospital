function requireAdmin(req, res, next) {
  if (!req.session.admin) return res.status(401).json({ success: false, message: '管理员未登录或登录已失效' });
  next();
}

function requireDoctor(req, res, next) {
  if (!req.session.doctor) return res.status(401).json({ success: false, message: '医生未登录或登录已失效' });
  next();
}

function requirePatient(req, res, next) {
  if (!req.session.patient) return res.status(401).json({ success: false, message: '患者未登录或登录已失效' });
  next();
}

module.exports = { requireAdmin, requireDoctor, requirePatient };
