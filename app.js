function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]))}

let currentWeek="";

function readKey(i){return `radar:${currentWeek}:read:${i}`}
function noteKey(i){return `radar:${currentWeek}:note:${i}`}

function guideUrl(p,week=currentWeek){return `paper.html?week=${encodeURIComponent(week)}&paper=${encodeURIComponent(p.url)}`}
function paragraphs(text){return String(text||"").split(/\n+/).filter(Boolean).map(t=>`<p>${esc(t)}</p>`).join("")}
function safeUrl(url){try{const u=new URL(url);return ["https:","http:"].includes(u.protocol)?esc(u.href):"#"}catch{return "#"}}
function sourceLink(url,label){return `<a href="${safeUrl(url)}" target="_blank" rel="noreferrer">${esc(label)} <span aria-hidden="true">↗</span></a>`}
function noteEditor(i){return `<div class="notes-panel"><label for="note-${i}">我的问题 / 笔记</label><textarea id="note-${i}" data-note-index="${i}" rows="4" placeholder="记下疑点、复现实验或与自己研究的连接……"></textarea><div class="cloud-sync-row"><button type="button" class="cloud-sync-btn" data-cloud-index="${i}">同步到云端 ↗</button><span data-cloud-state="${i}">本地草稿</span></div><small>输入时自动保存在当前浏览器；点击同步后打开私人云端笔记。</small></div>`}
function paperFigure(p){if(!p.figure||p.figure.mode!=="original"||!p.figure.url)return "";return `<figure class="paper-figure">${sourceLink(p.figure.url,`查看 ${p.figure.figure_no||"原论文图"}`)}<img src="${safeUrl(p.figure.url)}" alt="${esc(p.figure.caption_zh||p.title)}" loading="lazy"><figcaption>${esc(p.figure.caption_zh||"")} ${esc(p.figure.look||"")} ${sourceLink(p.figure.source_url||p.url,p.figure.source||"图片来源")}</figcaption></figure>`}
function field(label,value){return value?`<div class="explanation-field"><h3>${label}</h3>${paragraphs(value)}</div>`:""}
function originalExplanation(p){return field("研究问题",p.summary)+field("数据与方法",p.data_method)+field("实验结果",p.results)+field("证据与适用边界",p.evidence)+field("精读重点",p.focus)+field("研究迁移",p.future)+field("重复风险",p.overlap)+field("研究空白",p.gap)}
function card(p,i){return `<article class="card ${esc(p.priority).toLowerCase()}" data-paper="${i}" data-priority="${esc(p.priority)}" id="paper-${i}">
  <div class="paper-number" aria-hidden="true">${String(i+1).padStart(2,"0")}</div><div class="card-body">
  <div class="card-top"><span class="tag priority">${esc(p.priority)}</span><span class="paper-lane">${esc(p.lane)}</span><span class="read-state" data-read-state="${i}">未读</span></div>
  <h3><a href="${guideUrl(p)}">${esc(p.title)}</a></h3>
  <p class="authors">${esc(p.authors)}</p><p class="paper-meta">${esc(p.venue)} <span>·</span> ${esc(p.year)}</p>
  <div class="paper-brief"><div class="block"><b>这篇讲什么</b><p>${esc(p.summary)}</p></div><div class="block key"><b>为什么推荐</b><p>${esc(p.why)}</p></div></div>
  <div class="guide-outline" aria-label="讲解栏目"><span>研究问题</span><span>方法与实验</span><span>局限与迁移</span></div><div class="card-actions"><a class="guide-link" href="${guideUrl(p)}">阅读论文讲解 <span aria-hidden="true">→</span></a><a class="paper-link" href="${safeUrl(p.url)}" target="_blank" rel="noreferrer">原文 / DOI ↗</a><button class="read-toggle" type="button" data-read-index="${i}" aria-pressed="false">○ 标记已读</button></div>
  <details class="note-details"><summary>我的笔记 <span>本地草稿 · 可同步</span></summary>${noteEditor(i)}</details>
  </div></article>`}
