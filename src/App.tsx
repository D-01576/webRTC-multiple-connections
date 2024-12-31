/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect, useRef, useState } from 'react'
import './App.css'
import Rooms from './component/rooms'
import RoomNamePopup from './component/addRoom';
import axios from 'axios';
import { FaMicrophoneAlt, FaMicrophoneAltSlash } from 'react-icons/fa';
import { IoVideocam, IoVideocamOff } from 'react-icons/io5';

interface Room {
  RoomName: string;
  sdp: string;
}
//@ts-ignore
let videoTrack: MediaStreamTrack | null = null;
//@ts-ignore
let audioTrack: MediaStreamTrack | null = null; 
//@ts-ignore
let pc = null

function App() {
  const [Room, setRoom] = useState([])
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [myroom,setmyroom] = useState<string>("")
  const [wait, setwait] = useState<boolean>(true)
  const [waitofsender, setwos] = useState<boolean>(false)
  const [right, setright] = useState<boolean>(true)
  const [mobile, setmobile] = useState<boolean>(false)
  const [leaveoption, setleaveoption] = useState<boolean>(false)
  const [leftvideo,setleftvideo] = useState<boolean>(false)
  const [videorunning, setvideorunning] = useState<boolean>(true);
  const [audiorunning, setaudiorunning] = useState<boolean>(true);
  const selfVideo = useRef<HTMLVideoElement>(null);
  const userVideo = useRef<HTMLVideoElement>(null);
  // const [pc, setpc] = useState<RTCPeerConnection | null>(null);

  const handleOpenPopup = () => setIsPopupOpen(true);
  const handleClosePopup = () => setIsPopupOpen(false);

  // useEffect(()=>{
  //   if(leaveoption){
  //     .uservide{
  //       height: 100%;
  //       width: 65%;
  //     }
  //   }else {
  //     .mevideo{
  //         height: 100%;
  //         width: 65%;
  //     }
  //   }
  // },[leaveoption])

  useEffect(()=>{
    async function roomupdate() {
      const res = await axios.get("https://webrtc-multiple-connections.onrender.com/Rooms");
      setRoom(res.data.Rooms)
    }

    roomupdate()
    const getCam = async () => {
        const stream = await window.navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        })
        // MediaStream
        audioTrack = stream.getAudioTracks()[0]
        videoTrack = stream.getVideoTracks()[0]
        if (!userVideo.current) {
            return;
        }
        //@ts-ignore
        selfVideo.current.srcObject = new MediaStream([videoTrack])
        // MediaStream
    }
    getCam()
    const wss = new WebSocket("wss://webrtc-multiple-connections.onrender.com/")
    setSocket(wss)
    wss.onmessage = (e)=>{
      const data = JSON.parse(e.data);
      if(data.type == "rooms-update"){
        setRoom(data.rooms)
      }else if(data.type == "leave-room"){
        if (userVideo.current) {
          const mediaStream = userVideo.current.srcObject;
          if (mediaStream) {
            //@ts-ignore
            const tracks = mediaStream.getTracks();
            //@ts-ignore
            tracks.forEach((track) => track.stop());
            userVideo.current.srcObject = null;
          }
        }
        setleaveoption(false);
        setleftvideo(true)
        
      }
      else if(data.type === "order-create-offer"){
        setwos(false)
        pc = new RTCPeerConnection({
          iceServers: [
            {
              urls: ["stun:ss-turn1.xirsys.com"]
            },
            {
              username: "qPuPXUyOUw8gS71ux-nRTVnXW0VPuhD3oCX-aq_qGZZkF6BPbNYciQowAVA0Tkp1AAAAAGdu8SlzYXJmYXJhejAxNTc2",
              credential: "fcfb62a6-c47f-11ef-8a59-0242ac140004",
              urls: [
                "turn:ss-turn1.xirsys.com:80?transport=udp",
                "turn:ss-turn1.xirsys.com:3478?transport=udp",
                "turn:ss-turn1.xirsys.com:80?transport=tcp",
                "turn:ss-turn1.xirsys.com:3478?transport=tcp",
                "turns:ss-turn1.xirsys.com:443?transport=tcp",
                "turns:ss-turn1.xirsys.com:5349?transport=tcp"
              ]
            }
          ]
        });

        pc.ontrack = ()=>{
          const newmedia = new MediaStream();
          //@ts-ignore
          const track1 : MediaStreamTrack | undefined = pc?.getTransceivers()[0].receiver.track
          if(track1 === undefined) return
          newmedia.addTrack(track1);
          //@ts-ignore
          const track2 : MediaStreamTrack | undefined  = pc?.getTransceivers()[1].receiver.track
          if(track2 === undefined) return
          newmedia.addTrack(track2);
          // userVideo.current.srcObject.addTrack(track1)
          //@ts-ignore
          userVideo.current.srcObject = newmedia;
          ismobile()
          setwait(false)
          setleaveoption(true)
          //@ts-ignore
          userVideo.current.play()
        }
        

        pc.onicecandidate = (event)=>{
          if(event.candidate){
            wss.send(JSON.stringify({
              type : "ice-candidate",
              role : "sender",
              candidate : event.candidate
            }))
          }
        }

        pc.onnegotiationneeded = async ()=>{
          //@ts-ignore
          const offer = await pc.createOffer();
          //@ts-ignore
          pc.setLocalDescription(offer);
          wss?.send(JSON.stringify({type :"create-offer", RoomName: data.RoomName, sdp : offer}));
        }
        getCameraStreamAndSend(pc)
      }
      else if(data.type === "create-offer"){
        pc = new RTCPeerConnection({
          iceServers: [
            {
              urls: ["stun:ss-turn1.xirsys.com"]
            },
            {
              username: "qPuPXUyOUw8gS71ux-nRTVnXW0VPuhD3oCX-aq_qGZZkF6BPbNYciQowAVA0Tkp1AAAAAGdu8SlzYXJmYXJhejAxNTc2",
              credential: "fcfb62a6-c47f-11ef-8a59-0242ac140004",
              urls: [
                "turn:ss-turn1.xirsys.com:80?transport=udp",
                "turn:ss-turn1.xirsys.com:3478?transport=udp",
                "turn:ss-turn1.xirsys.com:80?transport=tcp",
                "turn:ss-turn1.xirsys.com:3478?transport=tcp",
                "turns:ss-turn1.xirsys.com:443?transport=tcp",
                "turns:ss-turn1.xirsys.com:5349?transport=tcp"
              ]
            }
          ]
        });; 
        
        pc.ontrack = ()=>{
          const newmedia = new MediaStream();
          //@ts-ignore
          const track1 : MediaStreamTrack | undefined = pc?.getTransceivers()[0].receiver.track
          if(track1 === undefined) return
          newmedia.addTrack(track1);
          //@ts-ignore
          const track2 : MediaStreamTrack | undefined  = pc?.getTransceivers()[1].receiver.track
          if(track2 === undefined) return
          newmedia.addTrack(track2);
          // userVideo.current.srcObject.addTrack(track1)
          //@ts-ignore
          userVideo.current.srcObject = newmedia;
          ismobile()
          setwait(false)
          setleaveoption(true)
          //@ts-ignore
          userVideo.current.play()
        }
        setTimeout(() => {
          const newmedia = new MediaStream();
          //@ts-ignore
          const track1 : MediaStreamTrack | undefined = pc?.getTransceivers()[0].receiver.track
          if(track1 === undefined) return
          newmedia.addTrack(track1);
          //@ts-ignore
          const track2 : MediaStreamTrack | undefined  = pc?.getTransceivers()[1].receiver.track
          if(track2 === undefined) return
          newmedia.addTrack(track2);
          // userVideo.current.srcObject.addTrack(track1)
          //@ts-ignore
          userVideo.current.srcObject = newmedia;
          ismobile()
          setwait(false)
          setleaveoption(true)
          //@ts-ignore
          userVideo.current.play()
        }, 300);
        pc.onicecandidate = (event)=>{
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
          //@ts-ignore
          pc?.createAnswer().then((answer)=>{
            //@ts-ignore
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
      else if(data.type === "create-answer"){
        //@ts-ignore
        pc?.setRemoteDescription(data.sdp);
      }else if(data.type === "ice-candidate"){
        //@ts-ignore
        pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    }
  },[])
  const handleRoomSubmit = (roomName: string) => {
    socket?.send(JSON.stringify({
      type : "create-room",
      RoomName : roomName
    }))
    setIsPopupOpen(false);
    setright(false)
    setmyroom(roomName)
    setwos(true)
  };

  const handlejoining = async (room: Room)=>{
    socket?.send(JSON.stringify({
      type : "join-room",
      RoomName : room.RoomName
    }))
    setright(false)
    setmyroom(room.RoomName)
  }

  const leavelive = ()=>{
    socket?.send(JSON.stringify({
      type: "leave-room",
      RoomName : myroom
    }))
  }

  //@ts-ignore
  const getCameraStreamAndSend = (pc) => {
        //@ts-ignore
        pc?.addTrack(videoTrack)
        //@ts-ignore
        pc?.addTrack(audioTrack)
  }

  const videohandle = () => {
    if(videorunning){
      if (videoTrack) videoTrack.enabled = false;
    }else {
      if (videoTrack) videoTrack.enabled = true;
    }

    setvideorunning(!videorunning)
  };
  
  const audiohandle = () => {
    if(audiorunning){
      if (audioTrack) audioTrack.enabled = false;
    }else {
      if (audioTrack) audioTrack.enabled = true;
    }

    setaudiorunning(!audiorunning)
    console.log(audiorunning)
  };
  function ismobile(){
    if(userVideo.current){
      userVideo.current.onloadedmetadata = () => {
        const videoWidth = userVideo.current?.videoWidth || 0;
        const videoHeight = userVideo.current?.videoHeight || 0;
        console.log("Video Width:", videoWidth, "Video Height:", videoHeight);

        if(videoWidth < videoHeight){
          setmobile(true)
        }
      }
    }
  }
  
  return (
    <div className='page'>
      <div className='left'>
        <div className={leaveoption ? "mevideo" : 'mevideo livebig' }>
            <h2 className='melabel'>ME</h2>
            <div>
              <button className='videorunning' onClick={videohandle}>{videorunning ? <IoVideocam /> : <IoVideocamOff />}</button>
              <button className='audiorunning' onClick={audiohandle}>{audiorunning ? <FaMicrophoneAlt /> : <FaMicrophoneAltSlash />}</button>
            </div>
            <video autoPlay playsInline width={400} height={400} ref={selfVideo} controls className='video'/>
        </div>
        <div className={(() => {
          if (leaveoption) {
            if (mobile) {
              return 'uservide livebig mobilel';
            } else {
              return 'uservide livebig';
            }
          }
          return 'uservide';
        })()}>
            <h2 className='otherlabel'>Other</h2>
            {wait && (
              <div className='wait'>wait</div>
            )}
            {/* {!wait && ( */}

              <video autoPlay playsInline width={400} height={400} ref={userVideo} controls className='video' />
            {/* )}  */}
        </div>
      </div>
      {right && (
      <div className='right'>
        <button className='addBtn' onClick={handleOpenPopup}>Add Room</button>
        <Rooms Rooms={Room} handlejoin={handlejoining}></Rooms>
      </div>
      )}
      {!right && (
        <div className='ifright'>

          <h3 className='myroom'>Your room : {myroom}</h3>
        {waitofsender && (
          <div className='waitwhile'>wait while anyone join</div>
        )}
        {leaveoption && (
          <button onClick={leavelive}>End Call</button>
        )}
        {leftvideo && (
          <div className='lleftcall'>
            <h3>User left</h3>
            <button onClick={()=>{
              window.location.reload()
            }}>Join another call</button>
          </div>
        )}
        </div>
      )}
      {isPopupOpen && (
        <RoomNamePopup onSubmit={handleRoomSubmit} onClose={handleClosePopup} />
      )}
    </div>
  )
}

export default App
