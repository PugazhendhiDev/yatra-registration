import React from "react";
import ritLogo from "../assets/rit-logo.png";

function Header() {
  return (
    <>
      <div className="title">
        <h1>Yatra</h1>
        <p>Ticket verification</p>
      </div>
      <div className="header">
        <img className="logo" src={ritLogo} />
      </div>
    </>
  );
}

export default Header;
