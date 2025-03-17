import ReactDOM from "react-dom/client";
import { StrictMode } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./index.css";
import HomePage from "./Components/HomePage";
import SignIn from "./Components/SignInPage";
import SignUpPage from "./Components/signUpPage";
import GamePage from "./Components/GamePage";
import { AuthProvider, useAuth } from "./context/AuthProvider";
import "bootstrap/dist/css/bootstrap.min.css";

const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/signin" replace />;
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            }
          />
          <Route path="/game" element={<GamePage />} />
        </Routes>
      </Router>
    </AuthProvider>
  </StrictMode>
);
