const apps=[
  {name:"DaEconomy",icon:"💳",kind:"app"},
  {name:"DaCourt",icon:"⚖️",kind:"app"},
  {name:"DaMusic",icon:"🎵",kind:"music"},
  {name:"DaNotes",icon:"📝",kind:"notes"},
  {name:"DaScope",icon:"☾",kind:"scope"},
  {name:"DaFile Explorer",icon:"📁",kind:"explorer"},
  {name:"DaMedia",icon:"🎞️",kind:"media"},
  {name:"DaSettings",icon:"⚙️",kind:"settings"},
  {name:"DaTrash",icon:"🗑️",kind:"trash"},
  {name:"DAPP",icon:"◈",kind:"store"}
];

const desktop=document.getElementById("desktop");
const desktopIcons=document.getElementById("desktopIcons");
const windows=document.getElementById("windows");
const taskbarApps=document.getElementById("taskbarApps");
const startMenu=document.getElementById("startMenu");
const searchPanel=document.getElementById("searchPanel");
const shutdownMenu=document.getElementById("shutdownMenu");
const searchInput=document.getElementById("searchInput");
let z=10, openWindows=new Map(), selected=null, wifi=true;

function appByName(name){return apps.find(a=>a.name===name)}
function icon(a){return '<span class="app-icon">'+a.icon+'</span>'}

function renderDesktop(){
  desktopIcons.innerHTML=apps.slice(0,8).map(a=>'<button class="desktop-icon" data-app="'+a.name+'">'+icon(a)+'<span class="app-label">'+a.name+'</span></button>').join("");
}
function renderStart(){
  document.getElementById("startApps").innerHTML=apps.map(a=>'<button data-start="'+a.name+'">'+a.icon+' &nbsp; '+a.name+'</button>').join("");
}
function renderTaskbar(){
  taskbarApps.innerHTML=[...openWindows].map(([id,w])=>'<button class="taskbar-app '+(w.active?"active":"")+'" data-window="'+id+'">'+appByName(w.name).icon+'</button>').join("");
}

function openApp(name){
  const a=appByName(name); if(!a)return;
  const id=name+":"+Date.now()+":"+Math.random().toString(36).slice(2);
  const w={id,name,x:70+(openWindows.size*24)%180,y:45+(openWindows.size*22)%140,width:760,height:500,z:++z,minimized:false,maximized:false,active:true};
  openWindows.forEach(v=>v.active=false); openWindows.set(id,w); renderWindow(w); renderTaskbar(); focus(id);
}
function renderWindow(w){
  const el=document.createElement("section");
  el.className="window"; el.dataset.window=w.id;
  Object.assign(el.style,{left:w.x+"px",top:w.y+"px",width:w.width+"px",height:w.height+"px",zIndex:w.z});
  el.innerHTML='<div class="titlebar"><div class="title">'+appByName(w.name).icon+' &nbsp;'+w.name+'</div><div class="win-controls"><button data-action="min">—</button><button data-action="max">□</button><button data-action="close">×</button></div></div><div class="window-body"><div class="placeholder"><div><div style="font-size:42px;text-align:center">'+appByName(w.name).icon+'</div><h2>'+w.name+'</h2><p>This IDA app shell is ready for reconstruction.</p></div></div></div>';
  windows.appendChild(el);
  el.querySelector(".titlebar").addEventListener("dblclick",()=>toggleMax(w.id));
  el.querySelectorAll("[data-action]").forEach(b=>b.addEventListener("click",e=>{
    const action=e.currentTarget.dataset.action;
    if(action==="close") closeWindow(w.id); if(action==="min") minimize(w.id); if(action==="max") toggleMax(w.id);
  }));
  makeDraggable(el,w);
}
function makeDraggable(el,w){
  let drag=false,dx=0,dy=0;
  el.querySelector(".titlebar").addEventListener("pointerdown",e=>{
    if(w.maximized)return; drag=true; dx=e.clientX-w.x; dy=e.clientY-w.y; focus(w.id); el.setPointerCapture(e.pointerId);
  });
  el.addEventListener("pointermove",e=>{if(!drag)return;w.x=Math.max(0,e.clientX-dx);w.y=Math.max(0,e.clientY-dy);el.style.left=w.x+"px";el.style.top=w.y+"px"});
  el.addEventListener("pointerup",()=>drag=false);
}
function focus(id){
  const w=openWindows.get(id); if(!w)return;
  openWindows.forEach(v=>v.active=false); w.active=true; w.z=++z;
  const el=document.querySelector('[data-window="'+CSS.escape(id)+'"]');
  if(el)el.style.zIndex=w.z;
  renderTaskbar();
}
function closeWindow(id){document.querySelector('[data-window="'+CSS.escape(id)+'"]')?.remove();openWindows.delete(id);renderTaskbar()}
function minimize(id){const w=openWindows.get(id);if(!w)return;w.minimized=true;const el=document.querySelector('[data-window="'+CSS.escape(id)+'"]');if(el)el.style.display="none";renderTaskbar()}
function restore(id){const w=openWindows.get(id);if(!w)return;w.minimized=false;const el=document.querySelector('[data-window="'+CSS.escape(id)+'"]');if(el)el.style.display="";focus(id)}
function toggleMax(id){const w=openWindows.get(id);if(!w)return;w.maximized=!w.maximized;const el=document.querySelector('[data-window="'+CSS.escape(id)+'"]');if(el)el.classList.toggle("maximized",w.maximized);focus(id)}

desktopIcons.addEventListener("click",e=>{const b=e.target.closest("[data-app]");if(!b)return;selected=b.dataset.app;document.querySelectorAll(".desktop-icon").forEach(x=>x.classList.remove("selected"));b.classList.add("selected")});
desktopIcons.addEventListener("dblclick",e=>{const b=e.target.closest("[data-app]");if(b)openApp(b.dataset.app)});
taskbarApps.addEventListener("click",e=>{const b=e.target.closest("[data-window]");if(!b)return;const w=openWindows.get(b.dataset.window);if(!w)return;if(w.minimized)restore(w.id);else if(w.active)minimize(w.id);else focus(w.id)});
document.getElementById("startButton").onclick=()=>{startMenu.classList.toggle("hidden");shutdownMenu.classList.add("hidden");searchPanel.classList.add("hidden")};
document.getElementById("searchButton").onclick=()=>{searchPanel.classList.toggle("hidden");startMenu.classList.add("hidden");if(!searchPanel.classList.contains("hidden"))searchInput.focus()};
document.getElementById("startApps").addEventListener("dblclick",e=>{const b=e.target.closest("[data-start]");if(b){openApp(b.dataset.start);startMenu.classList.add("hidden")}});
searchInput.addEventListener("input",()=>{const q=searchInput.value.toLowerCase();document.getElementById("searchResults").innerHTML=apps.filter(a=>a.name.toLowerCase().includes(q)).map(a=>'<div class="search-result" data-search="'+a.name+'">'+a.icon+' &nbsp; '+a.name+'</div>').join("")});
document.getElementById("searchResults").addEventListener("dblclick",e=>{const r=e.target.closest("[data-search]");if(r)openApp(r.dataset.search)});
document.getElementById("wifiButton").onclick=()=>{wifi=!wifi;document.getElementById("wifiButton").style.opacity=wifi?"1":".35"};
document.getElementById("clock").textContent="";
function clock(){document.getElementById("clock").textContent=new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}
setInterval(clock,1000);clock();
renderDesktop();renderStart();