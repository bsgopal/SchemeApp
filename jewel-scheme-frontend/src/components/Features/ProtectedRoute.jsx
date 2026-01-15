import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const isGuest = localStorage.getItem("isGuest");
  const location = useLocation();

  if (!token && !isGuest) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
}
