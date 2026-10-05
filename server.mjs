import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{
  try{
    const u=new URL(req.url,'http://localhost');
    if(u.pathname==='/api/health') return send(res,200,{ok:true,time:new Date().toISOString()});
    if(u.pathname.startsWith('/api/')){
      const name=u.pathname.split('/').pop();
      const allowed=['elections','polls','meta','sources','leaders'];
      if(!allowed.includes(name)) return send(res,404,{error:'Not found'});
      const file=name==='sources'?'scripts/sources.json':`data/${name}.json`;
      return send(res,200,JSON.parse(await fs.readFile(path.join(root,file),'utf8')));
    }
    let p=decodeURIComponent(u.pathname); if(p==='/'||p==='') p='/index.html';
    const file=path.join(root,p.replace(/^\//,''));
    if(!file.startsWith(root)) return send(res,403,{error:'Forbidden'});
    const data=await fs.readFile(file); res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'}); res.end(data);
  }catch(e){send(res,404,{error:e.message})}
});
function send(res,status,obj){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(obj));}
server.listen(process.env.PORT||4173,()=>console.log(`PolitiScope running on http://localhost:${process.env.PORT||4173}`));
