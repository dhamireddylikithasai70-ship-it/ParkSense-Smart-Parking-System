import { useEffect, useMemo, useState } from "react";
import "./App.css";

/* =========================================================
   PARKING DATA
========================================================= */

const initialSlots = [
  { id: "P01", type: "car", status: "available", row: 1 },
  { id: "P02", type: "car", status: "available", row: 1 },
  { id: "P03", type: "car", status: "occupied", row: 1 },
  { id: "P04", type: "car", status: "available", row: 1 },
  { id: "P05", type: "bike", status: "available", row: 1 },

  { id: "P06", type: "car", status: "occupied", row: 2 },
  { id: "P07", type: "car", status: "available", row: 2 },
  { id: "P08", type: "car", status: "available", row: 2 },
  { id: "P09", type: "bike", status: "occupied", row: 2 },
  { id: "P10", type: "bike", status: "available", row: 2 },

  { id: "P11", type: "car", status: "occupied", row: 3 },
  { id: "P12", type: "car", status: "available", row: 3 },
  { id: "P13", type: "car", status: "available", row: 3 },
  { id: "P14", type: "bike", status: "occupied", row: 3 },
  { id: "P15", type: "bike", status: "available", row: 3 },

  { id: "P16", type: "car", status: "available", row: 4 },
  { id: "P17", type: "car", status: "occupied", row: 4 },
  { id: "P18", type: "car", status: "available", row: 4 },
  { id: "P19", type: "bike", status: "available", row: 4 },
  { id: "P20", type: "bike", status: "occupied", row: 4 },
];

/* Demo registered vehicles */
const vehicleDatabase = {
  TS09AB1234: {
    name: "Likitha",
    type: "car",
  },
  TS10CD5678: {
    name: "Rahul",
    type: "car",
  },
  TS11EF9012: {
    name: "Sneha",
    type: "bike",
  },
  AP09GH3456: {
    name: "Priya",
    type: "car",
  },
};

/* =========================================================
   MAP POSITIONS
========================================================= */

const slotPositions = {
  P01: { x: 105, y: 90, laneY: 155 },
  P02: { x: 225, y: 90, laneY: 155 },
  P03: { x: 650, y: 90, laneY: 155 },
  P04: { x: 770, y: 90, laneY: 155 },
  P05: { x: 870, y: 90, laneY: 155 },

  P06: { x: 105, y: 250, laneY: 315 },
  P07: { x: 225, y: 250, laneY: 315 },
  P08: { x: 650, y: 250, laneY: 315 },
  P09: { x: 770, y: 250, laneY: 315 },
  P10: { x: 870, y: 250, laneY: 315 },

  P11: { x: 105, y: 410, laneY: 475 },
  P12: { x: 225, y: 410, laneY: 475 },
  P13: { x: 650, y: 410, laneY: 475 },
  P14: { x: 770, y: 410, laneY: 475 },
  P15: { x: 870, y: 410, laneY: 475 },

  P16: { x: 105, y: 550, laneY: 615 },
  P17: { x: 225, y: 550, laneY: 615 },
  P18: { x: 650, y: 550, laneY: 615 },
  P19: { x: 770, y: 550, laneY: 615 },
  P20: { x: 870, y: 550, laneY: 615 },
};

/* =========================================================
   HELPER FUNCTIONS
========================================================= */

function getNow() {
  const now = new Date();

  return {
    date: now.toLocaleDateString("en-IN"),
    time: now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    timestamp: now.getTime(),
  };
}

function formatDuration(minutes) {
  if (minutes < 1) {
    return "Less than 1 min";
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins} min`;
  }

  if (mins === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${mins} min`;
}

function getRoutePath(slotId) {
  const slot = slotPositions[slotId];

  if (!slot) {
    return "";
  }

  return `
    M 500 735
    L 500 ${slot.laneY}
    L ${slot.x} ${slot.laneY}
    L ${slot.x} ${slot.y}
  `;
}

/* =========================================================
   MAIN APP
========================================================= */

