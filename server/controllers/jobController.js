const { findAndRankBestVendor } = require("../services/allocationService");

let ioInstance;

exports.setIoInstance = (io) => {
  ioInstance = io;
  console.log("Socket.IO instance successfully passed to Job Controller.");
};

exports.postJobAndDispatch = async (req, res) => {
  const {
    customerLon,
    customerLat,
    serviceType,
    description,
    customerSocketId,
  } = req.body;

  try {
    const rankedVendors = await findAndRankBestVendor(
      customerLon,
      customerLat,
      serviceType
    );

    if (rankedVendors.length === 0) {
      return res.status(404).json({ message: "No available vendors nearby." });
    }

    const bestVendor = rankedVendors[0];

    return res.status(200).json({ message: "Dispatch logic initialized." });
  } catch (error) {
    console.error("Job Dispatch Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error during dispatch." });
  }
};
