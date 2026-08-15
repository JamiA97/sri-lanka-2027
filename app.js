const itinerary = [
  ['Mon 26 Jul','Fly Manchester → Doha','Qatar Airways QR28 · depart 14:55 · arrive 23:45.'],
  ['Tue 27 Jul','Doha → Colombo → Galle','QR660 arrives Colombo 09:40. Private Whittalls transfer to Jetwing Lighthouse; check in for two nights.'],
  ['Wed 28 Jul','Galle','Full day based at Jetwing Lighthouse. Nothing fixed in the current proposal.'],
  ['Thu 29 Jul','Galle → Yala','Car and chauffeur begins. Check in to Cinnamon Wild Yala for three nights.'],
  ['Fri 30 Jul','Yala','Free day at Cinnamon Wild in the current proposal.'],
  ['Sat 31 Jul','Yala safari','Private three-hour jeep safari from the Yala hotel.'],
  ['Sun 1 Aug','Yala safari → Gal Oya','Second private three-hour Yala safari, then check in to Gal Oya Lodge for two nights.'],
  ['Mon 2 Aug','Gal Oya boat safari','Private boat safari in Gal Oya National Park.'],
  ['Tue 3 Aug','Gal Oya → Pasikuda','Chauffeur section ends. Check in to Maalu Maalu Resort & Spa for five nights.'],
  ['Wed 4 Aug','Maalu Maalu','Beach / resort day.'],['Thu 5 Aug','Maalu Maalu','Beach / resort day.'],['Fri 6 Aug','Maalu Maalu','Beach / resort day.'],['Sat 7 Aug','Maalu Maalu','Final full beach day.'],
  ['Sun 8 Aug','Pasikuda → Batticaloa → Colombo → Negombo','Private transfer to Batticaloa Airport, domestic flight to Colombo, then private transfer to SENTIDO Heritance Negombo.'],
  ['Mon 9 Aug','Colombo → Doha → Manchester','QR665 departs 10:30; connect to QR23; arrive Manchester 19:55.']
];
const timeline=document.getElementById('timeline'); itinerary.forEach(([d,t,p])=>{const e=document.createElement('article');e.className='day';e.innerHTML=`<div class="day-date">${d}</div><div><h3>${t}</h3><p>${p}</p></div>`;timeline.appendChild(e)});

const stops={
  galle:{coords:[6.0329,80.2168],name:'Galle',hotel:'Jetwing Lighthouse · 2 nights'},
  yala:{coords:[6.3659,81.5065],name:'Yala',hotel:'Cinnamon Wild · 3 nights'},
  galoya:{coords:[7.2141,81.5300],name:'Gal Oya',hotel:'Gal Oya Lodge · 2 nights'},
  maalu:{coords:[7.9230,81.5610],name:'Pasikuda',hotel:'Maalu Maalu · 5 nights'},
  negombo:{coords:[7.2385,79.8403],name:'Negombo',hotel:'SENTIDO Heritance · 1 night'}
};
const map=L.map('map',{scrollWheelZoom:false,zoomControl:false}).setView([7.15,80.72],7.1);L.control.zoom({position:'bottomright'}).addTo(map);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);
const latlngs=Object.values(stops).map(s=>s.coords);L.polyline(latlngs,{color:'#b8894d',weight:4,opacity:.9,dashArray:'7 10'}).addTo(map);
Object.entries(stops).forEach(([id,s],i)=>{const marker=L.circleMarker(s.coords,{radius:9,weight:3,color:'#fff',fillColor:'#b8894d',fillOpacity:1}).addTo(map);marker.bindPopup(`<div class="map-popup"><b>${i+1}. ${s.name}</b><small>${s.hotel}</small></div>`);s.marker=marker});
map.fitBounds(latlngs,{padding:[40,40]});document.querySelectorAll('[data-stop]').forEach(b=>b.addEventListener('click',()=>{const s=stops[b.dataset.stop];map.flyTo(s.coords,9,{duration:1.2});s.marker.openPopup()}));

const dialog=document.getElementById('note-dialog'),topic=document.getElementById('note-topic'),nameInput=document.getElementById('note-name'),textInput=document.getElementById('note-text'),notesList=document.getElementById('notes-list');
const getNotes=()=>JSON.parse(localStorage.getItem('sl27-notes')||'[]');
function renderNotes(){const notes=getNotes();notesList.innerHTML=notes.length?'':'<div class="empty-note">No notes on this device yet. Add the first thought or suggested change.</div>';notes.slice().reverse().forEach(n=>{const el=document.createElement('article');el.className='note';el.innerHTML=`<div class="who">${escapeHtml(n.name)}</div><h4>${escapeHtml(n.topic)}</h4><p>${escapeHtml(n.text)}</p>`;notesList.appendChild(el)})}
function openNote(t='Whole trip'){topic.value=t;nameInput.value=localStorage.getItem('sl27-name')||'';textInput.value='';dialog.showModal();setTimeout(()=>textInput.focus(),100)}
document.getElementById('new-note').addEventListener('click',()=>openNote());document.querySelectorAll('.comment-btn').forEach(b=>b.addEventListener('click',()=>openNote(b.dataset.topic)));
document.getElementById('save-note').addEventListener('click',e=>{if(!nameInput.value.trim()||!topic.value.trim()||!textInput.value.trim()){e.preventDefault();document.getElementById('note-form').reportValidity();return}const notes=getNotes();notes.push({name:nameInput.value.trim(),topic:topic.value.trim(),text:textInput.value.trim(),ts:Date.now()});localStorage.setItem('sl27-name',nameInput.value.trim());localStorage.setItem('sl27-notes',JSON.stringify(notes));setTimeout(renderNotes,0)});
function escapeHtml(s){return s.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}renderNotes();
