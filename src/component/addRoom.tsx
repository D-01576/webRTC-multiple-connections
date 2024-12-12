import React, { useState } from "react";

interface RoomNamePopupProps {
  onSubmit: (roomName: string) => void;
  onClose: () => void;
}

const RoomNamePopup: React.FC<RoomNamePopupProps> = ({ onSubmit, onClose }) => {
  const [roomName, setRoomName] = useState<string>("");

  const handleSubmit = () => {
    if (roomName.trim()) {
      onSubmit(roomName);
      setRoomName(""); // Reset the input
    } else {
      alert("Please enter a valid room name.");
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.popup}>
        <h2>Enter Room Name</h2>
        <input
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="Room Name"
          style={styles.input}
        />
        <div style={styles.actions}>
          <button onClick={onClose} style={{ ...styles.button, backgroundColor: "#ccc" }}>
            Cancel
          </button>
          <button onClick={handleSubmit} style={styles.button}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  popup: {
    backgroundColor: "black",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center",
    width: "300px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  input: {
    width: "90%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  actions: {
    display: "flex",
    justifyContent: "space-between",
  },
  button: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    backgroundColor: "#007bff",
    color: "#fff",
    cursor: "pointer",
  },
};

export default RoomNamePopup;
