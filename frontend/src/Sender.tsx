import { useEffect, useState } from "react"


const Sender = () => {

  const [socket,setSocket] = useState<WebSocket | null>(null);

  useEffect( ()=>{
    const socket = new WebSocket('ws://localhost:8080');
    setSocket(socket);
    socket.onopen = ()=>{
      socket.send(JSON.stringify({type:'sender'}));
    }
  },[]);

  const handleSendVideo = async()=>{

    //create web rtc peer connection
    const connection = new RTCPeerConnection();
    const offer = await connection.createOffer();
    await connection.setLocalDescription(offer);
    socket?.send(JSON.stringify({type:'create-offer',sdp:connection.localDescription}));

  }

  return (
    <div>
      Sender


      <button onClick={handleSendVideo}>Send Video</button>

    </div>
  )
}

export default Sender