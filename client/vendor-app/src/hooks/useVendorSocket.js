import { useEffect, useState } from "react";
import { vendorSocket } from "../socket/socketManager";

export const useVendorSocket = (vendorId, isOnline) => {
  const [jobAlert, setJobAlert] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  useEffect(() => {
    if (isOnline) {
      vendorSocket.connect();
    } else {
      vendorSocket.disconnect();
    }

    vendorSocket.on("connect", () => {
      setIsSocketConnected(true);
      vendorSocket.emit("vendorConnect", vendorId);
    });

    vendorSocket.on("disconnect", () => {
      setIsSocketConnected(false);
      console.log("Vendor disconnected from server.");
    });

    vendorSocket.on("newJobAlert", (payload) => {
      console.log("Received new job alert!");
      setJobAlert(payload);
    });

    return () => {
      vendorSocket.off("connect");
      vendorSocket.off("disconnect");
      vendorSocket.off("newJobAlert");
    };
  }, [isOnline, vendorId]);

  return { jobAlert, isSocketConnected, vendorSocket };
};
