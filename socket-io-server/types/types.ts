export interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void,
  withAck: (a: number, b: string, c: Buffer) => void
  newMessage: (msg: Message) => void;
}

export type ClientMessagePayload = {
  text: string;
  token?: string;
};

export interface ClientToServerEvents {
  sendMessage: (payload: ClientMessagePayload) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  auth?: {
    token: string;
    userId?: string;
  };
}


export type Message = {
  id: string;
  text: string;
  sender: "system" | "user";
  timestamp: string;
  avatar?: string;
};
