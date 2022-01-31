import { WebSocketServer, WebSocket } from "ws";
import { v4 as uuid } from "uuid";

const wss = new WebSocketServer({ port: 3000 });

interface IMessage {
   name: string;
   message: string;
}

const clients: Record<string, WebSocket> = {};
const messages: IMessage[] = [];

wss.on("connection", (ws) => {
   const id = uuid();

   clients[id] = ws;

   console.log(`New connection: ${id}`);

   for (const message of messages) {
      ws.send(JSON.stringify(message));
   }

   ws.on("close", () => {
      delete clients[id];
      console.log(`Connection ${id} was closed`);
   });

   ws.on("message", (rawMessage) => {
      const { name, message } = JSON.parse(rawMessage.toString());
      messages.push({ name, message });

      for (const id in clients) {
         clients[id].send(JSON.stringify({ name: name, message: message }));
      }
   });
});
