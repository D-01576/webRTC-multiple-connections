import { useEffect, useRef, useState } from 'react'
import './App.css'
import Rooms from './component/rooms'
import RoomNamePopup from './component/addRoom';

interface Room {
  RoomName: string;
  sdp: string;
}
let videoTrack = null;
//@ts-ignore
let audioTrack = null; 
let pc = null

function App() {
  const [Room, setRoom] = useState([])
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<MediaStreamTrack | null>(null);
  const [localVideoTrack, setlocalVideoTrack] = useState<MediaStreamTrack | null>(null);
  const [wait, setwait] = useState<boolean>(true)
  const selfVideo = useRef<HTMLVideoElement>(null);
  const userVideo = useRef<HTMLVideoElement>(null);
  // const [pc, setpc] = useState<RTCPeerConnection | null>(null);

  const handleOpenPopup = () => setIsPopupOpen(true);
  const handleClosePopup = () => setIsPopupOpen(false);

  useEffect(()=>{
    const getCam = async () => {
        const stream = await window.navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        })
        // MediaStream
        audioTrack = stream.getAudioTracks()[0]
        videoTrack = stream.getVideoTracks()[0]
        setLocalAudioTrack(audioTrack);
        setlocalVideoTrack(videoTrack);
        if (!userVideo.current) {
            return;
        }
        //@ts-ignore
        selfVideo.current.srcObject = new MediaStream([videoTrack])
        // MediaStream
    }
    getCam()
    const wss = new WebSocket("http://192.168.18.222:3000/")
    setSocket(wss)
    wss.onmessage = (e)=>{
      const data = JSON.parse(e.data);
      if(data.type === "order-create-offer"){
        console.log("order to create offer")
        pc = new RTCPeerConnection();

        pc.ontrack = (e)=>{
          const newmedia = new MediaStream();
          const track1 : MediaStreamTrack | undefined = pc?.getTransceivers()[0].receiver.track
          console.log("track1",track1)
          if(track1 === undefined) return
          newmedia.addTrack(track1);
          const track2 : MediaStreamTrack | undefined  = pc?.getTransceivers()[1].receiver.track
          if(track2 === undefined) return
          newmedia.addTrack(track2);
          // userVideo.current.srcObject.addTrack(track1)
          //@ts-ignore
          userVideo.current.srcObject = newmedia;
          setwait(false)
          //@ts-ignore
          userVideo.current.play()
        }
        

        pc.onicecandidate = (event)=>{
          console.log("snder candidate to send")
          if(event.candidate){
            console.log("candidate available ")
            wss.send(JSON.stringify({
              type : "ice-candidate",
              role : "sender",
              candidate : event.candidate
            }))
            console.log(event.candidate)
          }
        }

        pc.onnegotiationneeded = async ()=>{
          const offer = await pc.createOffer();
          pc.setLocalDescription(offer);
          wss?.send(JSON.stringify({type :"create-offer", RoomName: data.RoomName, sdp : offer}));
        }
        getCameraStreamAndSend(pc)
      }
      else if(data.type === "create-offer"){
        console.log("created offer")
        pc = new RTCPeerConnection(); 
        
        pc.ontrack = ()=>{
          console.log("klj")
          const newmedia = new MediaStream();
          const track1 : MediaStreamTrack | undefined = pc?.getTransceivers()[0].receiver.track
          console.log("track1",track1)
          if(track1 === undefined) return
          newmedia.addTrack(track1);
          const track2 : MediaStreamTrack | undefined  = pc?.getTransceivers()[1].receiver.track
          if(track2 === undefined) return
          newmedia.addTrack(track2);
          // userVideo.current.srcObject.addTrack(track1)
          //@ts-ignore
          userVideo.current.srcObject = newmedia;
          setwait(false)
          //@ts-ignore
          userVideo.current.play()
        }
        setTimeout(() => {
          const newmedia = new MediaStream();
          const track1 : MediaStreamTrack | undefined = pc?.getTransceivers()[0].receiver.track
          console.log("track1",track1)
          if(track1 === undefined) return
          newmedia.addTrack(track1);
          const track2 : MediaStreamTrack | undefined  = pc?.getTransceivers()[1].receiver.track
          if(track2 === undefined) return
          newmedia.addTrack(track2);
          // userVideo.current.srcObject.addTrack(track1)
          //@ts-ignore
          userVideo.current.srcObject = newmedia;
          setwait(false)
          //@ts-ignore
          userVideo.current.play()
        }, 8000);
        pc.onicecandidate = (event)=>{
          console.log("receiver candidate to send")
          if(event.candidate){
            wss.send(JSON.stringify({
              type : "ice-candidate",
              role : "recevier",
              candidate : event.candidate
            }))
          }
        }
        //@ts-ignore
        pc.setRemoteDescription(data.sdp).then(()=>{
          pc?.createAnswer().then((answer)=>{
            pc.setLocalDescription(answer);
            wss.send(JSON.stringify({
              type: "create-answer",
              RoomName : data.RoomName,
              sdp : answer
            }))
          })
        })
        getCameraStreamAndSend(pc)
      }
      else if(data.type === "rooms-update"){
        setRoom(data.rooms)
      }else if(data.type === "create-answer"){
        console.log("created answer")
        //@ts-ignore
        pc?.setRemoteDescription(data.sdp);
      }else if(data.type === "ice-candidate"){
        // if(data.role === "receiver"){

        //   console.log(data.candidate)
        // }
        // console.log(dsetTimeata.candidate)
        console.log(pc)
        pc?.addIceCandidate(data.candidate)
      }
    }
  },[])
  const handleRoomSubmit = (roomName: string) => {
    socket?.send(JSON.stringify({
      type : "create-room",
      RoomName : roomName
    }))
    setIsPopupOpen(false);
  };

  const handlejoining = async (room: Room)=>{
    socket?.send(JSON.stringify({
      type : "join-room",
      RoomName : room.RoomName
    }))
  }

  //@ts-ignore
  const getCameraStreamAndSend = (pc) => {
        //@ts-ignore
        pc?.addTrack(videoTrack)
        //@ts-ignore
        pc?.addTrack(audioTrack)
  }
  return (
    <div className='page'>
      <div className='left'>
        <div>
            <h2>ME</h2>
        <video autoPlay width={400} height={400} ref={selfVideo} />
        </div>
        <div className='uservide'>
            <h2>Other</h2>
            {wait && (
              <div className='wait'>wait</div>
            )}
            {/* {!wait && ( */}

        <video autoPlay width={400} height={400} ref={userVideo} />
            {/* )}  */}
        </div>
      </div>
      <div className='right'>
        <button className='addBtn' onClick={handleOpenPopup}>Add Room</button>
        <Rooms Rooms={Room} handlejoin={handlejoining}></Rooms>
      </div>
      {isPopupOpen && (
        <RoomNamePopup onSubmit={handleRoomSubmit} onClose={handleClosePopup} />
      )}
    </div>
  )
}

export default App
