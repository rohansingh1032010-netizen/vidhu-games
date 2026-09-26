const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const crypto = require("crypto");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static("public"));

const rooms = new Map();
const COLORS = ["#2563eb","#ef4444","#22c55e","#a855f7"];

function makeCode(){
  let c;
  do { c = crypto.randomBytes(3).toString("hex").toUpperCase(); }
  while(rooms.has(c));
  return c;
}
function publicRoom(room){
  return {
    code: room.code,
    players: [...room.players.values()].map(p=>({
      id:p.id,name:p.name,color:p.color,x:p.x,y:p.y,score:p.score,boost:p.boost
    }))
  };
}
function broadcast(room){
  io.to(room.code).emit("state", publicRoom(room));
}

io.on("connection", socket=>{
  socket.on("createRoom", ({name})=>{
    const code=makeCode();
    const room={code,players:new Map()};
    rooms.set(code,room);
    join(socket,room,String(name||"Player 1").slice(0,16));
  });

  socket.on("joinRoom", ({code,name})=>{
    const room=rooms.get(String(code||"").toUpperCase());
    if(!room) return socket.emit("errorMsg","Room not found.");
    if(room.players.size>=4) return socket.emit("errorMsg","Room is full (maximum 4 players).");
    join(socket,room,String(name||"Player").slice(0,16));
  });

  socket.on("input", data=>{
    const room=rooms.get(socket.data.room);
    const p=room?.players.get(socket.id);
    if(!p) return;
    const dx=Math.max(-1,Math.min(1,Number(data.dx)||0));
    p.x=Math.max(8,Math.min(92,p.x+dx*1.8));
    p.boost=!!data.boost;
    if(p.boost) p.score+=1;
    broadcast(room);
  });

  socket.on("resetRace",()=>{
    const room=rooms.get(socket.data.room);
    if(!room) return;
    for(const p of room.players.values()){p.x=50;p.y=82;p.score=0;p.boost=false;}
    broadcast(room);
  });

  socket.on("disconnect",()=>{
    const code=socket.data.room, room=rooms.get(code);
    if(!room) return;
    room.players.delete(socket.id);
    if(room.players.size===0) rooms.delete(code);
    else broadcast(room);
  });
});

function join(socket,room,name){
  const p={
    id:socket.id,name,
    color:COLORS[room.players.size%COLORS.length],
    x:50,y:82,score:0,boost:false
  };
  room.players.set(socket.id,p);
  socket.data.room=room.code;
  socket.join(room.code);
  socket.emit("joined",{code:room.code,id:socket.id});
  broadcast(room);
}

const PORT=process.env.PORT||3000;
server.listen(PORT,()=>console.log("Racing server on port "+PORT));
