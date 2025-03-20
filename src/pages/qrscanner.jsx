import React, { useEffect, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";
import axios from "axios";

function QrScanner() {
  const [id, setId] = useState(null);
  const [qr, setQr] = useState(false);
  const [btn, setBtn] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function verifyToken() {
      const token = localStorage.getItem("token");

      if (!token) return navigate("/");

      try {
        const user = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/admins`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!user.data) {
          navigate("/");
        }
      } catch (err) {
        navigate("/");
      }
    }

    verifyToken();
  }, []);

  function open() {
    setQr(!qr);
    setId(null);
    setBtn(!btn);
  }

  function submit(result) {
    const id = encodeURIComponent(result[0].rawValue);
    navigate(`/checkId/${id}`);
  }

  return (
    <>
      <Header />

      <div className="body-wrapper">
        <div className="qr-wrapper">
          <div className="qr">
            {qr ? (
              <Scanner onScan={submit} />
            ) : (
              <p>Click the Scan button to scan.</p>
            )}
          </div>
        </div>
        <div className="btn">
          {!btn ? (
            <>
              <button className="qr-btn" onClick={open}>
                Scan
              </button>
            </>
          ) : (
            <button className="qr-btn" onClick={open}>
              Refresh
            </button>
          )}
        </div>
        <div className="btn manual-btn">
          <button
            className="qr-btn"
            onClick={() => navigate("/manualVerification")}
          >
            Manual Verification
          </button>
        </div>
      </div>
    </>
  );
}

export default QrScanner;
