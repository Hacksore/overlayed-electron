import { useEffect, useState } from "react";

// get scale from local storage
export const useScale = () => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const localScale = localStorage.getItem("scale") || "";
    setScale(2 + 0.2 * parseFloat(localScale));
  }, []);

  return scale;
};
