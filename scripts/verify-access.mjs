import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import {pathToFileURL} from 'node:url';
import { accessCode, validCode, validSession, sessionCookie } from '../shared/access.mjs';
import {validField} from '../shared/trip-schema.mjs';
import auth from '../api/auth.js';
process.env.TRIP_SHARE_TOKEN='x'.repeat(43);
process.env.KV_REST_API_URL='https://storage.invalid';process.env.KV_REST_API_TOKEN='test';
assert.ok(validCode(accessCode()));assert.ok(validCode('x'.repeat(43)));assert.ok(!validCode('wrong'));
const cookie=sessionCookie().split(';')[0];assert.ok(validSession(cookie));assert.ok(!validSession(cookie+'bad'));assert.ok(!validSession(''));
let source=ts.transpileModule(fs.readFileSync('middleware.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
source=source.replace('./shared/access.mjs',pathToFileURL(process.cwd()+'/shared/access.mjs').href);
const {default:gate}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
for(const path of ['/','/assets/index.js','/data/routes.json','/old/index.html']){
 const denied=gate(new Request('https://trip.test'+path));assert.equal(denied.status,401);assert.match(denied.headers.get('x-robots-tag'),/noindex/);
 assert.equal(gate(new Request('https://trip.test'+path,{headers:{cookie}})),undefined);
}
for(const path of ['/api/auth','/robots.txt','/access.js'])assert.equal(gate(new Request('https://trip.test'+path)),undefined);
let attempts=0;const original=globalThis.fetch;globalThis.fetch=async()=>({ok:true,json:async()=>[{result:++attempts},{result:1}]});
async function call(method,body,headers={}){let status=200,result;const out={};await auth({method,body,headers:{host:'trip.test',origin:'https://trip.test','content-type':'application/json',...headers}},{setHeader(k,v){out[k]=v},status(s){status=s;return this},json(v){result=v},end(){}});return {status,result,headers:out}}
assert.equal((await call('GET')).status,401);assert.equal((await call('GET',null,{cookie})).result.code,accessCode());
assert.equal((await call('POST',{code:accessCode()},{origin:'https://evil.test'})).status,403);
assert.equal((await call('POST',{code:'wrong'})).status,401);
const signed=await call('POST',{code:accessCode()});assert.equal(signed.status,200);assert.match(signed.headers['Set-Cookie'],/HttpOnly; Secure; SameSite=Strict/);
attempts=20;assert.equal((await call('POST',{code:accessCode()})).status,429);
const out=await call('POST',{action:'logout'},{cookie});assert.match(out.headers['Set-Cookie'],/Max-Age=0/);
globalThis.fetch=original;
assert.ok(validField('stay:sf3',{place:'Hotel',note:'My note',type:'bed'}));
assert.ok(!validField('stay:sf3',{place:'Hotel',note:'x'.repeat(4001),type:'bed'}));
assert.ok(validField('expense:flights',{amount:1250,currency:'EUR',status:'paid',note:''}));
for(const amount of [-1,Infinity,NaN,1000001])assert.ok(!validField('expense:flights',{amount,currency:'EUR',status:'paid',note:''}));
console.log('✓ Server gate, asset protection, code/cookie validation, CSRF, rate limits, logout and note/budget validation');
