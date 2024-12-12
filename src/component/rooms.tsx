interface Room {
    RoomName: string;
    sdp: string;
  }
  
  interface RoomsProps {
    Rooms: Room[];
    handlejoin: (room: Room) => void;
  }
  
  export default function Rooms({ Rooms, handlejoin }: RoomsProps) {
    return (
      <div className="Rooms">
        {Rooms.map((room, index) => (
          <div key={index} className="Room">
            <h3 className="RoomName">{room.RoomName}</h3>
            <button
              onClick={() => {
                handlejoin(room);
              }}
            >
              Join
            </button>
          </div>
        ))}
      </div>
    );
  }
  