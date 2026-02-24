import { useEffect, useState } from "react";

export default function useWindowWidth() {
  const [windowWidth, setWindowWidth] = useState(window?.innerWidth || 1440);

  const handleResize = () => {
    setWindowWidth(window?.innerWidth || 1440);
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowWidth;
}
