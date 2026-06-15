module.exports = (req, res, next) => {
  // Extract businessId from headers, query parameters, or request body
  const businessId = req.headers['x-business-id'] || req.query.businessId || req.body.businessId;

  if (!businessId) {
    return res.status(400).json({ error: "businessId is required" });
  }

  req.businessId = businessId;
  next();
};
