const Business = require('../MongoDb/models/userModels/Business');

module.exports = async (req, res, next) => {
  // Extract businessId from headers, query parameters, or request body
  let businessId = req.headers['x-business-id'] || req.query.businessId || req.body?.businessId;

  if (!businessId) {
    try {
      let defaultBiz = await Business.findOne({});
      if (!defaultBiz) {
        defaultBiz = await Business.create({
          name: 'Default Business',
          currency: 'INR'
        });
      }
      businessId = defaultBiz._id.toString();
    } catch (err) {
      console.error('Error resolving businessId:', err.message);
      return res.status(400).json({ error: "businessId is required" });
    }
  }

  req.businessId = businessId;
  res.setHeader('x-business-id', businessId);
  next();
};
