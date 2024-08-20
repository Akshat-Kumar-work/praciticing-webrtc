import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

//to store socket id globally
let senderSocket: null | WebSocket = null;
let receiverSocket: null | WebSocket = null;

wss.on("connection", (ws) => {
  ws.on("error", console.error);

  ws.on("message", (data: any) => {
    const message = JSON.parse(data);

    if (message.type === "sender") {
      console.log("sender set");
      senderSocket = ws;
    } else if (message.type === "receiver") {
      console.log("receiver set");
      receiverSocket = ws;
    } else if (message.type === "create-offer") {
      //checking if offer is sended by sender socket only, if not return
      if (ws !== senderSocket) {
        return;
      }

      console.log("sending offer to receiver")
      //sending offer to receiver socket
      receiverSocket?.send(
        JSON.stringify({ type: "create-offer", sdp:message.sdp })
      );

    } else if (message.type === "create-answer") {
      console.log("inside create answer message type")
      //checking if answer is sended by receiver socket only, if not return
      if (ws !== receiverSocket) {
        return;
      }

      console.log("sending answer to sender")
      //sending answer to sender socket
      senderSocket?.send(
        JSON.stringify({ type: "create-answer", sdp:message.sdp })
      );
    }
    //if message type is ice-candidate
     else if (message.type === "iceCandidate"){
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
