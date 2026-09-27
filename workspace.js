const RAW_ROOT="https://raw.githubusercontent.com/Bert-Lynn/weekly-research-radar/main";
const loading=document.querySelector("#loading");
const root=document.querySelector("#workspace");
const logoutBtn=document.querySelector("#logout");
const briefLink=document.querySelector("#brief-link");
const timers={};
let data=null,archive=[],states={};

function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]))}
function requestedWeek(){const w=new URLSearchParams(location.search).get("week")||"";return /^\d{4}-\d{2}-\d{2}$/.test(w)?w:""}
function loginRedirect(){const next=encodeURIComponent("workspace.html"+location.search);location.replace("login.html?next="+next)}
async function auth(){
  if(!RadarCloud.token())return false;
  try{await RadarCloud.me();return true}catch{return false}
}
function mapStates(list){const out={};for(const x of list||[])out[x.paper_key]=x;return out}
function readCount(){return data.papers.filter(p=>states[p.url]?.is_read===true).length}
function setSync(key,text,error=false){const el=document.querySelector('[data-sync="'+CSS.escape(key)+'"]');if(el){el.textContent=text;el.classList.toggle("error",error)}}
async function persist(paper,next){
  setSync(paper.url,"保存中…");
  try{await RadarCloud.upsert({week:data.week,paperKey:paper.url,isRead:next.is_read,note:next.note});states[paper.url]=next;setSync(paper.url,"已同步云端");updateProgress()}
  catch(e){if(e.status===401){RadarCloud.setToken("");loginRedirect();return}setSync(paper.url,"同步失败",true)}
}
function queueNote(paper,note){
  const old=states[paper.url]||{is_read:false,note:""};
  states[paper.url]={...old,note};
  setSync(paper.url,"等待同步…");
  clearTimeout(timers[paper.url]);
  timers[paper.url]=setTimeout(()=>persist(paper,states[paper.url]),700);
}
function updateProgress(){
  const count=readCount(),total=data.papers.length,pct=Math.round(count/Math.max(total,1)*100);
  const c=document.querySelector("#cloud-count"),b=document.querySelector("#cloud-bar"),p=document.querySelector("#cloud-pct");
  if(c)c.textContent=count+" / "+total+" 已读";if(b)b.style.width=pct+"%";if(p)p.textContent=pct+"% · 已读状态与笔记均保存到 Supabase";
}
function renderCard(p){
  const s=states[p.url]||{is_read:false,note:""};
  return `<article class="paper-card ${s.is_read?"read":""}" data-card="${esc(p.url)}">
    <div class="paper-top"><div class="paper-tags"><span class="${p.priority.toLowerCase()}">${esc(p.priority)}</span><span>${esc(p.lane)}</span></div>
      <label class="read-label"><input type="checkbox" data-read="${esc(p.url)}" ${s.is_read?"checked":""}> <span>${s.is_read?"已读":"标记已读"}</span></label></div>
    <h3>${esc(p.title)}</h3><p class="paper-meta">${esc(p.venue)} · ${esc(p.year)}</p>
    <div class="paper-why"><b>为什么推荐</b><p>${esc(p.why)}</p></div>
    <div class="note-box"><div class="note-head"><b>我的云端笔记</b><span class="sync-state" data-sync="${esc(p.url)}">${states[p.url]?"已同步云端":"尚无云端记录"}</span></div>
      <textarea rows="5" data-note="${esc(p.url)}" placeholder="写下问题、方法启发、可复现实验、和自己论文的关系……">${esc(s.note)}</textarea></div>
    <details class="paper-more"><summary>展开论文解读</summary><div><b>这篇讲什么</b><p>${esc(p.summary)}</p></div>${p.focus?`<div><b>精读重点</b><p>${esc(p.focus)}</p></div>`:""}${p.future?`<div><b>和未来规划怎么接</b><p>${esc(p.future)}</p></div>`:""}</details>
    <a class="paper-link" href="${esc(p.url)}" target="_blank" rel="noreferrer">打开原文 ↗</a>
  </article>`;
}
function render(){
  const count=readCount(),total=data.papers.length,pct=Math.round(count/Math.max(total,1)*100);
  const groups=[["P0 · 本周必读",data.papers.filter(p=>p.priority==="P0")],["P1 · 方法迁移",data.papers.filter(p=>p.priority==="P1")],["P2 · 视野拓展",data.papers.filter(p=>p.priority==="P2")]];
  briefLink.href="weekly/view.html?week="+encodeURIComponent(data.week);
  root.innerHTML=`
    <section class="workspace-hero"><div><p class="workspace-kicker">PRIVATE WEEKLY BRIEF</p><h1>${esc(data.week)} · 我的云端周报</h1><p class="workspace-summary">${esc(data.weekly_summary||data.purpose)}</p></div>
    <div class="week-select"><label>切换周报</label><select id="week-select">${archive.map(x=>`<option value="${esc(x.week)}" ${x.week===data.week?"selected":""}>${esc(x.week)} · ${esc(x.label)}</option>`).join("")}</select><strong id="cloud-count">${count} / ${total} 已读</strong><div class="progress"><i id="cloud-bar" style="width:${pct}%"></i></div><small id="cloud-pct">${pct}% · 已读状态与笔记均保存到 Supabase</small></div></section>
    ${data.signals?.length?`<section class="signals">${data.signals.map((x,i)=>`<article><span>${String(i+1).padStart(2,"0")}</span><div><b>${esc(x.title)}</b><p>${esc(x.text)}</p></div></article>`).join("")}</section>`:""}
    ${data.reading_order?.length?`<section class="reading-order"><h2>本周阅读顺序</h2><ol>${data.reading_order.map(x=>`<li>${esc(x)}</li>`).join("")}</ol></section>`:""}
    ${groups.filter(([,ps])=>ps.length).map(([title,ps])=>`<section class="paper-section"><div class="section-head"><h2>${title}</h2><span>${ps.length} papers</span></div><div class="paper-grid">${ps.map(renderCard).join("")}</div></section>`).join("")}`;
  root.hidden=false;loading.remove();
  document.querySelector("#week-select").addEventListener("change",e=>location.href="workspace.html?week="+encodeURIComponent(e.target.value));
  document.querySelectorAll("[data-read]").forEach(el=>el.addEventListener("change",e=>{
    const paper=data.papers.find(p=>p.url===e.target.dataset.read);if(!paper)return;
    const old=states[paper.url]||{is_read:false,note:""};const next={...old,is_read:e.target.checked};states[paper.url]=next;
    const card=e.target.closest(".paper-card");card?.classList.toggle("read",next.is_read);e.target.nextElementSibling.textContent=next.is_read?"已读":"标记已读";persist(paper,next);
  }));
  document.querySelectorAll("[data-note]").forEach(el=>el.addEventListener("input",e=>{
    const paper=data.papers.find(p=>p.url===e.target.dataset.note);if(paper)queueNote(paper,e.target.value);
  }));
}
async function importPending(){
  const raw=localStorage.getItem("radar_pending_cloud_import_v1");if(!raw)return;
  try{
    const p=JSON.parse(raw);if(p.week!==data.week)return;
    const paper=data.papers.find(x=>x.url===p.paperKey);if(!paper)return;
    const next={is_read:Boolean(p.isRead),note:String(p.note||"")};states[paper.url]=next;await persist(paper,next);localStorage.removeItem("radar_pending_cloud_import_v1");
  }catch{}
}
(async()=>{
  if(!(await auth())){loginRedirect();return}
  try{
    const ar=await fetch("data/archive.json",{cache:"no-store"}).then(r=>r.json());archive=ar;
    const week=requestedWeek()||ar[0]?.week;if(!week)throw new Error();
    data=await fetch(`weekly/${week}.json`,{cache:"no-store"}).then(r=>{if(!r.ok)throw new Error();return r.json()});
    const remote=await RadarCloud.list(week);states=mapStates(remote.states);render();await importPending();
  }catch{loading.textContent="云端周报加载失败，请刷新后重试。"}
})();
logoutBtn.addEventListener("click",async()=>{await RadarCloud.logout();location.replace("login.html")});