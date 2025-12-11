import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function TrendsPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to blog page with gift-ideas category
    navigate("/blog?category=gift-ideas", { replace: true });
  }, [navigate]);

  return null;
}
