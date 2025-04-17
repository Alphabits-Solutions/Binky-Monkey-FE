import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const token = sessionStorage.getItem("x-auth-token");
  if (!token) {
    return <Navigate to="/auth" />;
  }

  return children;
};

export default PrivateRoute;
