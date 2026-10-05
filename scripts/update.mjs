import fs from 'node:fs/promises';
const root=new URL('../',import.meta.url), data=n=>new URL(`./data/${n}`,root);
const src=JSON.parse(await fs.readFile(new URL('./scripts/sources.json',root),'utf8'));
const meta=JSON.parse(await fs.readFile(data('meta.json'),'utf8'));
const polls=JSON.parse(await fs.readFile(data('polls.json'),'utf8'));
async function get(url){const r=await fetch(url,{headers:{'User-Agent':'PolitiScope/1.2 daily-monitor'}});if(!r.ok)throw new Error(`${r.status} ${url}`);return r.text()}
function xmlText(block,tag){const m=block.match(new RegExp(`<${tag}(?:\s[^>]*)?>([\s\S]*?)</${tag}>`,'i'));return m?m[1].replace(/<!\[CDATA\[|\]\]>/g,'').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#39;/g,"'").replace(/&quot;/g,'\"').trim():''}
function parseRss(raw,s){const blocks=[...raw.matchAll(/<(item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi)].map(m=>m[2]);return blocks.map(b=>({country:s.country,party:xmlText(b,'category')||xmlText(b,'title'),value:Number(xmlText(b,'value')),date:xmlText(b,'pubDate')||xmlText(b,'updated')||xmlText(b,'published'),source:s.name}));}
function normalise(p,s){const value=Number(p.value??p.percent??p.share);if(!p.country||!p.party||!Number.isFinite(value)||!p.date)return null;return {country:String(p.country),party:String(p.party),value,date:String(p.date).slice(0,10),source:String(p.source||s.name),sampleSize:Number.isFinite(Number(p.sampleSize))?Number(p.sampleSize):null,position:Number.isFinite(Number(p.position))?Math.max(0,Math.min(100,Number(p.position))):50,demo:Boolean(p.demo)}}
const incoming=[];
for(const s of (src.polls||[]).filter(x=>x.enabled))try{const raw=await get(s.url);let rows=[];if(s.format==='json')rows=JSON.parse(raw);else if(s.format==='rss')rows=parseRss(raw,s);else throw new Error('format non supporté');incoming.push(...rows.map(p=>normalise(p,s)).filter(Boolean));meta.changes.unshift({date:new Date().toISOString().slice(0,10),title:`Source actualisée: ${s.name}`,source:s.url,count:rows.length})}catch(e){meta.changes.unshift({date:new Date().toISOString().slice(0,10),title:`Échec source: ${s.name}`,source:e.message,count:0})}
const key=p=>[p.country,p.party,p.date,p.source,p.value].join('|');
await fs.writeFile(data('polls.json'),JSON.stringify([...new Map([...polls,...incoming].map(p=>[key(p),p])).values()],null,2));
meta.lastUpdated=new Date().toISOString();meta.changes=meta.changes.slice(0,100);await fs.writeFile(data('meta.json'),JSON.stringify(meta,null,2));
console.log(`PolitiScope update: ${incoming.length} nouvelles observations.`);
