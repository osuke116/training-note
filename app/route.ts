import html from "./training.html?raw";
export const dynamic="force-dynamic";
export async function GET(){return new Response(html,{headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-cache"}})}
