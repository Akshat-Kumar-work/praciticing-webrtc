import { useEffect, useState, useRef } from "react";

export const Receiver = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    const newSocket = new WebSocket("ws://localhost:8080");
    setSocket(newSocket);

    newSocket.onopen = () => {
      newSocket.send(JSON.stringify({ type: "receiver" }));
    };

    newSocket.onmessage = async (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "create-offer") {
        var iceConfiguration = {
          iceServers: [
            {
              urls: "stun:stun.l.google.com:19302",
            },
            {
              urls: "stun:stun1.l.google.com:19302",
            },
          ],
        };

        // Create a new peer connection
        const connection = new RTCPeerConnection(iceConfiguration);
        peerConnection.current = connection;


                // Handle incoming media streams
                connection.ontrack = (event) => {
                  console.log("inside ontrack");
                  if (videoRef.current) {
                    videoRef.current.srcObject = event.streams[0];
                  }
                  console.log(videoRef.current);
                };
        
                        // Handle ICE candidates
                        connection.onicecandidate = (event) => {
                          if (event.candidate) {
                            newSocket.send(
                              JSON.stringify({
                                type: "iceCandidate",
                                candidate: event.candidate,
                              })
                            );
                          }
                        };
        // Handle incoming media streams
        connection.ontrack = (event) => {
          console.log("inside ontrack");
          if (videoRef.current) {
            videoRef.current.srcObject = event.streams[0];
          }
          console.log(videoRef.current);
        };

                // Handle ICE candidates
                connection.onicecandidate = (event) => {
                  if (event.candidate) {
                    newSocket.send(
                      JSON.stringify({
                        type: "iceCandidate",
                        candidate: event.candidate,
                      })
                    );
                  }
                };

                


        // Set the remote description from the sender's offer
        //here is a bug, were not  creating  RTC session description object we are directly using the sdp 
        await connection.setRemoteDescription(new RTCSessionDescription(message.sdp) );

        // Create and send an answer to the sender
        const answer = await connection.createAnswer();
        await connection.setLocalDescription(answer);
        //sending answer here directly
        newSocket.send(JSON.stringify({ type: "create-answer", sdp: answer }));





      } else if (message.type === "iceCandidate" && peerConnection.current) {
        console.log("adding ice candidate");
        // Add received ICE candidates
        await peerConnection.current.addIceCandidate(
          new RTCIceCandidate(message.candidate)
        );
      }
    };

    // Cleanup on component unmount
    return () => {
      newSocket.close();
      peerConnection.current?.close();
    };
  }, []);

  return (
    <div>
      Receiver
      <video
        autoPlay
        playsInline
        muted
        ref={videoRef}
        height="100px"
        width="200px"
      />
    </div>
  );
};
