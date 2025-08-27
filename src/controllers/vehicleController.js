const Vehicle = require("../models/Vehicle");
const Booking = require("../models/Booking");
const estimatedRideDurationHours = require("../utils/rideDuration");

exports.addVehicle = async (req, res) => {
  try {
    const { name, capacityKg, tyres } = req.body;
    if (!name || !capacityKg || !tyres) return res.status(400).json({ error: "Missing required fields" });
    const vehicle = await Vehicle.create({ name, capacityKg, tyres });
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAvailableVehicles = async (req, res) => {
  try {
    const { capacityRequired, fromPincode, toPincode, startTime } = req.query;
    if (!capacityRequired || !fromPincode || !toPincode || !startTime)
      return res.status(400).json({ error: "Missing query parameters" });

    const duration = estimatedRideDurationHours(fromPincode, toPincode);
    const start = new Date(startTime);
    const end = new Date(start.getTime() + duration * 60 * 60 * 1000);

    const vehicles = await Vehicle.find({ capacityKg: { $gte: Number(capacityRequired) } });

    const availableVehicles = [];
    for (const v of vehicles) {
      const overlapping = await Booking.findOne({
        vehicle: v._id,
        $or: [
          { startTime: { $lt: end, $gte: start } },
          { endTime: { $lte: end, $gt: start } },
          { startTime: { $lte: start }, endTime: { $gte: end } }
        ]
      });
      if (!overlapping) availableVehicles.push({ ...v.toObject(), estimatedRideDurationHours: duration });
    }

    res.json(availableVehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
