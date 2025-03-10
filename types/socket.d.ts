interface ServerToClientEvents {
  noArg: () => void
  message: (data: string) => void
  // basicEmit: (a: number, b: string, c: Buffer) => void
  // withAck: (d: string, callback: (e: number) => void) => void
}

interface ClientToServerEvents {
  input: (data: string) => void
}

interface InterServerEvents {
  ping: () => void
}

// interface SocketData {
//   name: string
//   age: number
// }

export type IdeClientSocket = ClientSocket<ServerToClientEvents, ClientToServerEvents>

export interface SocketData {
  terminal: IPty
}
