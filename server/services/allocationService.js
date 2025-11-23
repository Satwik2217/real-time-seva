const Vendor = require("../Models/Vendor");

const WEIGHTS = {
  DISTANCE: 0.4,
  RATING: 0.5,
  AVAILABILITY: 0.1,
};

function calculateScore(distanceKm, rating) {
  const normalizedDistance = Math.max(0, 1 - distanceKm / 5);
  const normalizedRating = rating / 5;

  const score =
    normalizedDistance * WEIGHTS.DISTANCE + normalizedRating * WEIGHTS.RATING;

  return score;
}

exports.findAndRankBestVendor = async (
  customerLon,
  customerLat,
  serviceType
) => {
  const maxDistanceMeters = 5000;

  try {
    let potentialVendors = await Vendor.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [customerLon, customerLat] },
          distanceField: "distanceMeters",
          maxDistance: maxDistanceMeters,
          spherical: true,
          query: { isAvailable: true, serviceType: serviceType },
        },
      },
    ]);

    const rankedVendors = potentialVendors
      .map((vendor) => {
        const distanceKm = vendor.distanceMeters / 1000;
        const score = calculateScore(distanceKm, vendor.rating);
        return { ...vendor, score, distanceKm };
      })
      .sort((a, b) => b.score - a.score);

    return rankedVendors;
  } catch (error) {
    console.error("Allocation Service Error:", error);
    return [];
  }
};
