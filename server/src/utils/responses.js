function ok(res, data, status) {
  return res.status(status || 200).json({ success: true, data });
}

function fail(res, message, status) {
  return res.status(status || 400).json({ success: false, error: message });
}

module.exports = { ok, fail };