function issueArt(c){return `<svg class="issue-art" viewBox="0 0 320 200" aria-hidden="true"><path d="M28 163H300M37 39V177" stroke="#e2e7ef" fill="none"/><g transform="rotate(9 170 108)"><rect x="96" y="27" width="149" height="156" rx="3" fill="#f1f4f9" stroke="#dce2ec"/></g><g transform="rotate(-7 166 109)"><rect x="75" y="22" width="154" height="159" rx="3" fill="white" stroke="#d6dde9"/><path d="M194 22v39l9-7 9 7V22" fill="#3b5ea8"/><text x="94" y="49" fill="#7b8595" font-size="7" letter-spacing="1.5">RESEARCH BRIEF</text><text x="94" y="97" fill="#293342" font-size="28" font-family="serif">${String(c.papers.length).padStart(2,"0")}</text><text x="137" y="94" fill="#7b8595" font-size="9">PAPERS</text><path d="M94 116h113M94 127h97M94 138h108M94 152h60" stroke="#d7dfeb"/></g><path d="M44 150C2 114 256 53 283 85S232 164 90 173" stroke="#8096c2" stroke-width="1" fill="none"/><circle cx="56" cy="152" r="3.5" fill="#3b5ea8"/><path d="M276 43v10m-5-5h10" stroke="#a7b6ce"/></svg>`}
function headerNav(){const view=document.body.dataset.view;return `<a class="brand" href="hub.html"><span class="brand-mark">研</span><span>文献研究空间<small>RESEARCH & READING</small></span></a><nav aria-label="功能导航"><a class="back-hub" href="hub.html">← 功能选择</a><a href="papers.html" ${["paper","papers"].includes(view)?'aria-current="page"':""}>论文总结</a><a href="reports.html" ${view==="reports"?'aria-current="page"':""}>每周周报</a><a href="frontiers.html" ${view==="frontiers"?'aria-current="page"':""}>研究前沿</a><a class="nav-notes" href="workspace.html">阅读与笔记 ↗</a></nav>`}
function moduleFooter(){return `<footer class="site-footer"><a href="hub.html">← 返回功能选择</a><span>文献研究空间 · Research & Reading</span><a href="./">回到封面 ↗</a></footer>`}

