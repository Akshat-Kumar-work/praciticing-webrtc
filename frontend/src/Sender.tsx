import { useEffect, useState,useRef } from "react";

const Sender = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const connection = useRef(new RTCPeerConnection({
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ]
  })).current;

  useEffect(() => {
    const newSocket = new WebSocket('ws://localhost:8080');
    setSocket(newSocket);

    newSocket.onopen = () => {
      newSocket.send(JSON.stringify({ type: 'sender' }));
    };

    newSocket.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "create-answer") {
        await connection.setRemoteDescription(new RTCSessionDescription(data.sdp));
      } else if (data.type === "iceCandidate") {
        await connection.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    };

    // Cleanup WebSocket connection on component unmount
    return () => {
      newSocket.close();
    };
  }, [connection]);

  const handleSendVideo = async () => {
    if (!socket) return;

    connection.onnegotiationneeded = async () => {
      const offer = await connection.createOffer();
      await connection.setLocalDescription(offer);
      socket.send(JSON.stringify({ type: 'create-offer', sdp: connection.localDescription }));
    };

    connection.onicecandidate = (event:any) => {
      if (event.candidate) {
        socket.send(JSON.stringify({ type: 'iceCandidate', candidate: event.candidate }));
      }
    };

    // Access camera and add video track
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      stream.getTracks().forEach(track => connection.addTrack(track, stream));
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  };

  return (
    <div>
      Sender
      <button onClick={handleSendVideo}>Send Video</button>
    </div>
  );
};

export default Sender;
