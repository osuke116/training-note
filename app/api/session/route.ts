import { identity, providers, json } from '../../../lib/auth';
import { env } from 'cloudflare:workers';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{return json({user:await identity(request),providers:await providers(),aiReady:!!((env as any).AI||((env as any).CF_AI_ACCOUNT_ID&&(env as any).CF_AI_API_TOKEN))})}catch{return json({error:'ログイン状態を確認できません。'},503)}}
