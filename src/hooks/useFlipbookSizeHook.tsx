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
      const screenHeight = window.innerHeight;

      const isMobile = screenWidth < 768;

      let width;
      let height;

      if (isMobile) {
        // 📱 MOBILE → FULL SCREEN
        console.log(screenWidth);
        console.log(screenHeight);
        
        width = screenWidth;     // 100vw
        height = screenHeight;   // 100vh
      } else {
        // 💻 DESKTOP → keep your logic
        width = Math.min(screenWidth * 0.9, 1300);
        height = width * 1.15;
      }

      setSize({ width, height, isMobile });
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return size;
};

export default useFlipbookSize;