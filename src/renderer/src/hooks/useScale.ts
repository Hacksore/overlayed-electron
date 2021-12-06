import { useEffect, useState } from "react";
import settings from "../services/settingsService";

// get scale from local storage
export const useScale = () => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const localScale = settings.get("scale");
    setScale(parseFloat(localScale));
  }, []);

  return scale;
};
