import { useState, useEffect } from "react";

const useResponsiveWidth = (bookMode: string) => {
  const [width, setWidth] = useState(900);

  useEffect(() => {
    const updateWidth = () => {
      const screenWidth = window.innerWidth;

      if (bookMode === "portrait") {
        setWidth(Math.min(screenWidth * 0.9, 900));
      } else {
        setWidth(Math.min(screenWidth * 0.95, 1300));
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);

    return () => window.removeEventListener("resize", updateWidth);
  }, [bookMode]);

  return width;
};

export default useResponsiveWidth;