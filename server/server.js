const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const parkingSlots = [
  { id: "P01", status: "occupied" },
  { id: "P02", status: "available" },
  { id: "P03", status: "occupied" },
  { id: "P04", status: "available" },
  { id: "P05", status: "occupied" },
  { id: "P06", status: "available" },
  { id: "P07", status: "available" },
  { id: "P08", status: "predicted" },
  { id: "P09", status: "occupied" },
  { id: "P10", status: "available" },
  { id: "P11", status: "occupied" },
  { id: "P12", status: "available" }
];

app.get("/", (req, res) => {
  res.send("ParkSense Backend is Running");
});

app.get("/api/parking", (req, res) => {
  res.json(parkingSlots);
});

app.get("/api/parking/:id", (req, res) => {
  const slot = parkingSlots.find(
    (item) => item.id === req.params.id
  );

  if (!slot) {
    return res.status(404).json({
      message: "Parking slot not found"
    });
  }

  res.json(slot);
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`ParkSense backend running on port ${PORT}`);
});