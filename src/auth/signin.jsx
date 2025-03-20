import PulseLoader from "react-spinners/PulseLoader";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Signin() {
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [loginValue, setLoginValue] = useState(false);

  const [value, setValue] = useState({
    username: "",
    password: "",
  });

  useEffect(() => {
    async function verifyToken() {
      const token = localStorage.getItem("token");

      if (!token) return;

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

        if (user.data) {
          navigate("/qrscanner");
        }
      } catch (err) {
        return;
      }
    }

    verifyToken();
  }, []);

  const signin = async (e) => {
    e.preventDefault();
    try {
      setLoginValue(true);
      const user = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/login`,
        { username: value.username, password: value.password }
      );

      if (user.data) {
        localStorage.setItem("token", user.data);
        navigate("/qrscanner");
      }
    } catch (error) {
      const errorMessage = error.response
        ? error.response.data.error
        : "Invalid credential";
      setLoginValue(false);
      setError(errorMessage);
    }
  };

  return (
    <div className="auth-form-container">
      <form className="auth-form" onSubmit={signin}>
        <h1 className="auth-h1">Login In</h1>
        <label className="auth-label" htmlFor="email">
          Username:
        </label>
        <input
          className="auth-input"
          type="text"
          name="username"
          placeholder="Enter your username"
          value={value.username}
          onChange={(e) =>
            setValue({
              ...value,
              username: e.target.value,
            })
          }
          required
        />

        <label className="auth-label" htmlFor="password">
          Password:
        </label>
        <input
          className="auth-input"
          type="password"
          name="password"
          placeholder="Enter your password"
          value={value.password}
          onChange={(e) =>
            setValue({
              ...value,
              password: e.target.value,
            })
          }
          required
        />
        {loginValue ? (
          <button className="auth-submit-btn" type="submit" disabled>
            <PulseLoader size={5} color="#ffffff" />
          </button>
        ) : (
          <button className="auth-submit-btn" type="submit">
            Sign In
          </button>
        )}
      </form>
    </div>
  );
}

export default Signin;
