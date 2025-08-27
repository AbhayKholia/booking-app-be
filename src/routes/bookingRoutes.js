const express = require("express");
const { createBooking, getBookings, deleteBooking } = require("../controllers/bookingController");
const router = express.Router();

router.post("/bookings", createBooking);
router.get("/bookings", getBookings);
router.delete("/bookings/:id", deleteBooking);

module.exports = router;
