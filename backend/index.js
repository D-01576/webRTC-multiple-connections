const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const cors = require("cors")

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
let Rooms = [];
let chatting = [];
let connections = [];
app.use(cors())
app.get('/', (req, res) => {
  res.send('WebSocket server is running.');
});

app.get("/rooms",(req,res)=>{
  res.json({
    Rooms: Rooms
  })
})

function broadcastRooms() {
  const sanitizedRooms = Rooms.map(room => {
    return {
      RoomName: room.RoomName,
      sdp: room.sdp,
      // Exclude `ws` in the broadcast
    };
  });

  connections.forEach(connection => {
    connection.send(JSON.stringify({ type: "rooms-update", rooms: sanitizedRooms }));
  });
}

wss.on('connection', (ws) => {
  connections.push(ws);
  console.log("Client connected");

  ws.on('message', (message) => {
    console.log("message received")
    const data = JSON.parse(message);

    if (data.type === "create-room") {
      Rooms.push({ RoomName: data.RoomName, ws: ws });
      console.log("offered")
      broadcastRooms();
    }else if(data.type === "join-room"){
      console.log("join-room")
      const targetWS = Rooms.find(room => room.RoomName === data.RoomName).ws;
      const index = Rooms.findIndex(item => item.RoomName === data.RoomName);
      if (index !== -1) {
        Rooms.splice(index, 1);
        console.log("removed");
        broadcastRooms(); 
        console.log(Rooms)
      }
      chatting.push({RoomName : data.RoomName, sender : targetWS, receiver : ws});
      targetWS.send(JSON.stringify({
        type:"order-create-offer",
        RoomName : data.RoomName,
      }))
    }else if(data.type === "create-offer"){
      console.log("create-offer")
      const targetWS = chatting.find(chat => chat.RoomName === data.RoomName).receiver;
      targetWS.send(JSON.stringify({
        type: "create-offer",
        RoomName : data.RoomName,
        sdp : data.sdp
      }))
    }else if(data.type === "create-answer"){
      console.log("create-answer")
      // console.log(data)
      const targetws = chatting.find(room => room.RoomName === data.RoomName).sender;
      // console.log(targetws)
      targetws.send(JSON.stringify({
        type : "create-answer",
        RoomName : data.RoomName,
        sdp : data.sdp,
      }))
    }else if(data.type === "ice-candidate"){
      console.log("icecandate")
      if(data.role === "sender"){
        console.log("sender")
        const targetWS = chatting.find(chat => chat.sender === ws).receiver;
        setTimeout(() => {
          targetWS.send(JSON.stringify({
            type : "ice-candidate",
            role: "receiver",
            candidate: data.candidate
          }))
        }, 500);
      }else {
        console.log("receiver")
        const targetWS = chatting.find(chat => chat.receiver === ws).sender;
        setTimeout(() => {
          targetWS.send(JSON.stringify({
            type : "ice-candidate",
            candidate: data.candidate
          }))
        }, 500);
      }
    }
  });

  ws.on('close', () => {
    const index = Rooms.findIndex(item => item.ws === ws);

    if (index !== -1) {
      Rooms.splice(index, 1);
      console.log("removed");
      broadcastRooms(); 
      console.log(Rooms)
    }
    const connectionIndex = connections.indexOf(ws);
    if (connectionIndex !== -1) {
      connections.splice(connectionIndex, 1);
    }

    console.log('Client disconnected');
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
