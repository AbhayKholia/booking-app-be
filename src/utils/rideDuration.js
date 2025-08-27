function estimatedRideDurationHours(fromPincode, toPincode) {
  const diff = Math.abs(parseInt(toPincode) - parseInt(fromPincode));
  const buffer = Math.random() * 2; // 0-2 hours buffer
  return Math.max(1, diff * 0.5 + buffer);
}

module.exports = estimatedRideDurationHours;
