import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Header from "../components/header";
import CryptoJS from "crypto-js";
import { ToastContainer, toast } from "react-toastify";
import { PulseLoader } from "react-spinners";

function Checkqr() {
  const uid = useParams();

  const navigate = useNavigate();

  const [decryptToken, setDecryptToken] = useState(null);

  const [userData, setUserData] = useState(null);

  const id = decodeURIComponent(uid.id);

  const [isVerified, setIsVerified] = useState(false);

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

  useEffect(() => {
    async function decryption() {
      const encryptedBytes = CryptoJS.enc.Base64.parse(id);

      const iv = encryptedBytes.words.slice(0, 4);
      const encrypted = encryptedBytes.words.slice(4);

      const ivWordArray = CryptoJS.lib.WordArray.create(iv, 16);

      const key = CryptoJS.SHA256(import.meta.env.VITE_TOKEN_PASSWORD);

      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: CryptoJS.lib.WordArray.create(encrypted) },
        key,
        {
          iv: ivWordArray,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        }
      );

      setDecryptToken(decrypted.toString(CryptoJS.enc.Utf8));

      try {
        const token = localStorage.getItem("token");

        if (!token) return navigate("/");

        if (!decrypted.toString(CryptoJS.enc.Utf8)) return;

        const verified = await axios.get(
          `${
            import.meta.env.VITE_SERVER_URL
          }/participants/get-details/${decrypted.toString(CryptoJS.enc.Utf8)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (verified.data && verified.status == 200) {
          setUserData(verified.data.participant);
        }
      } catch (err) {
        console.log(err);
      }
    }

    decryption();
  }, []);

  async function verify() {
    setIsVerified(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) return navigate("/");

      if (!decryptToken) return;

      const verified = await axios.put(
        `${
          import.meta.env.VITE_SERVER_URL
        }/participants/update-attendance/${decryptToken}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (verified.data && verified.status == 200) {
        toast(String(verified.data.message), {
          onClose: () => {
            if (verified.status == 200) {
              navigate("/qrscanner");
            }
          },
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: false,
          draggable: true,
          theme: "light",
        });
      }
      setIsVerified(false);
    } catch (err) {
      const errorMessage =
        err.response.data?.message || "An unexpected error occurred";
      toast.error(errorMessage, {
        onClose: () => {
          setIsVerified(false);
          navigate("/qrscanner");
        },
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: true,
      });
    }
  }

  return (
    <>
      <Header />
      <div className="body-wrapper">
        <ToastContainer />
        {decryptToken && userData && (
          <div className="checkqr-wrapper">
            <p>{decryptToken}</p>
            <h1>{userData.name}</h1>
            <p>{userData.phone}</p>
            <p>{userData.email}</p>
          </div>
        )}
        {!isVerified ? (
          <button className="qr-btn" onClick={() => verify()}>
            Verify
          </button>
        ) : (
          <button className="qr-btn" disabled>
            <PulseLoader color="#ffffff" size={10} />
          </button>
        )}
      </div>
    </>
  );
}

export default Checkqr;
