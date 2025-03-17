import React, { useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import "../Styles/SignInPage.css"; // Reusing the same styles
import axios from "axios";

const SignUpPage = () => {
  const { setToken } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5266/api/Login/register",
        {
          Id: formData.username,
          Name: formData.username,
          Email: formData.email,
          Password: formData.password,
        }
      );

      const { accessToken } = response.data;
      if (accessToken) {
        setToken(accessToken);
        sessionStorage.setItem("username", formData.username);
        navigate("/");
      } else {
        setError("Registration successful, but no token received.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <section className="vh-100 gradient-custom d-flex justify-content-center align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8">
            <div className="card bg-dark text-white custom-card">
              <div className="card-body p-5 text-center">
                <form onSubmit={handleSignup}>
                  <div className="mb-md-5 mt-md-4 pb-5">
                    <h2 className="fw-bold mb-2 text-uppercase">Sign Up</h2>
                    <p className="text-white-50 mb-5">
                      Create your account to get started!
                    </p>

                    <div className="form-outline form-white mb-4">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="form-control form-control-lg"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                      <label className="form-label" htmlFor="Name">
                        Name
                      </label>
                    </div>

                    <div className="form-outline form-white mb-4">
                      <input
                        type="text"
                        id="username"
                        name="username"
                        className="form-control form-control-lg"
                        value={formData.username}
                        onChange={handleChange}
                        required
                      />
                      <label className="form-label" htmlFor="username">
                        Username
                      </label>
                    </div>

                    <div className="form-outline form-white mb-4">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="form-control form-control-lg"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                      <label className="form-label" htmlFor="email">
                        Email
                      </label>
                    </div>

                    <div className="form-outline form-white mb-4">
                      <input
                        type="password"
                        id="password"
                        name="password"
                        className="form-control form-control-lg"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      <label className="form-label" htmlFor="password">
                        Password
                      </label>
                    </div>

                    <div className="form-outline form-white mb-4">
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        className="form-control form-control-lg"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                      <label className="form-label" htmlFor="confirmPassword">
                        Confirm Password
                      </label>
                    </div>

                    {error && <p className="text-danger">{error}</p>}

                    <button
                      className="btn btn-outline-light btn-lg px-5"
                      type="submit"
                      onClick={handleSignup}
                    >
                      Sign Up
                    </button>

                    <div className="d-flex justify-content-center text-center mt-4 pt-1">
                      <a href="#!" className="text-white">
                        <i className="fab fa-facebook-f fa-lg"></i>
                      </a>
                      <a href="#!" className="text-white">
                        <i className="fab fa-twitter fa-lg mx-4 px-2"></i>
                      </a>
                      <a href="#!" className="text-white">
                        <i className="fab fa-google fa-lg"></i>
                      </a>
                    </div>
                  </div>
                </form>

                <div>
                  <p className="mb-0">
                    Already have an account?{" "}
                    <a href="/signin" className="text-white-50 fw-bold">
                      Sign In
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignUpPage;
