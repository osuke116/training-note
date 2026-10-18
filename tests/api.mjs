import assert from 'node:assert/strict';
import { payloadSchema } from '../lib/state.ts';
const base=process.env.TEST_URL||'http://127.0.0.1:5173';
assert.equal(new URL(base).hostname==='127.0.0.1',true,'Integration fixtures are local-only');
let passed=0;
async function check(name,fn){await fn();passed++;console.log('PASS '+name)}
const payload={logs:[{id:'api-qa',date:'2026-10-18',group:'core',exercise:'QA seconds',unit:'seconds',seconds:30,reps:null,sets:1}],customExercises:[],manualItems:[],tasks:[]};
const headers={'Cookie':'__sites_local_auth=1','Origin':base,'Content-Type':'application/json'};
await check('schema rejects missing/zero seconds',()=>{assert(!payloadSchema.safeParse({...payload,logs:[{...payload.logs[0],seconds:0}]}).success)});
await check('unauthenticated read rejected',async()=>assert.equal((await fetch(base+'/api/state')).status,401));
await check('forged identity header rejected',async()=>assert.equal((await fetch(base+'/api/state',{headers:{'oai-authenticated-user-id':'other','oai-authenticated-user-email':'x@example.invalid'}})).status,401));
await check('cross-origin write rejected',async()=>assert.equal((await fetch(base+'/api/state',{method:'PUT',headers:{...headers,Origin:'https://untrusted.invalid'},body:'{}'})).status,403));
await check('authenticated invalid payload rejected',async()=>assert.equal((await fetch(base+'/api/state',{method:'PUT',headers,body:JSON.stringify({revision:null,payload:{}})})).status,400));
const before=await fetch(base+'/api/state',{headers}).then(r=>r.json());let revision;
await check('D1 write/read seconds payload',async()=>{const r=await fetch(base+'/api/state',{method:'PUT',headers,body:JSON.stringify({revision:before.revision,payload})});assert.equal(r.status,200);revision=(await r.json()).revision;const read=await fetch(base+'/api/state',{headers}).then(r=>r.json());assert.equal(read.payload.logs[0].seconds,30);assert.equal(read.revision,revision)});
await check('stale revision cannot overwrite',async()=>assert.equal((await fetch(base+'/api/state',{method:'PUT',headers,body:JSON.stringify({revision:before.revision,payload})})).status,409));
await check('AI missing configuration is explicit',async()=>{const r=await fetch(base+'/api/review',{method:'POST',headers,body:JSON.stringify({text:'ベンチプレス3セット'})});assert.equal(r.status,503);assert.match((await r.json()).error,/接続準備中/)});
await check('AI without login rejected',async()=>assert.equal((await fetch(base+'/api/review',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:'{}'})).status,401));
console.log(`${passed} backend checks passed.`);
