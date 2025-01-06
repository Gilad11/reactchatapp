import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import HomePage from "./Components/HomePage.jsx";
import SignIn from "./Components/SignInPage.jsx";
import "bootstrap/dist/css/bootstrap.min.css";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HomePage />
    {/* <SignIn /> */}
  </StrictMode>
);
