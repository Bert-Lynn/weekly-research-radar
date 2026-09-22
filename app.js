function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]))}

let currentWeek="";

function readKey(i){return `radar:${currentWeek}:read:${i}`}
function noteKey(i){return `radar:${currentWeek}:note:${i}`}

function visualKind(p){
  const t=(p.title+" "+p.lane).toLowerCase();
  if(t.includes("vision")||t.includes("cvpr")||t.includes("arc ")) return "cv";
  if(t.includes("decision-focused")||t.includes("optimization")||t.includes("constraint")||t.includes("鲁棒")||t.includes("robust")) return "or";
  if(t.includes("uncertainty")||t.includes("probabilistic")||t.includes("quantile")||t.includes("vae")||t.includes("mixture")) return "uncertainty";
  if(t.includes("choice")||t.includes("context-aware")||t.includes("domain knowledge")||t.includes("行为")) return "choice";
  if(t.includes("airline")||t.includes("fleet")||t.includes("scheduling")||t.includes("航空")) return "aviation";
  return "ai";
}

function paperVisual(p,i){
  const kind=visualKind(p);
  const labels={aviation:"AVIATION NETWORK",or:"AI × OR",uncertainty:"UNCERTAINTY",choice:"BEHAVIOR × AI",cv:"COMPUTER VISION",ai:"AI / ML"};
  const svg={
    aviation:`<svg viewBox="0 0 640 240" aria-hidden="true"><path d="M40 172 C138 74 232 206 322 116 S480 62 596 146" class="v-line"/><path d="M52 72 C170 164 254 44 368 142 S510 212 604 82" class="v-line faint"/><g class="v-nodes"><circle cx="72" cy="158" r="7"/><circle cx="182" cy="108" r="5"/><circle cx="312" cy="120" r="9"/><circle cx="446" cy="92" r="6"/><circle cx="568" cy="144" r="8"/></g><path d="M72 158 L312 120 L568 144 M182 108 L446 92 M312 120 L446 92" class="v-link"/></svg>`,
    or:`<svg viewBox="0 0 640 240" aria-hidden="true"><path d="M52 190 H596 M92 210 V42" class="v-axis"/><path d="M112 174 L208 128 L304 146 L414 78 L552 96" class="v-line"/><polygon points="330,176 418,152 486,98 396,70 316,112" class="v-poly"/><path d="M184 74 C248 52 274 70 314 108" class="v-arrow"/></svg>`,
    uncertainty:`<svg viewBox="0 0 640 240" aria-hidden="true"><path d="M42 194 H604" class="v-axis"/><path d="M62 184 C136 182 148 76 224 76 C302 76 320 182 390 184" class="v-line"/><path d="M210 184 C270 180 290 108 350 108 C414 108 438 180 502 184" class="v-line faint"/><g class="v-bars"><rect x="82" y="150" width="18" height="34"/><rect x="116" y="118" width="18" height="66"/><rect x="150" y="88" width="18" height="96"/><rect x="184" y="126" width="18" height="58"/></g><path d="M534 62 V184 M510 82 H558 M510 168 H558" class="v-range"/></svg>`,
    choice:`<svg viewBox="0 0 640 240" aria-hidden="true"><g class="v-nodes"><circle cx="86" cy="72" r="8"/><circle cx="86" cy="120" r="8"/><circle cx="86" cy="168" r="8"/><circle cx="258" cy="96" r="8"/><circle cx="258" cy="144" r="8"/><circle cx="428" cy="120" r="9"/><circle cx="560" cy="120" r="11"/></g><path d="M94 72 L250 96 M94 72 L250 144 M94 120 L250 96 M94 120 L250 144 M94 168 L250 96 M94 168 L250 144 M266 96 L420 120 M266 144 L420 120 M437 120 L549 120" class="v-link"/><path d="M80 202 C168 186 222 168 298 150 C392 128 476 84 562 56" class="v-line"/></svg>`,
    cv:`<svg viewBox="0 0 640 240" aria-hidden="true"><g class="v-grid">${Array.from({length:18},(_,k)=>{const x=48+(k%6)*42,y=42+Math.floor(k/6)*42;return `<rect x="${x}" y="${y}" width="28" height="28" rx="4"/>`}).join("")}</g><path d="M334 62 H424 M334 108 H424 M334 154 H424" class="v-link"/><rect x="448" y="54" width="140" height="116" rx="18" class="v-box"/><path d="M472 82 H566 M472 108 H566 M472 134 H540" class="v-line short"/></svg>`,
    ai:`<svg viewBox="0 0 640 240" aria-hidden="true"><path d="M64 162 C144 54 236 56 302 128 S466 200 574 86" class="v-line"/><g class="v-nodes"><circle cx="88" cy="148" r="7"/><circle cx="202" cy="78" r="7"/><circle cx="314" cy="134" r="7"/><circle cx="444" cy="154" r="7"/><circle cx="556" cy="92" r="7"/></g></svg>`
  }[kind];
  return `<div class="paper-visual ${kind}"><div class="visual-label"><span>${labels[kind]}</span><b>${String(i+1).padStart(2,"0")}</b></div>${svg}</div>`;
}


