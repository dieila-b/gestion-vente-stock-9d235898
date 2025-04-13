
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Warehouses() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect from the old warehouses route to the new POS locations route
    navigate("/pos-locations", { replace: true });
  }, [navigate]);

  return null; // This component will not render as it immediately redirects
}