function App() {
  const [activePage, setActivePage] = useState("entry");

  const [slots, setSlots] = useState(initialSlots);

  const [vehicleType, setVehicleType] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleName, setVehicleName] = useState("");

  const [assignedSlot, setAssignedSlot] = useState("");

  const [entryDate, setEntryDate] = useState("");
  const [entryTime, setEntryTime] = useState("");
  const [entryTimestamp, setEntryTimestamp] = useState(null);

  const [exitTime, setExitTime] = useState("");

  const [message, setMessage] = useState("");
  const [exitCompleted, setExitCompleted] = useState(false);

  /* =====================================================
     HISTORY - SAVED IN LOCAL STORAGE
  ===================================================== */

  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("parksense-history");

      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("parksense-history", JSON.stringify(history));
  }, [history]);

  /* =====================================================
     COUNTS
  ===================================================== */

  const availableSlots = useMemo(() => {
    return slots.filter((slot) => slot.status === "available");
  }, [slots]);

  const occupiedSlots = useMemo(() => {
    return slots.filter((slot) => slot.status === "occupied");
  }, [slots]);

  const assignedSlots = useMemo(() => {
    return slots.filter((slot) => slot.status === "assigned");
  }, [slots]);

  const availableCarSlots = availableSlots.filter(
    (slot) => slot.type === "car"
  );

  const availableBikeSlots = availableSlots.filter(
    (slot) => slot.type === "bike"
  );

  /* =====================================================
     QR SCAN DEMO
  ===================================================== */

  function scanEntryQR() {
    const demoNumber = "TS09AB1234";

    setVehicleNumber(demoNumber);
    setVehicleName(vehicleDatabase[demoNumber].name);
    setVehicleType(vehicleDatabase[demoNumber].type);

    setMessage(
      "QR scanned successfully. Vehicle details loaded."
    );
  }

  /* =====================================================
     VEHICLE NUMBER
  ===================================================== */

  function handleVehicleNumber(value) {
    const number = value.toUpperCase();

    setVehicleNumber(number);

    const vehicle = vehicleDatabase[number];

    if (vehicle) {
      setVehicleName(vehicle.name);
      setVehicleType(vehicle.type);

      setMessage(
        `Registered vehicle found: ${vehicle.name}`
      );
    } else {
      setVehicleName("");
      setMessage("");
    }
  }

  /* =====================================================
     START PARKING
     ONLY AVAILABLE SLOTS ARE USED
  ===================================================== */

  function startParking() {
    setMessage("");
    setExitCompleted(false);

    if (!vehicleNumber.trim()) {
      setMessage("Please enter vehicle number.");
      return;
    }

    if (!vehicleType) {
      setMessage("Please select Car or Bike.");
      return;
    }

    const suitableSlots = slots.filter(
      (slot) =>
        slot.status === "available" &&
        slot.type === vehicleType
    );

    if (suitableSlots.length === 0) {
      setMessage(
        `No available ${vehicleType} slots at the moment.`
      );
      return;
    }

    /*
      Entrance point is x=500.
      Find the nearest available slot.
    */

    const nearestSlot = [...suitableSlots].sort((a, b) => {
      const positionA = slotPositions[a.id];
      const positionB = slotPositions[b.id];

      const distanceA =
        Math.abs(positionA.x - 500) +
        Math.abs(positionA.y - 735);

      const distanceB =
        Math.abs(positionB.x - 500) +
        Math.abs(positionB.y - 735);

      return distanceA - distanceB;
    })[0];

    const current = getNow();

    setAssignedSlot(nearestSlot.id);
    setEntryDate(current.date);
    setEntryTime(current.time);
    setEntryTimestamp(current.timestamp);

    setSlots((currentSlots) =>
      currentSlots.map((slot) =>
        slot.id === nearestSlot.id
          ? { ...slot, status: "assigned" }
          : slot
      )
    );

    setMessage(
      `${nearestSlot.id} automatically assigned. Follow the blue route on the parking map.`
    );

    setActivePage("map");
  }

  /* =====================================================
     EXIT VEHICLE
  ===================================================== */

  function exitVehicle() {
    if (!assignedSlot || !entryTimestamp) {
      setMessage(
        "No active parking session found."
      );
      return;
    }

    const current = getNow();

    const durationMinutes = Math.max(
      0,
      Math.floor(
        (current.timestamp - entryTimestamp) / 60000
      )
    );

    const record = {
      id: Date.now(),
      vehicleName: vehicleName || "Unknown",
      vehicleNumber,
      vehicleType,
      slotNumber: assignedSlot,
      entryDate,
      entryTime,
      exitTime: current.time,
      duration: formatDuration(durationMinutes),
      status: "COMPLETED",
    };

    setHistory((oldHistory) => [
      record,
      ...oldHistory,
    ]);

    /* Free the slot */
    setSlots((currentSlots) =>
      currentSlots.map((slot) =>
        slot.id === assignedSlot
          ? {
              ...slot,
              status: "available",
            }
          : slot
      )
    );

    setExitTime(current.time);
    setExitCompleted(true);

    setMessage(
      `${assignedSlot} is now available. Parking history saved automatically.`
    );

    setActivePage("history");
  }

  /* =====================================================
     DELETE ONE HISTORY RECORD
  ===================================================== */

  function deleteHistory(id) {
    const confirmDelete = window.confirm(
      "Delete this parking history record?"
    );

    if (!confirmDelete) {
      return;
    }

    setHistory((oldHistory) =>
      oldHistory.filter((record) => record.id !== id)
    );
  }

  /* =====================================================
     DELETE ALL HISTORY
  ===================================================== */

  function clearHistory() {
    if (history.length === 0) {
      return;
    }

    const confirmDelete = window.confirm(
      "Delete all parking history?"
    );

    if (!confirmDelete) {
      return;
    }

    setHistory([]);
  }

  /* =====================================================
     SIMULATE IR SENSOR
  ===================================================== */

  function simulateIR(slotId) {
    if (slotId === assignedSlot) {
      setMessage(
        "This slot belongs to the active vehicle."
      );
      return;
    }

    setSlots((currentSlots) =>
      currentSlots.map((slot) => {
        if (slot.id !== slotId) {
          return slot;
        }

        return {
          ...slot,
          status:
            slot.status === "occupied"
              ? "available"
              : "occupied",
        };
      })
    );

    setMessage(
      `IR sensor status updated for ${slotId}.`
    );
  }

  /* =====================================================
     NEW PARKING SESSION
  ===================================================== */

  function newParking() {
    setVehicleType("");
    setVehicleNumber("");
    setVehicleName("");
    setAssignedSlot("");
    setEntryDate("");
    setEntryTime("");
    setEntryTimestamp(null);
    setExitTime("");
    setExitCompleted(false);
    setMessage("");

    setActivePage("entry");
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="app">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="header">

        <div
          className="logo-area"
          onClick={() => setActivePage("entry")}
        >
          <div className="logo-icon">P</div>

          <div>
            <h1>ParkSense</h1>
            <p>Smart Mall Parking System</p>
          </div>
        </div>

        <nav className="navbar">

          <button
            className={
              activePage === "entry"
                ? "nav-btn active"
                : "nav-btn"
            }
            onClick={() => setActivePage("entry")}
          >
            Entry
          </button>

          <button
            className={
              activePage === "map"
                ? "nav-btn active"
                : "nav-btn"
            }
            onClick={() => setActivePage("map")}
          >
            Parking Map
          </button>

          <button
            className={
              activePage === "exit"
                ? "nav-btn active"
                : "nav-btn"
            }
            onClick={() => setActivePage("exit")}
          >
            Exit Gate
          </button>

          <button
            className={
              activePage === "history"
                ? "nav-btn active"
                : "nav-btn"
            }
            onClick={() => setActivePage("history")}
          >
            History
          </button>

        </nav>

      </header>

      {/* =================================================
          STATUS BAR
      ================================================= */}

      <section className="status-bar">

        <div>
          <span className="status-dot online"></span>
          IR Sensors Online
        </div>

        <div>
          <span className="status-dot online"></span>
          ESP32 Connected
        </div>

        <div>
          <span className="status-dot online"></span>
          ML Prediction Active
        </div>

        <div>
          <span className="status-dot online"></span>
          Backend Connected
        </div>

      </section>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="main">

        {/* =================================================
            ENTRY PAGE
        ================================================= */}

        {activePage === "entry" && (
          <section className="page">

            <div className="hero">

              <div>
                <span className="small-label">
                  SMART PARKING ENTRANCE
                </span>

                <h2>
                  Scan. Identify. Park.
                </h2>

                <p>
                  Scan your vehicle QR code and
                  ParkSense will automatically find
                  and assign a nearby available parking
                  slot.
                </p>
              </div>

              <div className="hero-count">
                <strong>{availableSlots.length}</strong>
                <span>Available Slots</span>
              </div>

            </div>

            <div className="entry-grid">

              {/* QR CARD */}

              <div className="card scanner-card">

                <div className="card-title">
                  <div>
                    <span className="eyebrow">
                      STEP 01
                    </span>

                    <h3>Vehicle Scanner</h3>
                  </div>

                  <span className="scanner-live">
                    ● LIVE
                  </span>
                </div>

                <div className="qr-box">

                  <div className="qr-pattern">
                    <div className="qr-corner one"></div>
                    <div className="qr-corner two"></div>
                    <div className="qr-corner three"></div>

                    <div className="qr-lines"></div>
                  </div>

                  <div className="scan-line"></div>

                  <p>
                    Place vehicle QR code inside
                    the scanning area
                  </p>

                </div>

                <button
                  className="primary-btn"
                  onClick={scanEntryQR}
                >
                  Scan Vehicle QR
                </button>

                <p className="demo-note">
                  Demo: QR scan loads TS09AB1234
                </p>

              </div>

              {/* VEHICLE DETAILS */}

              <div className="card details-card">

                <div className="card-title">

                  <div>
                    <span className="eyebrow">
                      STEP 02
                    </span>

                    <h3>Vehicle Details</h3>
                  </div>

                  <span className="auto-badge">
                    AUTO
                  </span>

                </div>

                <label>
                  Vehicle Number
                </label>

                <input
                  type="text"
                  placeholder="Example: TS09AB1234"
                  value={vehicleNumber}
                  onChange={(event) =>
                    handleVehicleNumber(
                      event.target.value
                    )
                  }
                />

                <label>
                  Registered Vehicle Name
                </label>

                <input
                  type="text"
                  placeholder="Vehicle name"
                  value={vehicleName}
                  onChange={(event) =>
                    setVehicleName(event.target.value)
                  }
                />

                <label>
                  Vehicle Type
                </label>

                <div className="vehicle-buttons">

                  <button
                    className={
                      vehicleType === "car"
                        ? "vehicle-btn selected"
                        : "vehicle-btn"
                    }
                    onClick={() =>
                      setVehicleType("car")
                    }
                  >
                    <span>🚗</span>
                    Car
                  </button>

                  <button
                    className={
                      vehicleType === "bike"
                        ? "vehicle-btn selected"
                        : "vehicle-btn"
                    }
                    onClick={() =>
                      setVehicleType("bike")
                    }
                  >
                    <span>🏍️</span>
                    Bike
                  </button>

                </div>

                <button
                  className="assign-btn"
                  onClick={startParking}
                >
                  Find & Automatically Assign Slot
                  <span>→</span>
                </button>

              </div>

            </div>

            {message && (
              <div className="message-box">
                {message}
              </div>
            )}

            {/* AVAILABILITY */}

            <div className="availability-section">

              <div className="section-heading">

                <div>
                  <span className="eyebrow">
                    LIVE AVAILABILITY
                  </span>

                  <h3>
                    Available Parking Slots
                  </h3>
                </div>

                <span>
                  {availableSlots.length} spaces free
                </span>

              </div>

              <div className="available-list">

                {availableSlots.map((slot) => (
                  <div
                    className="available-card"
                    key={slot.id}
                  >

                    <div className="available-icon">
                      {slot.type === "car"
                        ? "🚗"
                        : "🏍️"}
                    </div>

                    <div>
                      <strong>{slot.id}</strong>
                      <span>
                        Row {slot.row} ·{" "}
                        {slot.type === "car"
                          ? "Car"
                          : "Bike"}
                      </span>
                    </div>

                    <span className="available-label">
                      AVAILABLE
                    </span>

                  </div>
                ))}

              </div>

            </div>

          </section>
        )}

        {/* =================================================
            MAP PAGE
        ================================================= */}

        {activePage === "map" && (
          <section className="page">

            <div className="page-heading">

              <div>
                <span className="eyebrow">
                  LIVE PARKING MAP
                </span>

                <h2>
                  Mall Parking Floor
                </h2>

                <p>
                  The blue route shows the actual
                  driving path from the entrance to
                  your assigned slot.
                </p>
              </div>

              <button
                className="secondary-btn"
                onClick={() =>
                  setActivePage("entry")
                }
              >
                ← Back to Entry
              </button>

            </div>

            {assignedSlot ? (
              <>

                <div className="assignment-banner">

                  <div className="assignment-main">

                    <span>
                      YOUR ASSIGNED SLOT
                    </span>

                    <strong>
                      {assignedSlot}
                    </strong>

                  </div>

                  <div>
                    <span>Vehicle</span>
                    <strong>
                      {vehicleNumber}
                    </strong>
                  </div>

                  <div>
                    <span>Type</span>
                    <strong>
                      {vehicleType === "car"
                        ? "🚗 Car"
                        : "🏍️ Bike"}
                    </strong>
                  </div>

                  <div>
                    <span>Entry</span>
                    <strong>
                      {entryTime}
                    </strong>
                  </div>

                </div>

                <div className="map-card">

                  <RealParkingMap
                    slots={slots}
                    assignedSlot={assignedSlot}
                  />

                  <div className="map-legend">

                    <div>
                      <span className="legend available"></span>
                      Available
                    </div>

                    <div>
                      <span className="legend occupied"></span>
                      Occupied
                    </div>

                    <div>
                      <span className="legend assigned"></span>
                      Your Slot
                    </div>

                    <div>
                      <span className="legend route"></span>
                      Navigation Route
                    </div>

                  </div>

                </div>

                <div className="navigation-info">

                  <div className="navigation-icon">
                    ➤
                  </div>

                  <div>
                    <span className="eyebrow">
                      NAVIGATION
                    </span>

                    <h3>
                      Follow the blue route
                    </h3>

                    <p>
                      Enter through the main gate,
                      continue on the central driving
                      aisle, take the lane leading to
                      Row{" "}
                      {
                        slots.find(
                          (slot) =>
                            slot.id === assignedSlot
                        )?.row
                      }
                      , then enter{" "}
                      <strong>
                        {assignedSlot}
                      </strong>
                      .
                    </p>
                  </div>

                </div>

                {/* ML */}

                <div className="dashboard-grid">

                  <div className="card prediction-card">

                    <span className="eyebrow">
                      MACHINE LEARNING
                    </span>

                    <h3>
                      Future Availability Prediction
                    </h3>

                    <p>
                      ML uses current and historical
                      occupancy, time, day and parking
                      trends to estimate future
                      availability.
                    </p>

                    <div className="prediction-list">

                      <div>
                        <span>P02</span>
                        <strong>Likely Available</strong>
                      </div>

                      <div>
                        <span>P08</span>
                        <strong>Likely Available</strong>
                      </div>

                      <div>
                        <span>P13</span>
                        <strong>Likely Occupied</strong>
                      </div>

                    </div>

                  </div>

                  <div className="card sensor-card">

                    <span className="eyebrow">
                      ELECTRONICS
                    </span>

                    <h3>
                      IR Sensor Monitoring
                    </h3>

                    <div className="sensor-status">

                      <div>
                        <span className="status-dot online"></span>
                        ESP32
                      </div>

                      <strong>
                        CONNECTED
                      </strong>

                    </div>

                    <p>
                      IR sensors detect whether
                      individual parking spaces are
                      occupied or available.
                    </p>

                    <div className="sensor-test">

                      <span>
                        Test sensor:
                      </span>

                      <select
                        onChange={(event) => {
                          if (
                            event.target.value
                          ) {
                            simulateIR(
                              event.target.value
                            );
                          }
                        }}
                      >
                        <option value="">
                          Select slot
                        </option>

                        {slots.map((slot) => (
                          <option
                            key={slot.id}
                            value={slot.id}
                          >
                            {slot.id}
                          </option>
                        ))}
                      </select>

                    </div>

                  </div>

                </div>

                <button
                  className="exit-now-btn"
                  onClick={() =>
                    setActivePage("exit")
                  }
                >
                  Go to Exit Gate →
                </button>

              </>
            ) : (
              <div className="empty-session">

                <div>🚗</div>

                <h3>
                  No active parking session
                </h3>

                <p>
                  Scan your vehicle at the entrance
                  first.
                </p>

                <button
                  className="primary-btn"
                  onClick={() =>
                    setActivePage("entry")
                  }
                >
                  Go to Entry
                </button>

              </div>
            )}

          </section>
        )}

        {/* =================================================
            EXIT PAGE
        ================================================= */}

        {activePage === "exit" && (
          <section className="page">

            <div className="page-heading">

              <div>
                <span className="eyebrow">
                  EXIT GATE
                </span>

                <h2>
                  Complete Parking
                </h2>

                <p>
                  Scan the vehicle at the exit.
                  ParkSense automatically saves the
                  exit time and parking duration.
                </p>
              </div>

            </div>

            {assignedSlot ? (
              <div className="exit-grid">

                <div className="card exit-scanner">

                  <div className="exit-gate-icon">
                    EXIT
                  </div>

                  <h3>
                    Scan Vehicle QR
                  </h3>

                  <p>
                    Scan the same vehicle QR code at
                    the exit gate.
                  </p>

                  <button
                    className="primary-btn"
                    onClick={exitVehicle}
                  >
                    Scan QR & Exit
                  </button>

                </div>

                <div className="card active-session">

                  <span className="eyebrow">
                    ACTIVE SESSION
                  </span>

                  <h3>
                    Current Parking Details
                  </h3>

                  <div className="session-row">
                    <span>Vehicle Name</span>
                    <strong>
                      {vehicleName || "Unknown"}
                    </strong>
                  </div>

                  <div className="session-row">
                    <span>Vehicle Number</span>
                    <strong>
                      {vehicleNumber}
                    </strong>
                  </div>

                  <div className="session-row">
                    <span>Vehicle Type</span>
                    <strong>
                      {vehicleType === "car"
                        ? "Car"
                        : "Bike"}
                    </strong>
                  </div>

                  <div className="session-row">
                    <span>Parking Slot</span>
                    <strong className="slot-highlight">
                      {assignedSlot}
                    </strong>
                  </div>

                  <div className="session-row">
                    <span>Entry Date</span>
                    <strong>
                      {entryDate}
                    </strong>
                  </div>

                  <div className="session-row">
                    <span>Entry Time</span>
                    <strong>
                      {entryTime}
                    </strong>
                  </div>

                </div>

              </div>
            ) : (
              <div className="empty-session">

                <div>✓</div>

                <h3>
                  No active vehicle
                </h3>

                <p>
                  There is currently no vehicle
                  assigned to a parking slot.
                </p>

                <button
                  className="primary-btn"
                  onClick={() =>
                    setActivePage("entry")
                  }
                >
                  Start New Parking
                </button>

              </div>
            )}

            {message && (
              <div className="message-box">
                {message}
              </div>
            )}

          </section>
        )}

        {/* =================================================
            HISTORY PAGE
        ================================================= */}

        {activePage === "history" && (
          <section className="page">

            <div className="page-heading history-heading">

              <div>
                <span className="eyebrow">
                  PARKING RECORDS
                </span>

                <h2>
                  Parking History
                </h2>

                <p>
                  Completed parking sessions are
                  automatically saved here.
                </p>
              </div>

              <div className="history-actions">

                <button
                  className="secondary-btn"
                  onClick={newParking}
                >
                  + New Parking
                </button>

                {history.length > 0 && (
                  <button
                    className="delete-all-btn"
                    onClick={clearHistory}
                  >
                    Delete All
                  </button>
                )}

              </div>

            </div>

            {exitCompleted && (
              <div className="success-box">
                ✓ Exit completed successfully.
                Slot {assignedSlot} is available again.
              </div>
            )}

            {history.length === 0 ? (
              <div className="empty-history">

                <div className="empty-history-icon">
                  🅿️
                </div>

                <h3>
                  No parking history yet
                </h3>

                <p>
                  Completed parking sessions will
                  appear here automatically.
                </p>

                <button
                  className="primary-btn"
                  onClick={newParking}
                >
                  Start Parking
                </button>

              </div>
            ) : (
              <div className="history-table-wrapper">

                <table className="history-table">

                  <thead>
                    <tr>
                      <th>Vehicle</th>
                      <th>Number</th>
                      <th>Type</th>
                      <th>Slot</th>
                      <th>Entry Date</th>
                      <th>Entry Time</th>
                      <th>Exit Time</th>
                      <th>Duration</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>

                    {history.map((record) => (
                      <tr key={record.id}>

                        <td>
                          <strong>
                            {record.vehicleName}
                          </strong>
                        </td>

                        <td>
                          {record.vehicleNumber}
                        </td>

                        <td>
                          {record.vehicleType === "car"
                            ? "🚗 Car"
                            : "🏍️ Bike"}
                        </td>

                        <td>
                          <span className="table-slot">
                            {record.slotNumber}
                          </span>
                        </td>

                        <td>
                          {record.entryDate}
                        </td>

                        <td>
                          {record.entryTime}
                        </td>

                        <td>
                          {record.exitTime}
                        </td>

                        <td>
                          <strong>
                            {record.duration}
                          </strong>
                        </td>

                        <td>

                          <button
                            className="delete-btn"
                            onClick={() =>
                              deleteHistory(
                                record.id
                              )
                            }
                          >
                            Delete
                          </button>

                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>
            )}

          </section>
        )}

      </main>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="footer">

        <div>
          <strong>ParkSense</strong>
          <span>
            AI-Enabled Smart Parking System
          </span>
        </div>

        <div>
          IR Sensors · ESP32 · ML · Navigation
        </div>

      </footer>

    </div>
  );
}

/* =========================================================
   REALISTIC PARKING MAP COMPONENT
========================================================= */

function RealParkingMap({ slots, assignedSlot }) {
  const routePath = getRoutePath(assignedSlot);

  return (
    <div className="real-map">

      <svg
        viewBox="0 0 1000 800"
        className="parking-svg"
      >

        {/* ARROW DEFINITION */}

        <defs>

          <marker
            id="routeArrow"
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path
              d="M0,0 L0,6 L9,3 z"
              fill="#2563eb"
            />
          </marker>

        </defs>

        {/* BACKGROUND */}

        <rect
          x="0"
          y="0"
          width="1000"
          height="800"
          rx="25"
          className="map-background"
        />

        {/* TOP MALL BUILDING */}

        <rect
          x="340"
          y="20"
          width="320"
          height="70"
          rx="12"
          className="mall-building"
        />

        <text
          x="500"
          y="62"
          textAnchor="middle"
          className="mall-text"
        >
          MALL BUILDING
        </text>

        {/* CENTRAL VERTICAL ROAD */}

        <rect
          x="450"
          y="90"
          width="100"
          height="620"
          className="main-road"
        />

        {/* HORIZONTAL LANES */}

        {[155, 315, 475, 615].map((y) => (
          <g key={y}>

            <rect
              x="40"
              y={y - 22}
              width="920"
              height="44"
              className="drive-lane"
            />

            <text
              x="350"
              y={y + 5}
              className="road-arrow"
            >
              →
            </text>

            <text
              x="600"
              y={y + 5}
              className="road-arrow"
            >
              →
            </text>

          </g>
        ))}

        {/* ENTRANCE ROAD */}

        <rect
          x="350"
          y="700"
          width="300"
          height="70"
          rx="12"
          className="entrance-road"
        />

        <text
          x="500"
          y="728"
          textAnchor="middle"
          className="entrance-label"
        >
          MAIN ENTRANCE
        </text>

        <text
          x="500"
          y="753"
          textAnchor="middle"
          className="entrance-arrow"
        >
          ↑ ENTER
        </text>

        {/* ROW LABELS */}

        <text
          x="500"
          y="125"
          textAnchor="middle"
          className="row-label"
        >
          ROW 1
        </text>

        <text
          x="500"
          y="285"
          textAnchor="middle"
          className="row-label"
        >
          ROW 2
        </text>

        <text
          x="500"
          y="445"
          textAnchor="middle"
          className="row-label"
        >
          ROW 3
        </text>

        <text
          x="500"
          y="585"
          textAnchor="middle"
          className="row-label"
        >
          ROW 4
        </text>

        {/* PARKING SLOTS */}

        {slots.map((slot) => {

          const position =
            slotPositions[slot.id];

          const isAssigned =
            slot.id === assignedSlot;

          const isAvailable =
            slot.status === "available";

          const isOccupied =
            slot.status === "occupied";

          return (
            <g key={slot.id}>

              {/* SLOT */}

              <rect
                x={position.x - 45}
                y={position.y - 35}
                width="90"
                height="70"
                rx="8"
                className={
                  isAssigned
                    ? "svg-slot assigned-slot"
                    : isAvailable
                    ? "svg-slot available-slot"
                    : "svg-slot occupied-slot"
                }
              />

              {/* VEHICLE */}

              {isOccupied && (
                <text
                  x={position.x}
                  y={position.y - 2}
                  textAnchor="middle"
                  className="svg-car"
                >
                  {slot.type === "car"
                    ? "🚗"
                    : "🏍️"}
                </text>
              )}

              {isAssigned && (
                <text
                  x={position.x}
                  y={position.y - 3}
                  textAnchor="middle"
                  className="svg-your-car"
                >
                  {vehicleIcon(slot.type)}
                </text>
              )}

              {isAvailable && (
                <text
                  x={position.x}
                  y={position.y - 3}
                  textAnchor="middle"
                  className="svg-free"
                >
                  FREE
                </text>
              )}

              {/* SLOT NUMBER */}

              <text
                x={position.x}
                y={position.y + 23}
                textAnchor="middle"
                className="svg-slot-number"
              >
                {slot.id}
              </text>

            </g>
          );
        })}

        {/* NAVIGATION ROUTE */}

        {assignedSlot && (
          <path
            d={routePath}
            className="navigation-path"
            markerEnd="url(#routeArrow)"
          />
        )}

      </svg>

      {/* MAP INFO */}

      <div className="map-info">

        <div>
          <strong>
            {slots.filter(
              (slot) => slot.status === "available"
            ).length}
          </strong>
          <span>Available</span>
        </div>

        <div>
          <strong>
            {slots.filter(
              (slot) => slot.status === "occupied"
            ).length}
          </strong>
          <span>Occupied</span>
        </div>

        <div>
          <strong>
            {slots.length}
          </strong>
          <span>Total Slots</span>
        </div>

      </div>

    </div>
  );
}

/* =========================================================
   VEHICLE ICON
========================================================= */

function vehicleIcon(type) {
  return type === "car" ? "🚗" : "🏍️";
}

export default App;