function issueContext(c){return `<details class="issue-context"><summary><span>本期综述与阅读路线</span><span class="context-hint">${(c.signals||[]).length} 条判断 · ${c.papers.length} 篇论文 <b aria-hidden="true">＋</b></span></summary><div class="context-content"><div class="context-summary"><h2>本期综述</h2><p>${esc(c.weekly_summary||c.purpose)}</p>${c.freshness_note?`<p class="freshness">${esc(c.freshness_note)}</p>`:""}<div class="scope-row">${(c.scope||[]).map(x=>`<span>${esc(x)}</span>`).join("")}</div></div><div class="reading-order"><h2>建议阅读顺序</h2><ol>${(c.reading_order||[]).map(x=>`<li>${esc(x)}</li>`).join("")}</ol></div><div class="signals"><h2>本周判断</h2>${(c.signals||[]).map(x=>`<article><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></article>`).join("")}</div></div></details>`}
function restoreAnchor(){try{if(location.hash)document.getElementById?.(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView?.({block:"start"})}catch{}}
function configureLibrary(c){
 const search=document.querySelector("#paper-search"),unread=document.querySelector("#unread-only"),chips=[...document.querySelectorAll("[data-filter]")],cards=[...document.querySelectorAll("[data-paper]")];let category="all";
 function apply(){let visible=0;const q=search.value.trim().toLocaleLowerCase();cards.forEach(el=>{const i=Number(el.dataset.paper),p=c.papers[i];const text=[p.title,p.authors,p.lane,p.venue,p.summary,p.why,p.data_method].filter(Boolean).join(" ").toLocaleLowerCase();el.hidden=!((category==="all"||p.priority===category)&&(!q||text.includes(q))&&(!unread.checked||localStorage.getItem(readKey(i))!=="1"));if(!el.hidden)visible++});document.querySelectorAll(".paper-section").forEach(section=>{section.hidden=![...section.querySelectorAll(".card")].some(card=>!card.hidden)});document.querySelector("#result-count").textContent=`${visible} / ${c.papers.length} 篇`;document.querySelector("#no-results").hidden=visible!==0;}
 search.addEventListener("input",apply);unread.addEventListener("change",apply);chips.forEach(btn=>btn.addEventListener("click",()=>{category=btn.dataset.filter;chips.forEach(x=>x.setAttribute("aria-pressed",String(x===btn)));apply()}));document.addEventListener("radar:progress",apply);document.querySelector("#clear-search").addEventListener("click",()=>{search.value="";unread.checked=false;category="all";chips.forEach(x=>x.setAttribute("aria-pressed",String(x.dataset.filter==="all")));apply();search.focus()});apply();
}
function setupProgress(papers){
  const total=papers.length;
  const buttons=[...document.querySelectorAll("[data-read-index]")];
  const states=[...document.querySelectorAll("[data-read-state]")];
  const notes=[...document.querySelectorAll("[data-note-index]")];
  const cloudButtons=[...document.querySelectorAll("[data-cloud-index]")];
  const cloudStates=[...document.querySelectorAll("[data-cloud-state]")];

  function refresh(){
    let done=0;
    buttons.forEach(btn=>{
      const i=btn.dataset.readIndex;
      const read=localStorage.getItem(readKey(i))==="1";
      if(read) done++;
      btn.textContent=read?"✓ 已读":"○ 标记已读";
      btn.classList.toggle("done",read);
      btn.setAttribute("aria-pressed",String(read));
      const state=states.find(x=>x.dataset.readState===i);
      if(state) state.textContent=read?"已完成":"未读";
      const card=btn.closest(".card");
      if(card) card.classList.toggle("is-read",read);
    });
    const pct=total?Math.round(done/total*100):0;
    const count=document.querySelector("#progress-count");
    const percent=document.querySelector("#progress-percent");
    const bar=document.querySelector("#progress-bar");
    const orbRead=document.querySelector("#orb-read");
    if(count) count.textContent=`${done} / ${total}`;
    if(percent) percent.textContent=`${pct}%`;
    if(bar) bar.style.width=`${pct}%`;
    if(orbRead) orbRead.textContent=String(done);
  }

  buttons.forEach(btn=>btn.addEventListener("click",()=>{
    const i=btn.dataset.readIndex;
    const read=localStorage.getItem(readKey(i))==="1";
    localStorage.setItem(readKey(i),read?"0":"1");
    refresh();
    document.dispatchEvent(new Event("radar:progress"));
  }));

  notes.forEach(area=>{
    const i=area.dataset.noteIndex;
    area.value=localStorage.getItem(noteKey(i))||"";
    area.addEventListener("input",()=>localStorage.setItem(noteKey(i),area.value));
  });

  function setCloudState(index,text){
    const el=cloudStates.find(x=>x.dataset.cloudState===String(index));
    if(el) el.textContent=text;
  }

  cloudButtons.forEach(btn=>btn.addEventListener("click",()=>{
    const index=Number(btn.dataset.cloudIndex);
    const paper=papers[index];
    if(!paper)return;
    const pending={
      week:currentWeek,
      paperKey:paper.url,
      note:localStorage.getItem(noteKey(index))||"",
      isRead:localStorage.getItem(readKey(index))==="1"
    };
    localStorage.setItem("radar_pending_cloud_import_v1",JSON.stringify(pending));
    setCloudState(index,"正在打开云端笔记…");
    location.href="workspace.html?week="+encodeURIComponent(currentWeek);
  }));

  refresh();
}

async function load(){
 const requestedWeek=new URLSearchParams(location.search).get("week");if(requestedWeek&&!/^\d{4}-\d{2}-\d{2}$/.test(requestedWeek))throw new Error("invalid_week");
 const c=await fetch(requestedWeek?`weekly/${requestedWeek}.json`:"data/current.json?v=20261016-v1",{cache:"default"}).then(r=>{if(!r.ok)throw new Error("current_failed");return r.json()});currentWeek=c.week;
 document.querySelector(".topbar").innerHTML=headerNav();
 const groups=[["P0","主线必读","直接连接研究主线"],["P1","方法迁移","把其他领域的方法带回你的问题"],["P2","视野拓展","值得保留的新方向与技术能力"]];
 document.querySelector("#app").innerHTML=`<header class="module-heading" id="papers"><div><p class="eyebrow">01 / PAPER SUMMARIES</p><h1>论文总结</h1><p>先看研究问题与推荐理由，再逐篇深入方法、实验和边界。</p></div><div class="module-meta"><span>${esc(c.week)}</span><b>${c.papers.length} 篇论文</b><a href="reports.html">选择其他周次 →</a></div></header>
 <div class="paper-toolbar-meta"><span>${esc(c.label)}</span><div class="progress-card"><span>本期已读</span><strong id="progress-count">0 / ${c.papers.length}</strong><div class="progress-track"><i id="progress-bar"></i></div><span id="progress-percent">0%</span></div></div>
 <div class="library-tools"><label class="search-box"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></svg><input type="search" id="paper-search" placeholder="搜索本期标题、方法、作者…" aria-label="搜索本期论文"></label><div class="filter-chips" aria-label="论文分类"><button type="button" data-filter="all" aria-pressed="true">全部</button>${groups.map(([key,title])=>`<button type="button" data-filter="${key}" aria-pressed="false">${key} ${title}</button>`).join("")}</div><label class="unread-filter"><input type="checkbox" id="unread-only"> 只看未读</label><span id="result-count" aria-live="polite"></span></div>
 <div class="paper-library">${groups.map(([key,title,description])=>{const papers=c.papers.map((p,i)=>({p,i})).filter(({p})=>p.priority===key);return papers.length?`<section class="paper-section" id="${key==="P0"?"must":key==="P1"?"reserve":"horizon"}"><div class="section-head"><h2><span>${key}</span>${title}<small>${papers.length} 篇</small></h2><p>${description}</p></div><div class="paper-grid">${papers.map(({p,i})=>card(p,i)).join("")}</div></section>`:""}).join("")}<div id="no-results" class="empty-state" hidden><h3>没有找到匹配的论文</h3><p>试试更短的关键词，或取消分类和已读筛选。</p><button id="clear-search" type="button">重置筛选</button></div></div>${moduleFooter()}`;
 setupProgress(c.papers);configureLibrary(c);restoreAnchor();
}
function archiveRows(items){return items.map(x=>`<div class="archive-row"><a class="archive-main" href="${safeUrl(new URL(x.file,location.href).href)}"><span class="archive-date">${esc(x.week)}</span><b>${esc(x.label)}</b><span>${esc(x.total)} 篇</span><em aria-hidden="true">↗</em></a><a class="archive-catalog" href="papers.html?week=${encodeURIComponent(x.week)}#papers">本期论文 →</a></div>`).join("")}
async function loadReports(){
 document.querySelector(".topbar").innerHTML=headerNav();
 const [c,a]=await Promise.all([fetch("data/current.json?v=20261016-v1").then(r=>{if(!r.ok)throw new Error();return r.json()}),fetch("data/archive.json?v=20261016-v1").then(r=>{if(!r.ok)throw new Error();return r.json()})]);
 document.querySelector("#app").innerHTML=`<header class="module-heading"><div><p class="eyebrow">02 / WEEKLY REPORTS</p><h1>每周周报</h1><p>按周整理研究判断、阅读路线与下一步行动。</p></div><span class="module-count">${a.length} 期归档</span></header>
 <section class="current-report"><div class="report-date"><span>最新一期</span><b>${esc(c.week)}</b><small>${c.papers.length} 篇推荐文献</small></div><div class="report-copy"><p class="eyebrow">${esc(c.label.split(" · ")[0])}</p><h2>${esc(c.label.includes(" · ")?c.label.split(" · ").slice(1).join(" · "):c.label)}</h2><p>${esc(c.purpose)}</p><div class="report-links"><a class="primary-link" href="weekly/view.html?week=${encodeURIComponent(c.week)}">阅读本期周报 ↗</a><a href="papers.html?week=${encodeURIComponent(c.week)}">查看本期论文 →</a></div></div></section>
 <section class="archive-panel" id="archive"><div class="section-head"><h2>全部周报</h2><p>每一期都是独立的研究记录</p></div><div class="archive" id="archive-list">${archiveRows(a)}</div></section>${moduleFooter()}`;restoreAnchor();
}
async function loadFrontiers(){
 document.querySelector(".topbar").innerHTML=headerNav();
 const data=await fetch("data/frontiers.json",{cache:"no-store"}).then(r=>{if(!r.ok)throw new Error("frontiers_failed");return r.json()});
 const items=data.items||[];let knownPapers=[];try{const current=await fetch("data/current.json?v=20261016-v1").then(r=>r.ok?r.json():null);knownPapers=(current?.papers||[]).map(p=>({url:p.url,week:current.week}))}catch{}
 const kindLabels={toolrelease:"工具发布",dataset:"数据更新",preprint:"研究预印本",benchmark:"基准与复现"};
 document.querySelector("#app").innerHTML=`<header class="module-heading"><div><p class="eyebrow">03 / RESEARCH FRONTIERS</p><h1>研究前沿</h1><p>关注方法、工具与研究生态的新变化。</p></div><div class="module-meta"><span>来源核验</span><b>${esc(data.checked_at||data.updated_at||"")}</b></div></header>
 <div class="frontier-scope"><b>这份动态的范围</b><p>${esc(data.scope_note||"")}</p></div><section class="frontier-list" aria-label="研究前沿动态">${items.map((item,i)=>`<article class="frontier-card" id="frontier-${esc(item.id||i)}"><div class="frontier-index">${String(i+1).padStart(2,"0")}</div><div class="frontier-body"><div class="frontier-meta"><span>${esc(kindLabels[item.kind]||"研究动态")}</span><span class="frontier-date"><time datetime="${esc(item.date||"")}">${esc(item.date||"")}</time><small>${esc(item.date_label||"")}</small></span></div><h2>${esc(item.title)}</h2>${paragraphs(item.summary)}${item.why_it_matters?`<div class="frontier-why"><b>为什么值得关注</b>${paragraphs(item.why_it_matters)}</div>`:""}${item.action?`<div class="frontier-action"><b>可试一步 · 建议</b><p>${esc(item.action)}</p></div>`:""}${item.limitations?`<p class="frontier-limit"><b>边界 / 状态</b> ${esc(Array.isArray(item.limitations)?item.limitations.join("；"):item.limitations)}</p>`:""}<div class="frontier-sources"><span>来源</span>${(item.sources||[]).map(source=>sourceLink(source.url,source.label||"原始来源")).join("")}</div>${item.related_paper_url?(()=>{const known=knownPapers.find(p=>p.url===item.related_paper_url);return `<div class="related-paper">${known?`<a href="${guideUrl({url:known.url},known.week)}">阅读相关论文讲解 →</a>`:sourceLink(item.related_paper_url,"相关研究原文")}</div>`})():""}</div></article>`).join("")}</section>${moduleFooter()}`;restoreAnchor();
}

async function loadPaper(){
 document.querySelector(".topbar").innerHTML=headerNav();
 const params=new URLSearchParams(location.search),week=params.get("week"),key=params.get("paper");if(!/^\d{4}-\d{2}-\d{2}$/.test(week||"")||!key)throw new Error("invalid_paper");
 const c=await fetch(`weekly/${week}.json`,{cache:"no-store"}).then(r=>{if(!r.ok)throw new Error("missing_week");return r.json()});currentWeek=c.week;
 const i=c.papers.findIndex(p=>p.url===key),p=c.papers[i];if(!p)throw new Error("missing_paper");
 let guide=null;try{const g=await fetch("data/paper-guides.json",{cache:"no-store"}).then(r=>r.ok?r.json():null);guide=g?.guides?.find(x=>(x.paper_key||x.paper_url)===p.url)}catch{}
 const sections=(guide?.sections||[]).filter(s=>s.text&&s.title);const sources=[...new Set([p.url,...(p.source_urls||[])])];
 document.title=p.title+" · 论文讲解";
 document.querySelector("#app").innerHTML=`<div class="paper-breadcrumb"><a href="papers.html?week=${encodeURIComponent(c.week)}#paper-${i}">← 返回论文列表</a><a href="weekly/view.html?week=${encodeURIComponent(c.week)}">${esc(c.week)} 周报 ↗</a></div>
 <article class="guide-page card" data-paper="${i}"><header class="guide-header"><div class="card-top"><span class="tag priority">${esc(p.priority)}</span><span class="paper-lane">${esc(p.lane)}</span><span class="read-state" data-read-state="${i}">未读</span></div><h1>${esc(p.title)}</h1><p class="authors">${esc(p.authors)}</p><p class="paper-meta">${esc(p.venue)} · ${esc(p.year)}</p><p class="publication-note">${esc(p.published_at||p.level)}</p><div class="card-actions"><a class="primary-link" href="${safeUrl(p.url)}" target="_blank" rel="noreferrer">阅读原论文 ↗</a><a href="#paper-notes">写笔记 ↓</a><button class="read-toggle" type="button" data-read-index="${i}" aria-pressed="false">○ 标记已读</button></div></header>
 <div class="guide-layout"><aside class="guide-toc"><p class="eyebrow">本篇导读</p><nav aria-label="论文讲解目录">${sections.map((s,j)=>`<a href="#guide-section-${j}">${esc(s.title)}</a>`).join("")}<a href="#original-explanation">原周报记录</a><a href="#paper-sources">原文与来源</a><a href="#paper-notes">我的笔记</a></nav></aside><div class="guide-content">
 ${sections.length?`<div class="guide-verification"><b>新增讲解</b><span>核验 / 补充于 ${esc(guide.updated_at||guide.checked_at||"")}</span><p class="coverage-label">${guide.coverage==="abstract_only"?"核验范围：摘要与公开元数据；未完成全文复核。":guide.coverage==="full_text"?"核验范围：原论文全文与列出的公开来源。":"核验范围以以下说明为准。"}</p>${guide.verification_note?`<p>${esc(guide.verification_note)}</p>`:""}</div>${sections.map((s,j)=>`<section class="guide-section" id="guide-section-${j}"><h2><span>${String(j+1).padStart(2,"0")}</span>${esc(s.title)}</h2>${paragraphs(s.text)}${s.source_urls?.length?`<div class="section-sources"><span>本节依据</span>${s.source_urls.map((url,k)=>sourceLink(url,`来源 ${k+1}`)).join("")}</div>`:""}</section>`).join("")}`:""}
 <section class="original-explanation" id="original-explanation"><div class="section-heading"><h2>原周报记录</h2><span>${esc(c.week)} 发布内容</span></div><p class="explanation-origin">以下保留本期推荐中的原有解读与核验说明。</p>${originalExplanation(p)}${paperFigure(p)}</section>
 <section class="guide-section" id="paper-sources"><h2>原文与来源</h2><ul class="source-list">${sources.map((url,j)=>`<li>${sourceLink(url,j===0?"原论文 / DOI":`本期引用来源 ${j}`)}</li>`).join("")}${(guide?.sources||[]).filter(s=>s.url&&s.label).map(s=>`<li>${sourceLink(s.url,s.label)}</li>`).join("")}</ul>${p.code_url?`<div class="code-source">${sourceLink(p.code_url,"论文提供的代码链接")}<p>代码可用性与复现状态以本期证据说明及补充讲解为准。</p></div>`:""}</section>
 <section class="guide-section" id="paper-notes"><h2>我的笔记</h2>${noteEditor(i)}</section></div></div></article><footer class="site-footer"><a href="papers.html?week=${encodeURIComponent(c.week)}#paper-${i}">← 返回论文列表</a><a href="workspace.html?week=${encodeURIComponent(c.week)}">本期私人云端笔记 ↗</a></footer>`;
 setupProgress(c.papers);restoreAnchor();
}
({paper:loadPaper,papers:load,reports:loadReports,frontiers:loadFrontiers}[document.body.dataset.view]||load)().catch(()=>{document.querySelector("#app").innerHTML='<div class="empty-state"><h1>内容暂时无法载入</h1><p>请检查链接中的周报日期，或稍后刷新重试。</p><a href="hub.html">返回功能选择 →</a></div>'});

