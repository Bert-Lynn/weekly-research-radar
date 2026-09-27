const params=new URLSearchParams(location.search);
const week=(params.get("week")||"").trim();
const valid=/^\d{4}-\d{2}-\d{2}$/.test(week);
const statusEl=document.querySelector("#brief-status");
const contentEl=document.querySelector("#brief-content");
const dateEl=document.querySelector("#side-date");
const tocEl=document.querySelector("#toc");\nconst cloudLink=document.querySelector("#cloud-brief-link");

function slugify(text){
  return text.toLowerCase().trim().replace(/[^\w\u4e00-\u9fff]+/g,"-").replace(/^-+|-+$/g,"");
}
function enhanceCallouts(){
  document.querySelectorAll(".markdown-body blockquote").forEach(q=>{
    const html=q.innerHTML;
    const m=html.match(/\[!(IMPORTANT|NOTE|TIP)\]/i);
    if(!m)return;
    const type=m[1].toLowerCase();
    q.classList.add("callout-"+type);
    q.innerHTML=html.replace(/\[!(IMPORTANT|NOTE|TIP)\]/i,`<span class="callout-title">${m[1]}</span>`);
  });
}
function buildToc(){
  const heads=[...contentEl.querySelectorAll("h2,h3")];
  const used=new Set();
  heads.forEach(h=>{
    let id=slugify(h.textContent)||"section";
    const base=id;let n=2;while(used.has(id))id=base+"-"+n++;
    used.add(id);h.id=id;
    const a=document.createElement("a");a.href="#"+id;a.textContent=h.textContent;
    a.className=h.tagName==="H3"?"toc-h3":"toc-h2";tocEl.appendChild(a);
  });
}
async function load(){
  if(!valid)throw new Error("invalid_week");
  dateEl.textContent=week;\n  if(cloudLink) cloudLink.href=`https://trajectory-research-growth.higgsfield.app/workspace?week=${encodeURIComponent(week)}`;
  const res=await fetch(`./${week}.md?v=20260927-v1`,{cache:"no-store"});
  if(!res.ok)throw new Error("not_found");
  const md=await res.text();
  marked.setOptions({gfm:true,breaks:false});
  const html=marked.parse(md);
  contentEl.innerHTML=DOMPurify.sanitize(html,{ADD_TAGS:["details","summary"],ADD_ATTR:["open"]});
  statusEl.remove();
  enhanceCallouts();
  buildToc();
  document.title=week+" · Weekly Research Brief";
}
load().catch(()=>{
  statusEl.className="brief-loading brief-error";
  statusEl.innerHTML='周报加载失败。<br><a href="../#archive">返回周报库</a>';
});