function paperFigure(p,i){
  if(!p.figure || p.figure.mode!=="original" || !p.figure.url) return paperVisual(p,i);
  return `<figure class="paper-figure original">
    <div class="figure-ribbon"><span>原论文图 · ${esc(p.figure.figure_no||"Figure")}</span><b>${esc(p.figure.license||"Open access")}</b></div>
    <a href="${esc(p.figure.url)}" target="_blank" rel="noreferrer" class="figure-image-link">
      <img src="${esc(p.figure.url)}" alt="${esc(p.figure.caption_zh||p.title)}" loading="lazy" referrerpolicy="no-referrer">
    </a>
    <figcaption>
      <p>${esc(p.figure.caption_zh||"")}</p>
      <div class="figure-look"><b>你看哪里</b><span>${esc(p.figure.look||"")}</span></div>
      <a href="${esc(p.figure.source_url||p.url)}" target="_blank" rel="noreferrer">来源：${esc(p.figure.source||p.venue)} · ${esc(p.figure.figure_no||"Figure")} ↗</a>
    </figcaption>
  </figure>`;
}

function orb(total){
  return `<div class="orb-wrap" aria-hidden="true">
    <div class="orb-halo"></div>
    <svg class="orb" viewBox="0 0 640 640" role="presentation">
      <circle class="orb-ring ring-a" cx="320" cy="320" r="242"></circle>
      <circle class="orb-ring ring-b" cx="320" cy="320" r="178"></circle>
      <circle class="orb-ring ring-c" cx="320" cy="320" r="110"></circle>
      <path class="orb-path path-a" d="M88 360 C170 130 440 95 554 302 C622 426 492 570 312 536 C159 508 62 437 88 360Z"></path>
      <path class="orb-path path-b" d="M150 160 C305 230 420 150 520 306 C590 415 450 472 330 420 C198 363 112 280 150 160Z"></path>
      <g class="nodes"><circle cx="155" cy="225" r="6"></circle><circle cx="484" cy="186" r="5"></circle><circle cx="525" cy="400" r="7"></circle><circle cx="246" cy="494" r="5"></circle><circle cx="310" cy="270" r="8"></circle><circle cx="391" cy="348" r="5"></circle><circle cx="212" cy="333" r="4"></circle><circle cx="423" cy="468" r="4"></circle></g>
      <g class="orb-labels"><text x="98" y="205">CHOICE</text><text x="438" y="166">DEMAND</text><text x="482" y="434">ROBUST</text><text x="194" y="525">AI × OR</text></g>
    </svg>
    <div class="orb-core"><span>THIS WEEK</span><b id="orb-read">0</b><small>read</small></div>
  </div>`
}

function card(p,i){
  return `<article class="card ${esc(p.priority).toLowerCase()}" data-paper="${i}">
    ${paperFigure(p,i)}
    <div class="card-body">
      <div class="card-top">
        <span class="tag priority ${esc(p.priority).toLowerCase()}">${esc(p.priority)}</span>
        <span class="tag">${esc(p.lane)}</span>
      </div>
      <h3>${esc(p.title)}</h3>
      <p class="authors">${esc(p.authors)}</p>
      <div class="meta-tags"><span>${esc(p.venue)}</span><span>${esc(p.year)}</span><span>${esc(p.level)}</span></div>
      <div class="paper-actions">
        <button class="read-toggle" type="button" data-read-index="${i}">○ 标记已读</button>
        <span class="read-state" data-read-state="${i}">未读</span>
      </div>
      <div class="block"><b>这篇讲什么</b><p>${esc(p.summary)}</p></div>
      <div class="block key"><b>为什么推荐给你</b><p>${esc(p.why)}</p></div>
      <details>
        <summary>展开精读提示</summary>
        <div class="block"><b>精读重点</b><p>${esc(p.focus)}</p></div>
        <div class="block"><b>和未来规划怎么接</b><p>${esc(p.future)}</p></div>
        ${p.overlap||p.gap?`<div class="block"><b>重复风险 / 研究空白</b><p>${esc(p.overlap)} ${esc(p.gap)}</p></div>`:""}
      </details>
      <details class="notes-panel">
        <summary>我的问题 / 笔记</summary>
        <textarea data-note-index="${i}" rows="5" placeholder="记下你对这篇论文的问题、疑点、可复现实验或与自己研究的连接……"></textarea>
        <small>只保存在当前浏览器，不上传，也不会调用任何 AI 接口。</small>
      </details>
      <a class="paper-link" href="${esc(p.url)}" target="_blank" rel="noreferrer">打开原文 / DOI <span>↗</span></a>
    </div>
  </article>`
}

