import React from "react";
const overlayStyle = {
  position: "fixed",
  top: "150px",
  left: 0,
  width: "100%",
  height: "calc(100% - 150px)",
  backgroundColor: "rgba(255, 255, 255, 0.5)",
  zIndex: 999,
};
export default function Loading() {
  return (
    <div
      style={overlayStyle}
      className="d-flex justify-content-center align-items-center"
    >
      <div className="spinner-border primary-color" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}
