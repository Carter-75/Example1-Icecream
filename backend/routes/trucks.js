const express = require('express');
const router = express.Router();
const Truck = require('../models/truck');

// GET all trucks
router.get('/', async (req, res) => {
  try {
    const trucks = await Truck.find().sort({ status: 1, name: 1 });
    res.json(trucks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET specific truck
router.get('/:id', async (req, res) => {
  try {
    const truck = await Truck.findById(req.params.id);
    if (!truck) return res.status(404).json({ message: 'Truck not found' });
    res.json(truck);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
