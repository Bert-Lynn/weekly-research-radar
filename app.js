function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]))}

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
    <div class="orb-core"><span>WEEK</span><b>${total}</b><small>papers</small></div>
  </div>`
}

function card(p,i){
  return `<article class="card ${esc(p.priority).toLowerCase()}">
    <div class="card-top">
      <span class="tag priority ${esc(p.priority).toLowerCase()}">${esc(p.priority)}</span>
      <span class="tag">${esc(p.lane)}</span>
      <span class="paper-index">${String(i+1).padStart(2,"0")}</span>
    </div>
    <h3>${esc(p.title)}</h3>
    <p class="authors">${esc(p.authors)}</p>
    <div class="meta-tags"><span>${esc(p.venue)}</span><span>${esc(p.year)}</span><span>${esc(p.level)}</span></div>
    <div class="block"><b>这篇讲什么</b><p>${esc(p.summary)}</p></div>
    <div class="block key"><b>为什么推荐给你</b><p>${esc(p.why)}</p></div>
    <details>
      <summary>展开精读提示</summary>
      <div class="block"><b>精读重点</b><p>${esc(p.focus)}</p></div>
      <div class="block"><b>和未来规划怎么接</b><p>${esc(p.future)}</p></div>
      ${p.overlap||p.gap?`<div class="block"><b>重复风险 / 研究空白</b><p>${esc(p.overlap)} ${esc(p.gap)}</p></div>`:""}
    </details>
    <a class="paper-link" href="${esc(p.url)}" target="_blank" rel="noreferrer">打开原文 / DOI <span>↗</span></a>
  </article>`
}

async function load(){
  const [c,a]=await Promise.all([fetch("data/current.json").then(r=>r.json()),fetch("data/archive.json").then(r=>r.json())]);
  const p0=c.papers.filter(p=>p.priority==="P0"),rest=c.papers.filter(p=>p.priority!=="P0");
  document.querySelector("#app").innerHTML=`
    <section class="hero" id="home">
      <div class="hero-copy">
        <p class="eyebrow">${esc(c.week)} · ${esc(c.label)}</p>
        <h1>每周读什么，<span>直接告诉你。</span></h1>
        <p class="hero-desc">${esc(c.purpose)}</p>
        <div class="hero-actions"><a class="btn primary" href="#must">先看本周 P0</a><a class="btn secondary" href="#actions">看本周行动</a></div>
        <div class="hero-stats"><div><strong>${p0.length}</strong><span>本周必读</span></div><div><strong>${rest.length}</strong><span>进阶储备</span></div><div><strong>${c.actions.length}</strong><span>建议动作</span></div></div>
      </div>
      <div class="hero-visual">
        ${orb(c.papers.length)}
        <aside class="usage"><span class="usage-label">使用顺序</span><ol>
          <li><b>01</b><span>先看 P0，每周最多 2–3 篇。</span></li>
          <li><b>02</b><span>先读“为什么推荐给你”。</span></li>
          <li><b>03</b><span>按精读提示跳读，不从第一页硬啃。</span></li>
          <li><b>04</b><span>把阅读转成代码、对比表或实验。</span></li>
        </ol></aside>
      </div>
    </section>
    <section class="focus-strip"><span>本周筛选逻辑</span><b>直接竞争论文</b><b>需求不确定性</b><b>行为 + AI</b><b>Decision-Focused Learning</b><b>鲁棒调度</b></section>
    <section class="section" id="must">
      <div class="section-head"><div><p class="eyebrow">START HERE</p><h2>本周先读这 ${p0.length} 篇</h2></div><p>优先处理直接影响研究边界、未来方法路线或 AI + OR 能力构建的内容。</p></div>
      <div class="paper-grid featured">${p0.map((p,i)=>card(p,i)).join("")}</div>
    </section>
    <section class="section reserve" id="reserve">
      <div class="section-head"><div><p class="eyebrow">NEXT LAYER</p><h2>有余力再读</h2></div><p>不是为了凑数量。这些论文服务于未来 6–12 个月的方法储备、项目选题和技术能力建设。</p></div>
      <div class="paper-grid">${rest.map((p,i)=>card(p,i+p0.length)).join("")}</div>
    </section>
    <section class="section" id="actions">
      <div class="section-head"><div><p class="eyebrow">FROM READING TO OUTPUT</p><h2>把阅读变成成果</h2></div><p>阅读本身不算完成。每个动作都必须留下一个可复用、可展示、可继续迭代的产物。</p></div>
      <div class="actions">${c.actions.map((x,i)=>`<article class="action"><div class="action-no">${String(i+1).padStart(2,"0")}</div><div><div class="action-time">${esc(x.time)}</div><h3>${esc(x.title)}</h3><p>${esc(x.deliverable)}</p></div></article>`).join("")}</div>
    </section>
    <section class="archive-panel" id="archive">
      <div><p class="eyebrow">ARCHIVE</p><h2>历史周报</h2><p>每周五新增一周，不覆盖旧推荐。以后可以回看一个方法是什么时候进入你的研究视野的。</p></div>
      <div class="archive">${a.map(x=>`<a href="${esc(x.file)}"><span>${esc(x.week)}</span><b>${esc(x.label)}</b><em>${esc(x.total)} papers</em></a>`).join("")}</div>
    </section>`
}
load().catch(()=>{document.querySelector("#app").innerHTML="<p class='loading'>读取数据失败，请直接进入 weekly/ 查看周报。</p>"})