function setupProgress(total){
  const buttons=[...document.querySelectorAll("[data-read-index]")];
  const states=[...document.querySelectorAll("[data-read-state]")];
  const notes=[...document.querySelectorAll("[data-note-index]")];

  function refresh(){
    let done=0;
    buttons.forEach(btn=>{
      const i=btn.dataset.readIndex;
      const read=localStorage.getItem(readKey(i))==="1";
      if(read) done++;
      btn.textContent=read?"✓ 已读":"○ 标记已读";
      btn.classList.toggle("done",read);
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
  }));

  notes.forEach(area=>{
    const i=area.dataset.noteIndex;
    area.value=localStorage.getItem(noteKey(i))||"";
    area.addEventListener("input",()=>localStorage.setItem(noteKey(i),area.value));
  });

  refresh();
}

async function load(){
  const [c,a]=await Promise.all([
    fetch("data/current.json?v=20260922-v6",{cache:"no-store"}).then(r=>r.json()),
    fetch("data/archive.json?v=20260922-v6",{cache:"no-store"}).then(r=>r.json())
  ]);
  currentWeek=c.week;
  const p0=c.papers.filter(p=>p.priority==="P0"),rest=c.papers.filter(p=>p.priority!=="P0");
  const signals=(c.signals||[]).map((x,i)=>`<article><span>${String(i+1).padStart(2,"0")}</span><div><b>${esc(x.title)}</b><p>${esc(x.text)}</p></div></article>`).join("");
  const scope=(c.scope||[]).map(x=>`<b>${esc(x)}</b>`).join("");
  const order=(c.reading_order||[]).map((x,i)=>`<li><span>${String(i+1).padStart(2,"0")}</span><p>${esc(x)}</p></li>`).join("");

  document.querySelector("#app").innerHTML=`
    <section class="weekly-overview" id="home">
      <div class="overview-copy">
        <p class="eyebrow">${esc(c.week)} · ${esc(c.label)}</p>
        <h1>本周文献总结</h1>
        <p class="weekly-summary">${esc(c.weekly_summary||c.purpose)}</p>
        <div class="scope-row"><span>本周覆盖</span>${scope}</div>
        <div class="progress-card">
          <div class="progress-top"><div><span>阅读进度</span><strong id="progress-count">0 / ${c.papers.length}</strong></div><em id="progress-percent">0%</em></div>
          <div class="progress-track"><i id="progress-bar"></i></div>
          <small>勾选状态和笔记只保存在你当前浏览器。需要跨设备时可使用顶部“跨设备同步”。</small>
        </div>
      </div>
      <div class="overview-visual">
        ${orb(c.papers.length)}
        <div class="reading-order">
          <span>这周怎么读</span>
          <ol>${order}</ol>
        </div>
      </div>
      <div class="signals-title"><span>WEEKLY SIGNALS</span><h2>这周我给你的 5 条判断</h2></div>
      <div class="signals-grid">${signals}</div>
    </section>

    <section class="focus-strip"><span>筛选方向</span><b>航空 / 交通</b><b>Operations Research</b><b>AI / ML</b><b>Computer Vision</b><b>AI + OR</b></section>

    <section class="section" id="must">
      <div class="section-head"><div><p class="eyebrow">START HERE</p><h2>本周先读这 ${p0.length} 篇</h2></div><p>这里只放真正会影响你的研究边界或未来方法线的论文。P0 与下面的拓展阅读分开处理。</p></div>
      <div class="paper-grid featured">${p0.map((p,i)=>card(p,i)).join("")}</div>
    </section>

    <section class="section reserve" id="reserve">
      <div class="section-head"><div><p class="eyebrow">NEXT LAYER</p><h2>方法储备与视野拓展</h2></div><p>可以包含航空、OR、AI、CV，但必须能迁移成方法、实验、项目或新的研究视角。</p></div>
      <div class="paper-grid">${rest.map((p,i)=>card(p,i+p0.length)).join("")}</div>
    </section>

    <section class="section" id="actions">
      <div class="section-head"><div><p class="eyebrow">FROM READING TO OUTPUT</p><h2>把阅读变成成果</h2></div><p>阅读本身不算完成。每个动作都必须留下一个可复用、可展示、可继续迭代的产物。</p></div>
      <div class="actions">${c.actions.map((x,i)=>`<article class="action"><div class="action-no">${String(i+1).padStart(2,"0")}</div><div><div class="action-time">${esc(x.time)}</div><h3>${esc(x.title)}</h3><p>${esc(x.deliverable)}</p></div></article>`).join("")}</div>
    </section>

    <section class="archive-panel" id="archive">
      <div><p class="eyebrow">ARCHIVE</p><h2>历史周报</h2><p>每周五新增一周，不覆盖旧推荐。以后可以回看一个方法是什么时候进入你的研究视野的。</p></div>
      <div class="archive">${a.map(x=>`<a href="${esc(x.file)}"><span>${esc(x.week)}</span><b>${esc(x.label)}</b><em>${esc(x.total)} papers</em></a>`).join("")}</div>
    </section>`;

  setupProgress(c.papers.length);
}
load().catch(()=>{document.querySelector("#app").innerHTML="<p class='loading'>读取数据失败，请直接进入 weekly/ 查看周报。</p>"})