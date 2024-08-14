import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

//to store socket id globally
let senderSocket: null | WebSocket = null;
let receiverSocket: null | WebSocket = null;

wss.on("connection", (ws) => {
  ws.on("error", console.error);

  ws.on("message", (data: any) => {
    const message = JSON.parse(data);

    if (message.type === "identify-as-sender") {
      senderSocket = ws;
    } else if (message.type === "identify-as-receiver") {
      receiverSocket = ws;
    } else if (message.type === "create-offer") {
      //checking if offer is sended by sender socket only, if not return
      if (ws !== senderSocket) {
        return;
      }

      //sending offer to receiver socket
      receiverSocket?.send(
        JSON.stringify({ type: "create-offer", sdp:message.sdp })
      );
    } else if (message.type === "create-answer") {
      //checking if answer is sended by receiver socket only, if not return
      if (ws !== receiverSocket) {
        return;
      }

      //sending answer to sender socket
      senderSocket?.send(
        JSON.stringify({ type: "create-answer", sdp:message.sdp })
      );
    }
    //if message type is ice-candidate
     else if (message.type === "ice-candidate"){
        //if socket is sender , send the ice-candidate to receiver socket
        if(ws===senderSocket){
            receiverSocket?.send(JSON.stringify({type:"iceCandidate",candidate:message.candidate}))
        }
        //if socket is receiver , send the ice-candidate to sender socket
         else if (ws===receiverSocket){
            senderSocket?.send(JSON.stringify({type:"iceCandidate",candidate:message.candidate}))
        }
    }

    
  });
});
