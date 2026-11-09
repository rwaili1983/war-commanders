'use strict';
/** Self-contained LAN/cloud test server; Node.js >=20, no npm install. One process only. */
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const os=require('node:os');
const dgram=require('node:dgram');
const E=require('./public/engine.js');
const PORT=Number(process.env.PORT)||8787;
const MAX_ROOMS=Math.min(90,Math.max(1,Number(process.env.MAX_ROOMS)||30));
const MAX_SSE=Math.min(150,Math.max(4,Number(process.env.MAX_SSE)||60));
const MAX_SSE_PER_IP=6;
const limits=new Map();
function addr(req){return req.socket.remoteAddress||'unknown';}
function quota(key,count,windowMs){
  const now=Date.now(); const old=limits.get(key);
  if(!old||old.expires<now){limits.set(key,{count:1,expires:now+windowMs});return true;}
  old.count++; return old.count<=count;
}
function sameOrigin(req){
  if(!req.headers.origin)return true;
  try{return new URL(req.headers.origin).host===req.headers.host;}catch{return false;}
}

const PUBLIC=path.join(__dirname,'public');
const rooms=new Map();
const clients=new Map();
const streams=new Map();
let nextClient=0;
function cleanNick(input){return String(input||'قائد').trim().replace(/[<>"'\\]/g,'').slice(0,22)||'قائد';}
function json(res,status,obj){const body=JSON.stringify(obj);res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(body);}
function error(res,code,message){json(res,code,{ok:false,error:message});}
function code(){let c;do{c=crypto.randomBytes(3).toString('hex').toUpperCase()}while(rooms.has(c));return c;}
function token(){return crypto.randomBytes(24).toString('base64url');}
function safeData(str){return typeof str==='string'&&str.length<256?str:'';}
function roomView(room){return {code:room.code,public:room.public,capacity:room.capacity||2,joined:room.players.filter(Boolean).length,players:room.players.map(p=>p?{name:p.name,team:p.team}:null),started:room.started,stage:room.stage||1,mapLabel:E.MAPS[(room.stage||1)-1]?.label,finished:room.state?.finished||false,created:room.created};}
function sendSSE(res,kind,data){try{res.write(`event: ${kind}\ndata: ${JSON.stringify(data)}\n\n`);}catch{}}
function broadcastStats(){const users=new Set([...streams.values()].map(s=>s.clientId));const playerList=[...clients.values()].filter(c=>c.visible && Date.now()-c.lastSeen<15000).map(c=>({id:c.id,name:c.name}));const data={online:users.size, rooms:rooms.size, inBattle:[...rooms.values()].filter(r=>r.started&&!r.state.finished).reduce((n,r)=>n+r.players.filter(Boolean).length,0),players:playerList.slice(0,35),openRooms:[...rooms.values()].filter(r=>r.public&&!r.started).map(roomView).slice(0,15)};for(const c of streams.values())sendSSE(c.res,'stats',data);return data;}
function readBody(req){return new Promise((resolve,reject)=>{let s='';req.on('data',c=>{s+=c;if(s.length>10000){reject(new Error('حجم الطلب كبير'));req.destroy();}});req.on('end',()=>{try{resolve(JSON.parse(s||'{}'))}catch{reject(new Error('بيانات غير صالحة'))}});req.on('error',reject);});}
function authenticate(t){for(const room of rooms.values())for(const p of room.players)if(p&&p.token===t)return {room,player:p};return null;}
function parseQuery(req){return new URL(req.url,'http://localhost');}
function handleStream(req,res,url){
  const ip=addr(req);
  if(streams.size>=MAX_SSE || [...streams.values()].filter(s=>s.ip===ip).length>=MAX_SSE_PER_IP) return error(res,429,'وصلت إلى الحد المؤقت لاتصالات المتابعة');
  const id=safeData(url.searchParams.get('clientId'))||('g'+(++nextClient));
  const nick=cleanNick(url.searchParams.get('name'));
  const access=safeData(url.searchParams.get('token'));
  const match=access?authenticate(access):null;
  // SSE is intentionally same-origin only. Expose no device/network addresses.
  res.writeHead(200,{'content-type':'text/event-stream; charset=utf-8','cache-control':'no-cache, no-transform','connection':'keep-alive','x-accel-buffering':'no'});
  sendSSE(res,'hello',{id,authenticated:!!match,team:match?.player.team||null});
  const streamId=crypto.randomUUID();
  streams.set(streamId,{res,clientId:id,token:access,room:match?.room.code||null,ip});
  clients.set(id,{id,name:nick,visible:url.searchParams.get('visible')==='1',lastSeen:Date.now()});
  sendSSE(res,'stats',broadcastStats());
  if(match)sendSSE(res,'room',{...roomView(match.room),state:match.room.state?E.viewForTeam(match.room.state,match.player.team):null});
  req.on('close',()=>{streams.delete(streamId);if(![...streams.values()].some(s=>s.clientId===id))clients.delete(id);broadcastStats();});
}
function sendRoom(room){const base=roomView(room);for(const s of streams.values())if(s.room===room.code){const match=authenticate(s.token);if(!match||match.room!==room)continue;sendSSE(s.res,'room',{...base,state:room.state?E.viewForTeam(room.state,match.player.team):null});}}
function notifyClosed(room){for(const connection of streams.values())if(connection.room===room.code)sendSSE(connection.res,'roomClosed',{code:room.code});}
async function handleApi(req,res,url){
  const route=url.pathname;
  if(req.method==='GET'&&route==='/api/stats')return json(res,200,{ok:true,...broadcastStats()});
  if(req.method==='GET'&&route==='/api/health')return json(res,200,{ok:true,game:'WAR COMMANDERS',version:'0.18.1',rooms:rooms.size,uptimeSec:Math.floor(process.uptime()),mode:'single-instance-demo'});
  if(req.method==='GET'&&route==='/api/stream')return handleStream(req,res,url);
  if(req.method!=='POST')return error(res,405,'الطريقة غير مدعومة');
  if(!sameOrigin(req))return error(res,403,'يجب إرسال الأوامر من نفس موقع اللعبة');
  if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))return error(res,415,'مطلوب content-type application/json');
  const ip=addr(req);
  if(!quota('post:'+ip,90,15000))return error(res,429,'طلبات كثيرة؛ أعد المحاولة بعد قليل');
  if(route==='/api/room/create'&&!quota('create:'+ip,6,60000))return error(res,429,'وصلت إلى الحد المؤقت لإنشاء الغرف');
  let body;try{body=await readBody(req)}catch(e){return error(res,400,e.message)}
  if(route==='/api/room/create'){
    if(rooms.size>=MAX_ROOMS)return error(res,503,'الخادم ممتلئ');
    const capacity=body.capacity===4?4:2;
    const nick=cleanNick(body.name), roomCode=code();const stage=Math.min(E.MAPS.length,Math.max(1,Number.isInteger(body.stage)?body.stage:1));
    const t=token();const r={code:roomCode,public:!!body.public,capacity,stage,created:Date.now(),touched:Date.now(),players:[{team:1,name:nick,token:t},...Array(capacity-1).fill(null)],started:false,state:null};
    rooms.set(roomCode,r);broadcastStats();
    return json(res,200,{ok:true,code:roomCode,team:1,token:t,room:roomView(r)});
  }
  if(route==='/api/room/join'){
    const roomCode=safeData(body.code).toUpperCase();const r=rooms.get(roomCode);
    if(!r)return error(res,404,'الغرفة غير موجودة');
    if(r.started || r.players.every(Boolean))return error(res,409,'الغرفة مكتملة');
    const seat=r.players.findIndex(p=>!p);
    const player={team:(seat%2)+1,name:cleanNick(body.name),token:token()};
    r.players[seat]=player;
    if(r.players.every(Boolean)){r.started=true;r.state=E.createState({stage:r.stage,vsHuman:true});}
    r.touched=Date.now();sendRoom(r);broadcastStats();
    return json(res,200,{ok:true,code:r.code,team:player.team,token:player.token,room:roomView(r)});
  }
  if(route==='/api/room/leave'){
    const match=authenticate(safeData(body.token));if(!match)return error(res,401,'جلسة الغرفة غير صالحة');
    const {room,player}=match;const index=room.players.indexOf(player);
    if(room.started)return error(res,409,'لا يمكن مغادرة المباراة بعد بدئها؛ أغلق الاتصال أو انتظر انتهاء الجولة');
    if(index===0){notifyClosed(room);rooms.delete(room.code);}
    else {room.players[index]=null;room.touched=Date.now();sendRoom(room);}
    broadcastStats();return json(res,200,{ok:true});
  }
  if(route==='/api/room/action'){
    const match=authenticate(safeData(body.token));if(!match)return error(res,401,'جلسة الغرفة غير صالحة');
    const {room,player}=match;
    if(!room.started||!room.state)return error(res,409,'بانتظار انضمام الخصم');
    if(!quota('action:'+player.token,45,1000))return error(res,429,'تم تجاوز الحد المؤقت لأوامر المعركة');
    const result=E.act(room.state,player.team,body.action);
    room.touched=Date.now();
    if(result.ok)sendRoom(room);
    return json(res,result.ok?200:400,result);
  }
  return error(res,404,'الطلب غير معروف');
}
const MIME={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.wav':'audio/wav','.webmanifest':'application/manifest+json'};
function serveStatic(req,res,url){
  if(req.method!=='GET'&&req.method!=='HEAD')return error(res,405,'الطريقة غير مدعومة');
  let pathname;try{pathname=decodeURIComponent(url.pathname)}catch{return error(res,400,'رابط غير صالح')}
  if(pathname==='/')pathname='/index.html';
  const p=path.resolve(PUBLIC,'.'+pathname);
  if(!p.startsWith(PUBLIC+path.sep))return error(res,403,'ممنوع');
  fs.stat(p,(err,st)=>{
    if(err||!st.isFile())return error(res,404,'الملف غير موجود');
    res.writeHead(200,{'content-type':MIME[path.extname(p)]||'application/octet-stream','cache-control':p.endsWith('.html')?'no-cache':'public,max-age=60','x-content-type-options':'nosniff'});
    if(req.method==='HEAD')return res.end();
    fs.createReadStream(p).pipe(res);
  });
}
const server=http.createServer((req,res)=>{
  res.setHeader('x-content-type-options','nosniff');
  res.setHeader('x-frame-options','DENY');
  res.setHeader('referrer-policy','strict-origin-when-cross-origin');
  const url=parseQuery(req);
  if(url.pathname.startsWith('/api/'))handleApi(req,res,url).catch(e=>error(res,500,'حدث خطأ داخلي'));else serveStatic(req,res,url);
});
let frameIndex=0;
setInterval(()=>{
  frameIndex++;
  for(const room of rooms.values())if(room.started && room.state && !room.state.finished){E.tick(room.state,0.1);if(frameIndex%2===0)sendRoom(room)}
},100).unref();
setInterval(()=>{
  for(const [code,r] of rooms){if(Date.now()-r.touched>1000*60*(r.state?.finished?10:45)){notifyClosed(r);rooms.delete(code)}}
  for(const [id,c] of clients){if(Date.now()-c.lastSeen>20000 && ![...streams.values()].some(s=>s.clientId===id))clients.delete(id);else if([ ...streams.values()].some(s=>s.clientId===id))c.lastSeen=Date.now()}
  for(const s of streams.values())sendSSE(s.res,'ping',{time:Date.now()});
  broadcastStats();
  const now=Date.now();for(const [k,v] of limits)if(v.expires<now)limits.delete(k);
},5000).unref();
server.listen(PORT,'0.0.0.0',()=>{
  console.log(`\n  ⚔️  WAR COMMANDERS running on http://localhost:${PORT}`);
  for(const items of Object.values(os.networkInterfaces()))for(const i of items||[])if(i.family==='IPv4'&&!i.internal)console.log(`  LAN: http://${i.address}:${PORT}`);
  console.log('  افتح الرابط على جهازين ضمن الشبكة نفسها، ثم أنشئ غرفة وشارك رمزها.\n');
});
// LAN discovery is opt-in. It only replies to an explicit game discovery request,
// does not enumerate network devices and never broadcasts user information.
let discoverySocket=null;
if(process.env.LAN_DISCOVERY==='1'){
  const udpPort=Number(process.env.LAN_DISCOVERY_PORT)||38989;
  discoverySocket=dgram.createSocket('udp4');
  discoverySocket.on('message',(message,remote)=>{
    if(message.length>48 || message.toString('ascii')!=='WAR_COMMANDERS_FIND_1')return;
    const reply=Buffer.from('WAR_COMMANDERS_HOST_1|'+PORT,'ascii');
    discoverySocket.send(reply,remote.port,remote.address,()=>{});
  });
  discoverySocket.on('error',err=>console.warn('LAN discovery error:',err.message));
  discoverySocket.bind(udpPort,'0.0.0.0',()=>console.log(`  Wi-Fi discovery active on UDP ${udpPort} (opt-in)`));
}
// Cloud instance restarts clear rooms; these in-memory sessions are intentionally ephemeral.
// HTTP must be terminated by a trusted HTTPS reverse proxy when accessed publicly.
function shutdown(){if(discoverySocket)discoverySocket.close();for(const s of streams.values())s.res.end();server.close();}
if(require.main===module){process.once('SIGTERM',shutdown);process.once('SIGINT',shutdown);}
module.exports={server,rooms,clients,discoverySocket};
