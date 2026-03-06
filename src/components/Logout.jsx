import { useEffect, useState } from "react";
import { useUser } from "../contexts/UserProvider";
import { Navigate } from "react-router-dom";

export default function Logout() {
  const [isLoading, setIsLoading] = useState(true);
  const { logout } = useUser();

  useEffect(() => {
    const run = async () => {
      await logout();
      setIsLoading(false);
    };
    run();
  }, [logout]);

  if (isLoading) {
    return <h3>Logging out...</h3>;
  }

  return <Navigate to="/login" replace />;
}
