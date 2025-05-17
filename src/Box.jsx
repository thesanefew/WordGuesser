import React from "react";

export default function Box({ value, type = "input" }) {
  return (
    <div className={`box ${type}`}>
      {value}
    </div>
  );
}
