import React, { useEffect, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";
import axios from "axios";
import CryptoJS from "crypto-js";

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
    const encryptedBytes = CryptoJS.enc.Base64.parse(result[0].rawValue);

    // Extract IV (first 16 bytes)
    const iv = encryptedBytes.words.slice(0, 4); // First 16 bytes
    const encrypted = encryptedBytes.words.slice(4); // Remaining encrypted content

    // Convert IV to WordArray
    const ivWordArray = CryptoJS.lib.WordArray.create(iv, 16);

    // Derive key using SHA256 (same as Python)
    const key = CryptoJS.SHA256("1234");

    // Decrypt
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: CryptoJS.lib.WordArray.create(encrypted) },
      key,
      { iv: ivWordArray, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
    );

    setId(decrypted.toString(CryptoJS.enc.Utf8));

    const uid = encodeURIComponent(decrypted.toString(CryptoJS.enc.Utf8));
    navigate(`/checkId/${uid}`);
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
      </div>
    </>
  );
}

export default QrScanner;
