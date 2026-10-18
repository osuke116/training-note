import { identity, json, sameOrigin } from '../../../lib/auth';
import { updateSchema } from '../../../lib/state';
import { env } from 'cloudflare:workers';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{const u=await identity(request);if(!u)return json({error:'ログインが必要です。'},401);const row=await env.DB!.prepare('SELECT payload,revision FROM user_state WHERE owner=?').bind(u.id).first<{payload:string,revision:number}>();return json(row?{payload:JSON.parse(row.payload),revision:row.revision}:{payload:null,revision:null})}catch{return json({error:'保存内容を読み込めません。'},503)}}
export async function PUT(request:Request){
 if(!sameOrigin(request))return json({error:'操作元を確認できません。'},403);
 try{const u=await identity(request);if(!u)return json({error:'ログインが必要です。'},401);
 const raw=await request.text();if(raw.length>1000000)return json({error:'データが大きすぎます。'},413);
 const parsed=updateSchema.safeParse(JSON.parse(raw));if(!parsed.success)return json({error:'保存内容が不正です。'},400);
 const {payload,revision}=parsed.data;const next=revision===null?0:revision+1;const now=new Date().toISOString();
 const res=revision===null?await env.DB!.prepare('INSERT OR IGNORE INTO user_state(owner,payload,revision,updated_at) VALUES(?,?,?,?)').bind(u.id,JSON.stringify(payload),next,now).run():await env.DB!.prepare('UPDATE user_state SET payload=?,revision=?,updated_at=? WHERE owner=? AND revision=?').bind(JSON.stringify(payload),next,now,u.id,revision).run();
 if(res.meta.changes!==1)return json({error:'別の端末で更新されました。'},409);return json({revision:next});
 }catch(e){return json({error:e instanceof SyntaxError?'JSONが不正です。':'保存できませんでした。'},e instanceof SyntaxError?400:503)}
}
