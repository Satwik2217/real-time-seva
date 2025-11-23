const Vendor = require("../models/Vendor");

exports.findNearbyVendors = async (req, res) => {
  const { customerLon, customerLat } = req.body;
  const maxDistanceMeters = 5000;

  try {
    const nearbyVendors = await Vendor.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(customerLon), parseFloat(customerLat)],
          },
          distanceField: "dist.calculated",
          maxDistance: maxDistanceMeters,
          spherical: true,
          query: { isAvailable: true },
        },
      },
      { $limit: 10 },
    ]);

    return res.status(200).json({ success: true, vendors: nearbyVendors });
  } catch (error) {
    console.error("Geo-Search Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Could not perform proximity search." });
  }
};
