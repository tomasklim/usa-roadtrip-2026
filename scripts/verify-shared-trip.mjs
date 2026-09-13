import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import handler from '../api/trip.js';
import { validPatch, validField } from '../shared/trip-schema.mjs';

const invite = 'a'.repeat(43);
process.env.TRIP_SHARE_TOKEN = invite;
process.env.UPSTASH_REDIS_REST_URL = 'https://test.invalid';
process.env.UPSTASH_REDIS_REST_TOKEN = 'test-only';
let database = {};
let writes = 0;
const originalFetch = globalThis.fetch;
globalThis.fetch = async (_url, options) => {
  const [command, _key, ...args] = JSON.parse(options.body);
  if (command === 'HSET') { writes++; for (let i = 0; i < args.length; i += 2) database[args[i]] = args[i + 1]; }
  return {ok:true, json:async () => ({result:command === 'HGETALL' ? Object.entries(database).flat() : 1})};
};
const call = async (method, body, token = invite) => {
  let status = 200, result; const headers = {};
  await handler({method, body, query:{}, headers:{authorization:`Bearer ${token}`, 'content-type':'application/json'}}, {
    setHeader(k,v){headers[k]=v;}, status(v){status=v;return this;}, json(v){result=v;}
  });
  return {status,result,headers};
};
assert.equal((await call('GET', null, 'wrong')).status, 401);
assert.equal((await call('POST', {})).status, 405);
assert.equal((await call('PATCH', {'check:hello':'yes'})).status, 400);
assert.equal(writes, 0);
assert.ok(!validPatch({'plan:seattlePlan':{weather:'rain'}}));
await Promise.all([call('PATCH', {'check:sea':true}), call('PATCH', {'check:slc':true})]);
const both = await call('GET');
assert.equal(both.result.fields['check:sea'], true);
assert.equal(both.result.fields['check:slc'], true);
assert.equal(both.headers['Cache-Control'], 'private, no-store');
await call('PATCH', {'check:sea':false});
assert.equal((await call('GET')).result.fields['check:sea'], false);
globalThis.fetch = originalFetch;

// Separate browser-like runtimes and local storage, sharing only a fake remote API.
let remote = {};
let requests = 0;
const source = ts.transpileModule(fs.readFileSync('src/lib/sharedTrip.ts','utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const defaults = {weather:'good',portland:true,rainier:'sun',flight:'mon-pm'};
function client(storage = new Map()) {
  const document = new EventTarget(); document.visibilityState = 'visible';
  const window = new EventTarget(); window.location = {origin:'https://trip.test',hash:''}; window.history = {replaceState(_state,_title,hash){window.location.hash=hash;}};
  const control = {offline:false, delay:null};
  const module = {exports:{}};
  const context = vm.createContext({module,exports:module.exports,console,URL,EventTarget,AbortSignal,setInterval,clearInterval,document,window,
    localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},
    require: name => name === 'react' ? {useCallback:fn=>fn,useMemo:fn=>fn(),useSyncExternalStore:(_s,get)=>get()} : name.includes('trip-schema') ? {validField} : {DEFAULT_SEATTLE:defaults},
    fetch:async (_url, options) => {
      requests++;
      if (control.offline) throw Error('offline');
      if (options.body) remote = {...remote,...JSON.parse(options.body)};
      const snapshot = JSON.parse(JSON.stringify(remote));
      if (control.delay) { const delayed = control.delay; control.delay = null; await delayed; }
      return {ok:true,status:200,json:async()=>({fields:snapshot})};
    }
  });
  vm.runInContext(source,context);
  return {api:module.exports,storage,control,window};
}
const normalize = v => Array.isArray(v) ? v : [];
const settle = async () => { for (let i=0;i<30;i++) await Promise.resolve(); };
const a = client(), b = client();
a.api.useSharedStored('checks',[],normalize)[1](['personal-only']);
await a.api.joinSharedTrip(invite); await b.api.joinSharedTrip(invite); await settle();
assert.equal(a.api.useSharedStored('checks',[],normalize)[0].length,0,'Joining must not upload private checks');
a.api.useSharedStored('checks',[],normalize)[1](['sea']);
b.api.useSharedStored('checks',[],normalize)[1](['slc']);
await settle(); await a.api.sync(); await b.api.sync();
assert.deepEqual([...a.api.useSharedStored('checks',[],normalize)[0]].sort(),['sea','slc']);
a.control.offline = true;
a.api.useSharedStored('checks',[],normalize)[1](prev=>[...prev,'offline']);
await settle(); assert.equal(a.api.useSharedStatus().pending,1);
b.api.useSharedStored('checks',[],normalize)[1](prev=>[...prev,'other-phone']); await settle();
a.control.offline = false; await a.api.sync(); await b.api.sync();
assert.ok(b.api.useSharedStored('checks',[],normalize)[0].includes('offline'));
assert.ok(a.api.useSharedStored('checks',[],normalize)[0].includes('other-phone'));
let release;
a.control.delay = new Promise(r=>{release=r;});
a.api.useSharedStored('checks',[],normalize)[1](prev=>[...prev,'fast']);
a.api.useSharedStored('checks',[],normalize)[1](prev=>prev.filter(v=>v!=='fast'));
release(); await settle();
assert.equal(remote['check:fast'],false,'A change during an in-flight request must survive');
a.control.offline = true;
a.api.useSharedStored('checks',[],normalize)[1](prev=>[...prev,'reload']); await settle();
const restored = client(a.storage);
assert.ok(restored.api.useSharedStored('checks',[],normalize)[0].includes('reload'));
assert.equal(restored.api.useSharedStatus().pending,1);
await restored.api.sync();
assert.equal(remote['check:reload'],true);
a.api.leaveSharedTrip();
assert.deepEqual([...a.api.useSharedStored('checks',[],normalize)[0]],['personal-only']);
assert.equal(a.api.inviteFrom(`https://evil.test/#join/${invite}`),null);
assert.ok(requests < 30,'Failures must not cause a request loop');
console.log('✓ Private API auth, validation, atomic checklist writes, separate devices, offline queue, reload recovery, in-flight edits and personal-plan isolation');

const linked = client();
const stop = linked.api.startSharedSync();
linked.window.location.hash = `#join/${invite}`;
linked.window.dispatchEvent(new Event('hashchange'));
await settle();
assert.equal(linked.api.useSharedStatus().connected,true);
assert.equal(linked.window.location.hash,'#guide/checklist');
stop();
console.log('✓ Invite links work in an already-open page and are removed from the address bar');
