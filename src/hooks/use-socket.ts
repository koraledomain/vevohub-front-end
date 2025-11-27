import {io, Socket} from "socket.io-client";
import {useEffect, useRef} from "react";

export function useSocket(url: string, authToken?: string) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(url, {
      transports: ["websocket"],
      auth: authToken ? {token: authToken} : undefined,
    });
    return () => {
      socketRef.current?.disconnect();
    };
  }, [url, authToken]);

  return socketRef;
}
