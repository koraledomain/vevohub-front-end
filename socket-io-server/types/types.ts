export interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void,
  withAck: (a: number, b: string, c: Buffer) => void
  newMessage: (msg: Message) => void;
}

export interface ClientToServerEvents {
  sendMessage: (text: string) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  name: string;
  age: number;
}


export type Message = {
  id: string;
  text: string;
  sender: "system" | "user";
  timestamp: string;
  avatar?: string;
};
