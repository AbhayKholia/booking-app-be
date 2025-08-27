const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");
const estimatedRideDurationHours = require("../utils/rideDuration");

exports.createBooking = async (req, res) => {
  try {
    const { vehicleId, fromPincode, toPincode, startTime, customerId } = req.body;
    if (!vehicleId || !fromPincode || !toPincode || !startTime || !customerId)
      return res.status(400).json({ error: "Missing fields" });

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });

    const duration = estimatedRideDurationHours(fromPincode, toPincode);
    const start = new Date(startTime);
    const end = new Date(start.getTime() + duration * 60 * 60 * 1000);

    const overlapping = await Booking.findOne({
      vehicle: vehicleId,
      $or: [
        { startTime: { $lt: end, $gte: start } },
        { endTime: { $lte: end, $gt: start } },
        { startTime: { $lte: start }, endTime: { $gte: end } }
      ]
    });

    if (overlapping) return res.status(409).json({ error: "Vehicle already booked for this time slot" });

    const booking = await Booking.create({ vehicle: vehicleId, fromPincode, toPincode, startTime: start, endTime: end, customerId });
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("vehicle");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByIdAndDelete(id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json({ message: "Booking cancelled successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
