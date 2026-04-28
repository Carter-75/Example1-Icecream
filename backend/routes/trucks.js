const express = require('express');
const router = express.Router();

const MOCK_TRUCKS = [
  {
    _id: "1",
    name: "The Pink Swirl",
    driver: "Sarah Jenkins",
    currentLocation: "North Sector",
    route: ["Zone A", "Zone B", "Zone C"],
    operatingHours: "11:00 AM - 7:00 PM",
    image: "/pink_ice_cream_truck.png",
    status: "Active",
    createdAt: new Date()
  },
  {
    _id: "2",
    name: "Frosty Delights",
    driver: "Mike Thompson",
    currentLocation: "West District",
    route: ["Zone D", "Zone E", "Zone F"],
    operatingHours: "11:00 AM - 7:00 PM",
    image: "/frosty_delights.png",
    status: "Active",
    createdAt: new Date()
  },
  {
    _id: "3",
    name: "Sweet Wheels",
    driver: "Anita Patel",
    currentLocation: "South Plaza",
    route: ["Zone G", "Zone H", "Zone I"],
    operatingHours: "11:00 AM - 7:00 PM",
    image: "/sweet_wheels.png",
    status: "Active",
    createdAt: new Date()
  },
  {
    _id: "4",
    name: "Galaxy Scoops",
    driver: "Leo Vance",
    currentLocation: "East Port",
    route: ["Zone J", "Zone K", "Zone L"],
    operatingHours: "11:00 AM - 7:00 PM",
    image: "/galaxy_scoops.png",
    status: "Active",
    createdAt: new Date()
  },
  {
    _id: "5",
    name: "Minty Fresh",
    driver: "Chloe Chen",
    currentLocation: "Central Hub",
    route: ["Zone M", "Zone N", "Zone O"],
    operatingHours: "11:00 AM - 7:00 PM",
    image: "/minty_fresh.png",
    status: "Active",
    createdAt: new Date()
  }
];

// GET all trucks
router.get('/', (req, res) => {
  res.json(MOCK_TRUCKS);
});

// GET specific truck
router.get('/:id', (req, res) => {
  const truck = MOCK_TRUCKS.find(t => t._id === req.params.id);
  if (!truck) return res.status(404).json({ message: 'Truck not found' });
  res.json(truck);
});

module.exports = router;

