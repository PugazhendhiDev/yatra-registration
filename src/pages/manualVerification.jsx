import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Header from "../components/header";
import { ToastContainer, toast } from "react-toastify";
import { PulseLoader } from "react-spinners";

function ManualVerification() {
  const navigate = useNavigate();

  const [isVerified, setIsVerified] = useState(false);

  const [value, setValue] = useState({
    mobile_number: "",
  });

  const [data, setData] = useState([]);

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

  async function getData(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      if (!token) return navigate("/");

      const getdata = await axios.get(
        `${
          import.meta.env.VITE_SERVER_URL
        }/participants/get-details-by-phone?phone=${value.mobile_number}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (getdata.data && getdata.status == 200) {
        setData(getdata.data);
      }
    } catch (err) {
      const errorMessage = err.response.data?.message || "No user found";
      toast.error(errorMessage, {
        onClose: () => {
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

  async function verify(id) {
    setIsVerified(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) return navigate("/");

      const verified = await axios.put(
        `${
          import.meta.env.VITE_SERVER_URL
        }/participants/update-attendance/${id}`,
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
        <form className="manual-verification-form" onSubmit={getData}>
          <h1 className="auth-h1">Get Details</h1>
          <input
            className="auth-input"
            type="text"
            name="mobile_number"
            placeholder="Enter the mobile number"
            value={value.mobile_number}
            onChange={(e) =>
              setValue({
                ...value,
                mobile_number: e.target.value,
              })
            }
            required
          />
          <button className="qr-btn" type="submit">
            Get Details
          </button>
        </form>

        <div className="get-data">
          {data.map((user, index) => (
            <div>
              <div key={index}>
                <p>Name:</p>
                <h2>{user.name}</h2>
                <p>Phone no.:</p>
                <h3>{user.phone}</h3>
                <p>Email:</p>
                <h3>{user.email}</h3>
                {user.attendance ? <h2>Present</h2> : <h2>Absent</h2>}
              </div>

              <div className="verify-btn">
                {!isVerified ? (
                  <button
                    className="qr-btn manual-btn"
                    onClick={() => verify(user.id)}
                  >
                    Verify
                  </button>
                ) : (
                  <button className="qr-btn manual-btn" disabled>
                    <PulseLoader color="#ffffff" size={10} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default ManualVerification;
