const express = require("express");
const { addVehicle, getAvailableVehicles } = require("../controllers/vehicleController");
const router = express.Router();

router.post("/vehicles", addVehicle);
router.get("/vehicles/available", getAvailableVehicles);

module.exports = router;
