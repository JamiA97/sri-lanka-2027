const SUPABASE_URL='https://nwxsdryojjwyweitovhz.supabase.co';
const SUPABASE_KEY='sb_publishable_EozqsbuGJdDsTly_CLWHwQ_TxGi9mQO';
const RPC=`${SUPABASE_URL}/rest/v1/rpc`;
const apiHeaders={'apikey':SUPABASE_KEY,'Content-Type':'application/json'};
const SESSION_KEY='sl27-family-session';
let familyToken=localStorage.getItem(SESSION_KEY)||'';
let tripInitialised=false;
let notes=[];

async function rpc(name, payload={}){
  const r=await fetch(`${RPC}/${name}`,{method:'POST',headers:apiHeaders,body:JSON.stringify(payload)});
  if(!r.ok) throw new Error(`HTTP ${r.status}: ${await r.text()}`);
  const text=await r.text();
  return text ? JSON.parse(text) : null;
}

function showGate(message=''){
  document.body.classList.remove('auth-ready');
  document.body.classList.add('auth-pending');
  document.getElementById('access-error').textContent=message;
  setTimeout(()=>document.getElementById('access-password').focus(),50);
}

function unlockSite(){
  document.body.classList.remove('auth-pending');
  document.body.classList.add('auth-ready');
  if(!tripInitialised) initTrip();
}

async function checkExistingSession(){
  if(!familyToken){showGate();return}
  try{
    const valid=await rpc('family_session_valid',{p_token:familyToken});
    if(valid===true){unlockSite();return}
  }catch(err){console.error('Session check failed',err)}
  localStorage.removeItem(SESSION_KEY); familyToken=''; showGate('Please enter the family password again.');
}

document.getElementById('access-form').addEventListener('submit',async e=>{
  e.preventDefault();
  const password=document.getElementById('access-password').value;
  const btn=document.getElementById('access-submit');
  const error=document.getElementById('access-error');
  btn.disabled=true;btn.textContent='Checking…';error.textContent='';
  try{
    const result=await rpc('family_login',{p_password:password});
    if(!Array.isArray(result)||!result.length){error.textContent='That password is not correct.';return}
    familyToken=result[0].token;
    localStorage.setItem(SESSION_KEY,familyToken);
    document.getElementById('access-password').value='';
    unlockSite();
  }catch(err){console.error('Family login failed',err);error.textContent='Could not check the password. Please try again.'}
  finally{btn.disabled=false;btn.textContent='Enter trip'}
});

document.getElementById('family-logout').addEventListener('click',async()=>{
  const token=familyToken;
  familyToken='';localStorage.removeItem(SESSION_KEY);
  if(token){try{await rpc('family_logout',{p_token:token})}catch(err){console.warn('Logout cleanup failed',err)}}
  location.hash='';showGate();
});

