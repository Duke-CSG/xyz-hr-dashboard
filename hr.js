const $=(s,el=document)=>el.querySelector(s);
const $$=(s,el=document)=>[...el.querySelectorAll(s)];

// ===== 탭 전환 =====
$$('.navtab').forEach(b=>b.onclick=()=>{
  $$('.navtab').forEach(x=>x.classList.remove('active')); b.classList.add('active');
  $$('.tab-panel').forEach(p=>p.classList.remove('active'));
  $('#tab-'+b.dataset.tab).classList.add('active');
});

// ===== MVC 홈 =====
const CORE_VALUES=[
  ['01','고객 집착','User Centered Design','모든 의사결정의 중심에 고객을 둔다'],
  ['02','완결의 그릿','Grit','될 때까지 몰입하고 끝까지 책임진다'],
  ['03','속도와 실행','Speed & Execution','완벽한 계획보다 빠른 실행과 개선을 택한다'],
  ['04','분석적 사고','Analytic Mindset','감이 아니라 데이터로 전략을 세운다'],
  ['05','주도와 팀워크','Leadership & Followship','스스로 주도하되 하나의 팀으로 움직인다']
];
$('#cvGrid').innerHTML=CORE_VALUES.map(([n,name,en,desc])=>`
  <div class="cv-card"><div class="cv-num">${n}</div>
  <div class="cv-name">${name}</div><div class="cv-en">${en}</div>
  <div class="cv-desc">${desc}</div></div>`).join('');

const GROUPS=[
  ['발명','R&D그룹','일상 로봇의 지능·설계·자동화 원천기술을 개발한다','디자인 · 지능화 · 자동화','gf-invent'],
  ['보급','로봇사업그룹','로봇을 판매·운영하여 지속가능한 매출을 창출한다','영업 · 마케팅 · 운영','gf-supply'],
  ['확장','신사업그룹','로봇 기술을 새 시장·고객·재원과 연결해 사업을 확장한다','사업개발 · 정부사업 · 교육사업','gf-expand'],
  ['실증','리테일그룹 (자회사)','로봇 리테일로 XYZ 가치를 증명하고 실증 데이터를 생산한다','리테일팀 · 라운지엑스','gf-prove'],
  ['토대','경영지원그룹','재무·인사·법무의 관리 기반과 통제 체계를 제공한다','재무회계 · 인사총무 · 법무','gf-base']
];
$('#groupFlow').innerHTML=GROUPS.map(([role,name,mission,teams,cls])=>`
  <div class="gf-card ${cls}"><div class="gf-role">${role}</div>
  <div class="gf-name">${name}</div><div class="gf-mission">${mission}</div>
  <div class="gf-teams">${teams}</div></div>`).join('');

// ===== 채용 대시보드 =====
function fmtDate(s){ return s||'-'; }
function initRecruit(){
  const R=RECRUIT;
  $('#recDate').textContent='2026-09-03 기준 · 자동 집계';
  // KPI
  const active=R.reqs.filter(r=>r.status==='진행중');
  const done=R.reqs.filter(r=>r.status==='완료');
  const overdue=active.filter(r=>r.diagnosis==='기간초과');
  const doneDays=done.map(r=>r.days).filter(Boolean);
  const avgDone=doneDays.length?Math.round(doneDays.reduce((a,b)=>a+b,0)/doneDays.length):0;
  const totalApp=R.funnel.reduce((s,f)=>s+(f.total||0),0);
  const q4=R.quad.filter(q=>q.quadrant===4).length;
  const kpis=[
    ['진행중 채용',active.length,'건',''],
    ['완료(누적)',done.length,'건',''],
    ['기간초과',overdue.length,'건','alert'],
    ['평균 소요일',avgDone,'일',''],
    ['총 지원자',totalApp,'명',''],
    ['공고당 평균',(totalApp/R.funnel.length).toFixed(1),'명','']
  ];
  $('#kpiRow').innerHTML=kpis.map(([l,v,u,cls])=>`
    <div class="kpi-card ${cls}"><div class="kpi-val">${v}<small>${u}</small></div>
    <div class="kpi-label">${l}</div></div>`).join('');

  renderQuadrant(R.quad);
  renderTrend(R.trend);
  renderFunnel(R.funnel.filter(f=>f.total>0).slice(0,8));
  renderRecTable(R.reqs);
}

