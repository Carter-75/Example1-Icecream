const express = require('express');
const router = express.Router();

const MOCK_TRUCKS = [
  {
    _id: "1",
    name: "The Pink Swirl",
    driver: "Sarah Jenkins",
    phone: "555-0234",
    currentLocation: "Central Park West",
    route: ["Columbus Circle", "72nd St", "Strawberry Fields"],
    operatingHours: "11:00 AM - 7:00 PM",
    image: "/pink_ice_cream_truck.png",
    status: "Active",
    createdAt: new Date()
  },
  {
    _id: "2",
    name: "Frosty Delights",
    driver: "Mike Thompson",
    phone: "555-0892",
    currentLocation: "Hudson River Park",
    route: ["Pier 45", "Chelsea Piers", "Battery Park"],
    operatingHours: "11:00 AM - 7:00 PM",
    image: "/frosty_delights.png",
    status: "Active",
    createdAt: new Date()
  },
  {
    _id: "3",
    name: "Sweet Wheels",
    driver: "Anita Patel",
    phone: "555-0112",
    currentLocation: "Washington Square Park",
    route: ["Union Square", "Astor Place", "SoHo"],
    operatingHours: "11:00 AM - 7:00 PM",
    image: "/sweet_wheels.png",
    status: "Active",
    createdAt: new Date()
  },
  {
    _id: "4",
    name: "Galaxy Scoops",
    driver: "Leo Vance",
    phone: "555-0921",
    currentLocation: "Brooklyn Bridge Park",
    route: ["DUMBO", "Brooklyn Heights", "Cobble Hill"],
    operatingHours: "11:00 AM - 7:00 PM",
    image: "/galaxy_scoops.png",
    status: "Active",
    createdAt: new Date()
  },
  {
    _id: "5",
    name: "Minty Fresh",
    driver: "Chloe Chen",
    phone: "555-0443",
    currentLocation: "Williamsburg Waterfront",
    route: ["McCarren Park", "Greenpoint", "Bushwick"],
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