function initTrip(){
  tripInitialised=true;
  const itinerary = [
    ['Mon 2 Aug','Manchester → Dubai','Emirates EK18 departs Manchester at 14:05; arrives Dubai on 3 August at 00:25.'],
    ['Tue 3 Aug','Dubai → Colombo','Emirates EK650 departs Dubai 02:30 and arrives Colombo 08:30. Private transfer to Shangri-La Colombo; one night, bed & breakfast.'],
    ['Wed 4 Aug','Colombo → Galle','Private transfer to Jetwing Lighthouse. Check in for two nights, bed & breakfast.'],
    ['Thu 5 Aug','Galle','Day to explore Galle, the fort or the coast; no fixed excursion in the quote.'],
    ['Fri 6 Aug','Galle → Yala','Start the five-day car-and-chauffeur itinerary. Check in at Jetwing Yala for two nights, half board.'],
    ['Sat 7 Aug','Yala safari','Private three-hour Yala jeep safari, morning or afternoon timing to be confirmed.'],
    ['Sun 8 Aug','Yala safari → Gal Oya','Second private three-hour Yala safari, then transfer to Gal Oya Lodge for two nights, half board. Transfer timing should be confirmed with Kuoni.'],
    ['Mon 9 Aug','Gal Oya boat safari','Private boat safari in Gal Oya National Park.'],
    ['Tue 10 Aug','Gal Oya → Pasikuda','Transfer to Maalu Maalu Resort & Spa. Panoramic Suite, half board, five nights.'],
    ['Wed 11 Aug','Maalu Maalu','Beach and resort day.'],
    ['Thu 12 Aug','Maalu Maalu','Beach and resort day.'],
    ['Fri 13 Aug','Maalu Maalu','Beach and resort day.'],
    ['Sat 14 Aug','Maalu Maalu','Final full beach day.'],
    ['Sun 15 Aug','Pasikuda → Batticaloa → Colombo → Negombo','Private transfer to Batticaloa Airport; domestic flight to Colombo; private transfer to SENTIDO Heritance Negombo for one night, bed & breakfast. Domestic flight time not specified.'],
    ['Mon 16 Aug','Negombo → Colombo → Dubai','Private airport transfer. Emirates EK655 departs Colombo at 22:05; arrives Dubai on 17 August at 00:55.'],
    ['Tue 17 Aug','Dubai → Manchester','Emirates EK21 departs Dubai 03:00 and arrives Manchester 07:45.']
  ];
  const timeline=document.getElementById('timeline');
  itinerary.forEach(([d,t,p])=>{const e=document.createElement('article');e.className='day';e.innerHTML=`<div class="day-date">${d}</div><div><h3>${t}</h3><p>${p}</p></div>`;timeline.appendChild(e)});

  const stops={
    colombo:{coords:[6.9271,79.8612],name:'Colombo',hotel:'Shangri-La Colombo · 1 night'},
    galle:{coords:[6.0329,80.2168],name:'Galle',hotel:'Jetwing Lighthouse · 2 nights'},
    yala:{coords:[6.3659,81.5065],name:'Yala',hotel:'Jetwing Yala · 2 nights'},
    galoya:{coords:[7.2141,81.5300],name:'Gal Oya',hotel:'Gal Oya Lodge · 2 nights'},
    maalu:{coords:[7.9230,81.5610],name:'Pasikuda',hotel:'Maalu Maalu · 5 nights'},
    negombo:{coords:[7.2385,79.8403],name:'Negombo',hotel:'SENTIDO Heritance · 1 night'}
  };
  const map=L.map('map',{scrollWheelZoom:false,zoomControl:false}).setView([7.15,80.72],7.1);L.control.zoom({position:'bottomright'}).addTo(map);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);
  const latlngs=Object.values(stops).map(s=>s.coords);L.polyline(latlngs,{color:'#b8894d',weight:4,opacity:.9,dashArray:'7 10'}).addTo(map);
  Object.entries(stops).forEach(([id,s],i)=>{const marker=L.circleMarker(s.coords,{radius:9,weight:3,color:'#fff',fillColor:'#b8894d',fillOpacity:1}).addTo(map);marker.bindPopup(`<div class="map-popup"><b>${i+1}. ${s.name}</b><small>${s.hotel}</small></div>`);s.marker=marker});
  map.fitBounds(latlngs,{padding:[40,40]});document.querySelectorAll('[data-stop]').forEach(b=>b.addEventListener('click',()=>{const s=stops[b.dataset.stop];map.flyTo(s.coords,9,{duration:1.2});s.marker.openPopup()}));

  const dialog=document.getElementById('note-dialog'),topic=document.getElementById('note-topic'),nameInput=document.getElementById('note-name'),textInput=document.getElementById('note-text');
  function openNote(t='Whole trip'){topic.value=t;nameInput.value=localStorage.getItem('sl27-name')||'';textInput.value='';dialog.showModal();setTimeout(()=>textInput.focus(),100)}
  document.getElementById('new-note').addEventListener('click',()=>openNote());document.querySelectorAll('.comment-btn').forEach(b=>b.addEventListener('click',()=>openNote(b.dataset.topic)));

  document.getElementById('save-note').addEventListener('click',async e=>{
    e.preventDefault();
    if(!nameInput.value.trim()||!topic.value.trim()||!textInput.value.trim()){document.getElementById('note-form').reportValidity();return}
    const btn=document.getElementById('save-note');const oldText=btn.textContent;btn.disabled=true;btn.textContent='Saving…';
    try{
      const payload={p_token:familyToken,p_name:nameInput.value.trim(),p_topic:topic.value.trim(),p_body:textInput.value.trim()};
      await rpc('add_family_comment',payload);
      localStorage.setItem('sl27-name',payload.p_name);dialog.close();await loadNotes();
    }catch(err){console.error('Comment save failed',err);if(String(err).includes('invalid family session')){localStorage.removeItem(SESSION_KEY);familyToken='';dialog.close();showGate('Your family session expired. Please sign in again.')}else alert('That comment could not be saved. Please try again.')}
    finally{btn.disabled=false;btn.textContent=oldText}
  });
  loadNotes();
}

async function loadNotes(){
  const notesList=document.getElementById('notes-list');
  notesList.innerHTML='<div class="empty-note">Loading family comments…</div>';
  try{
    notes=await rpc('get_family_comments',{p_token:familyToken});
    renderNotes();
  }catch(err){
    console.error('Comment load failed',err);
    if(String(err).includes('invalid family session')){localStorage.removeItem(SESSION_KEY);familyToken='';showGate('Your family session expired. Please sign in again.');return}
    notesList.innerHTML='<div class="empty-note">Comments could not be loaded. Please refresh and try again.</div>';
  }
}

function renderNotes(){
  const notesList=document.getElementById('notes-list');
  notesList.innerHTML=notes.length?'':'<div class="empty-note">No family comments yet. Add the first thought or suggested change.</div>';
  notes.forEach(n=>{const el=document.createElement('article');el.className='note';const when=new Date(n.created_at).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});el.innerHTML=`<div class="who">${escapeHtml(n.name)} <span class="note-time">· ${escapeHtml(when)}</span></div><h4>${escapeHtml(n.topic)}</h4><p>${escapeHtml(n.body)}</p>`;notesList.appendChild(el)});
}

function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
checkExistingSession();
