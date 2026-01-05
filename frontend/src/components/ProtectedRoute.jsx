import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const loggedIn = true; // TEMP: backend will replace
  return loggedIn ? children : <Navigate to="/login" />;
}
