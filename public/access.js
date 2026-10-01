const form=document.getElementById('access');
const message=document.getElementById('message');
async function enter(code){
  const button=form.querySelector('button');button.disabled=true;message.textContent='Opening…';
  try {
    const reply=await fetch('/api/auth',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({code})});
    const result=await reply.json();if(!reply.ok)throw Error(result.error || 'Please try again.');
    if(location.hash.startsWith('#join/'))history.replaceState(null,'','#guide/checklist');
    location.replace(returnTo.value || '/');
  }catch(error){message.textContent=error.message;button.disabled=false;}
}
// Native POST + redirect lets browsers and password managers recognize a login.
// Keep the password field intact; never put the access code in a URL.
const returnTo=document.getElementById('return-to');
if(location.pathname !== '/api/auth') returnTo.value=location.pathname+location.search+(location.hash.startsWith('#join/') ? '#guide/checklist' : location.hash);
form.addEventListener('submit',()=>{message.textContent='Opening…';});
// Upgrade an existing private invite on the same device without asking again.
let invite=location.hash.match(/^#join\/([A-Za-z0-9_-]{43})$/)?.[1];
try{invite=invite || JSON.parse(localStorage.getItem('nwrt26.shared.token') || 'null');}catch{}
if(typeof invite==='string' && /^[A-Za-z0-9_-]{43}$/.test(invite))enter(invite);
