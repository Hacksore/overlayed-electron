import { useEffect } from "react";
import socketService from "../services/socketService";

interface IType {
  height: number;
  offset?: number;
};

export const useWindowResize = ({ height , offset = 0}: IType) => {  
  useEffect(() => {
    console.log("resize", height)
    socketService.send({ event: "WINDOW_RESIZE", data: { height: height + offset } });
  }, [height, offset]);
};