// 사분면 산점도
function renderQuadrant(quad){
  const W=560,H=360,padL=48,padR=20,padT=20,padB=44;
  const pts=quad.filter(q=>q.days!=null&&q.applicants!=null);
  const maxD=Math.max(...pts.map(p=>p.days),120);
  const maxA=Math.max(...pts.map(p=>p.applicants),80);
  const xFor=d=>padL+(W-padL-padR)*(d/maxD);
  const yFor=a=>H-padB-(H-padT-padB)*(a/maxA);
  const midX=xFor(maxD/2), midY=yFor(maxA/2);
  const colors={1:'#1E6B4F',2:'#2E5C8A',3:'#B4690E',4:'#B03A2E'};
  let svg=`<svg viewBox="0 0 ${W} ${H}" class="rec-svg">`;
  // 사분면 배경
  svg+=`<rect x="${midX}" y="${padT}" width="${W-padR-midX}" height="${midY-padT}" fill="#FBEAE8" opacity="0.4"/>`;
  svg+=`<text x="${W-padR-8}" y="${padT+16}" text-anchor="end" font-size="10" fill="#B03A2E" font-weight="700">장기·저지원 (개선 필요)</text>`;
  // 축
  svg+=`<line x1="${padL}" y1="${H-padB}" x2="${W-padR}" y2="${H-padB}" stroke="#3A3A3A" stroke-width="1.5"/>`;
  svg+=`<line x1="${padL}" y1="${padT}" x2="${padL}" y2="${H-padB}" stroke="#3A3A3A" stroke-width="1.5"/>`;
  // 중앙 구분선
  svg+=`<line x1="${midX}" y1="${padT}" x2="${midX}" y2="${H-padB}" stroke="#CBD0D6" stroke-width="1" stroke-dasharray="3 3"/>`;
  svg+=`<line x1="${padL}" y1="${midY}" x2="${W-padR}" y2="${midY}" stroke="#CBD0D6" stroke-width="1" stroke-dasharray="3 3"/>`;
  // 점
  pts.forEach((p,i)=>{
    const x=xFor(p.days),y=yFor(p.applicants);
    svg+=`<circle cx="${x}" cy="${y}" r="6" fill="${colors[p.quadrant]||'#6B7280'}" opacity="0.85"/>`;
    svg+=`<text x="${x}" y="${y-9}" text-anchor="middle" font-size="8" fill="#3A3A3A">${p.no}</text>`;
  });
  // 축 라벨
  svg+=`<text x="${(padL+W-padR)/2}" y="${H-8}" text-anchor="middle" font-size="10" fill="#6B7280">소요일 →</text>`;
  svg+=`<text x="14" y="${(padT+H-padB)/2}" text-anchor="middle" font-size="10" fill="#6B7280" transform="rotate(-90 14 ${(padT+H-padB)/2})">지원자수 →</text>`;
  svg+=`</svg>`;
  // 범례 (번호-직무)
  const legend=pts.filter(p=>p.quadrant===4).map(p=>`<span style="color:#B03A2E">🔴 ${p.label}</span>`).join(' · ');
  $('#quadChart').innerHTML=svg+`<p class="rec-note" style="margin-top:8px">개선 필요: ${legend}</p>`;
}

