import { useEffect } from "react";
import { CustomEvents } from "root/src/common/constants";
import socketService from "../services/socketService";

interface IType {
  height: number;
  offset?: number;
}

export const useWindowResize = ({ height, offset = 0 }: IType) => {
  useEffect(() => {
    console.log("resize", height);
    socketService.send({ event: CustomEvents.WINDOW_RESIZE, data: { height: height + offset } });
  }, [height, offset]);
};
