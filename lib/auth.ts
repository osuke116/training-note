import { getChatGPTUser } from '../app/chatgpt-auth';
import { SUPABASE_URL, SUPABASE_KEY } from './public-config';
export async function identity(request:Request){
 const bearer=request.headers.get('authorization');
 if(bearer?.startsWith('Bearer ')){
  const res=await fetch(SUPABASE_URL+'/auth/v1/user',{headers:{apikey:SUPABASE_KEY,Authorization:bearer},signal:AbortSignal.timeout(8000)});
  if(!res.ok)return null;
  const u=await res.json() as any;
  const provider=u.app_metadata?.provider;
  if(!u.id||!['google','apple'].includes(provider))return null;
  return {id:'supabase:'+u.id,email:u.email||'',provider};
 }
 const u=await getChatGPTUser();
 return u?{id:'chatgpt:'+u.userId,email:u.email,provider:'chatgpt'}:null;
}
let providersCache:{at:number,value:any}|null=null;
export async function providers(){
 if(providersCache&&Date.now()-providersCache.at<60000)return providersCache.value;
 try{const res=await fetch(SUPABASE_URL+'/auth/v1/settings',{headers:{apikey:SUPABASE_KEY},signal:AbortSignal.timeout(4000)});if(!res.ok)throw Error();const value=await res.json() as any;const result={google:value.external?.google===true,apple:value.external?.apple===true,chatgpt:true};providersCache={at:Date.now(),value:result};return result}catch{return {google:false,apple:false,chatgpt:true}}
}
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Vary':'Cookie, Authorization'}})}
export function sameOrigin(req:Request){return req.headers.get('origin')===new URL(req.url).origin}