// 지원자 추이
function renderTrend(trend){
  const t=trend.filter(x=>x.total!=null);
  if(!t.length){ $('#trendChart').innerHTML='<p class="rec-note">데이터 없음</p>'; return; }
  const W=560,H=300,padL=44,padR=20,padT=20,padB=40;
  const maxV=Math.max(...t.map(x=>x.total));
  const n=t.length;
  const xFor=i=>padL+(W-padL-padR)*(n===1?0.5:i/(n-1));
  const yFor=v=>H-padB-(H-padT-padB)*(v/maxV);
  let svg=`<svg viewBox="0 0 ${W} ${H}" class="rec-svg">`;
  for(let k=0;k<=4;k++){ const v=maxV*k/4,y=yFor(v);
    svg+=`<line x1="${padL}" y1="${y}" x2="${W-padR}" y2="${y}" stroke="#E5E7EB"/><text x="${padL-8}" y="${y+3}" text-anchor="end" font-size="9" fill="#9CA3AF">${Math.round(v)}</text>`; }
  // 누적 area+line
  const line=t.map((x,i)=>`${xFor(i)},${yFor(x.total)}`).join(' ');
  svg+=`<polyline points="${padL},${H-padB} ${line} ${xFor(n-1)},${H-padB}" fill="#1E3A5F" opacity="0.08"/>`;
  svg+=`<polyline points="${line}" fill="none" stroke="#1E3A5F" stroke-width="2.5"/>`;
  t.forEach((x,i)=>{ svg+=`<circle cx="${xFor(i)}" cy="${yFor(x.total)}" r="3" fill="#1E3A5F"/>`; });
  // x라벨 (몇 개만)
  t.forEach((x,i)=>{ if(i%2===0||i===n-1){ svg+=`<text x="${xFor(i)}" y="${H-padB+16}" text-anchor="middle" font-size="8" fill="#6B7280">${(x.date||'').slice(5)}</text>`; }});
  svg+=`</svg>`;
  const last=t[t.length-1];
  $('#trendChart').innerHTML=svg+`<p class="rec-note" style="margin-top:8px">누적 ${last.total}명 · 최근 주 신규 +${last.new||0}명</p>`;
}

// 전형 퍼널
function renderFunnel(funnel){
  const stages=[['서류','#1E3A5F'],['1차','#2E5C8A'],['2차','#4A6485'],['처우','#8C6A3F'],['입사','#1E6B4F']];
  const maxTotal=Math.max(...funnel.map(f=>f.total||1));
  let html='';
  funnel.forEach(f=>{
    const segs=[['서류',f.서류],['1차',f['1차']],['2차',f['2차']],['처우',f.처우],['입사',f.입사]];
    // 각 단계 통과 인원을 누적 막대로 (총지원자 기준 폭)
    const totalW=(f.total/maxTotal)*100;
    let bars=`<div class="funnel-seg" style="background:#CBD0D6;flex:0 0 auto;width:44px" title="총지원 ${f.total}">${f.total}</div>`;
    stages.forEach(([label,color],i)=>{
      const val=segs[i][1]||0;
      if(val>0) bars+=`<div class="funnel-seg" style="background:${color};flex:1" title="${label} ${val}">${val}</div>`;
    });
    html+=`<div class="funnel-row"><div class="funnel-job" title="${f.job}">${f.job}</div><div class="funnel-bars">${bars}</div></div>`;
  });
  // 범례
  html+=`<div style="margin-top:12px;font-size:11px;color:var(--mid)">`+
    `<span style="color:#CBD0D6">■</span> 총지원 · `+
    stages.map(([l,c])=>`<span style="color:${c}">■</span> ${l}`).join(' · ')+`</div>`;
  $('#funnelChart').innerHTML=html;
}

// 채용 테이블
let recFilterState='all';
function renderRecTable(reqs){
  const filters=[['all','전체'],['진행중','진행중'],['완료','완료'],['취소','취소']];
  $('#recFilter').innerHTML=filters.map(([k,l])=>`<button class="${k===recFilterState?'active':''}" data-f="${k}">${l}</button>`).join('');
  $$('#recFilter button').forEach(b=>b.onclick=()=>{ recFilterState=b.dataset.f; renderRecTable(reqs); });
  let list=recFilterState==='all'?reqs:reqs.filter(r=>r.status===recFilterState);
  const t=$('#recTable');
  t.innerHTML=`<thead><tr><th>#</th><th>그룹</th><th>팀</th><th>직무</th><th>요청일</th><th>상태</th><th>소요일</th><th>진단</th></tr></thead><tbody>${
    list.map(r=>{
      const sb={'진행중':'badge-active','완료':'badge-done','취소':'badge-cancel'}[r.status]||'';
      const db=r.diagnosis==='기간초과'?'badge-over':'badge-normal';
      return `<tr><td>${r.no}</td><td>${r.group}</td><td>${r.team}</td><td>${r.job}</td>
        <td>${fmtDate(r.reqDate)}</td><td><span class="badge ${sb}">${r.status}</span></td>
        <td>${r.days||'-'}</td><td>${r.diagnosis?`<span class="badge ${db}">${r.diagnosis}</span>`:'-'}</td></tr>`;
    }).join('')
  }</tbody>`;
}

initRecruit();
