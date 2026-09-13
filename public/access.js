const form=document.getElementById('access');
const message=document.getElementById('message');
async function enter(code){
  const button=form.querySelector('button');button.disabled=true;message.textContent='Opening…';
  try {
    const reply=await fetch('/api/auth',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({code})});
    const result=await reply.json();if(!reply.ok)throw Error(result.error || 'Please try again.');
    if(location.hash.startsWith('#join/'))history.replaceState(null,'','#guide/checklist');
    location.reload();
  }catch(error){message.textContent=error.message;button.disabled=false;}
}
form.addEventListener('submit',event=>{event.preventDefault();enter(new FormData(form).get('code'));});
// Upgrade an existing private invite on the same device without asking again.
let invite=location.hash.match(/^#join\/([A-Za-z0-9_-]{43})$/)?.[1];
try{invite=invite || JSON.parse(localStorage.getItem('nwrt26.shared.token') || 'null');}catch{}
if(typeof invite==='string' && /^[A-Za-z0-9_-]{43}$/.test(invite))enter(invite);
