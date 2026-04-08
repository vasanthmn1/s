import { useState, useEffect } from "react";

const useFlipbookSize = () => {
  const [size, setSize] = useState({
    width: 900,
    height: 1200,
    isMobile: false,
  });

  useEffect(() => {
    const updateSize = () => {
      const screenWidth = window.innerWidth;

      const isMobile = screenWidth < 768;

      let width;

      if (isMobile) {
        // 📱 Mobile → single page
        width = screenWidth * 0.95;
      } else {
        // 💻 Desktop → book mode
        width = Math.min(screenWidth * 0.9, 1300);
      }

      const height = width * 1.15; // keep ratio

      setSize({ width, height, isMobile });
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return size;
};
export default useFlipbookSize;