/* Neon Drift Pilot Operations — additive progression module */
(() => {
  'use strict';
  const KEY = 'neonDriftOperationsV1';
  const $ = (id) => document.getElementById(id);
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (_) { return {}; } };
  const state = Object.assign({ xp: 0, credits: 0, claimed: [], completed: [], records: [], season: 1 }, load());
  const missions = [
    { id:'first-flight', title:'First Flight', desc:'Complete a run.', goal:1, reward:80, xp:35, type:'runs' },
    { id:'core-route', title:'Core Route', desc:'Collect 5 energy cores in total.', goal:5, reward:120, xp:50, type:'cores' },
    { id:'survivor', title:'Stay In The Fight', desc:'Survive for 90 seconds in one run.', goal:90, reward:150, xp:65, type:'seconds' },
    { id:'score-chaser', title:'Score Chaser', desc:'Reach a score of 1,500 in one run.', goal:1500, reward:180, xp:80, type:'score' }
  ];
  const tiers = [
    ['Flight Tag','A pilot profile title',0], ['80 Credits','Hangar currency',80],
    ['Violet Signal','A cosmetic signal color',160], ['150 Credits','Hangar currency',240],
    ['Elite Pilot Frame','A profile frame',340], ['250 Credits','Hangar currency',460],
    ['Prism Signal','A cosmetic signal color',600], ['500 Credits','Hangar currency',780]
  ];
  function save(){ localStorage.setItem(KEY, JSON.stringify(state)); }
  function ensureUI(){
    if ($('operationsPanel')) return;
    const style = document.createElement('style');
    style.textContent = `
      .ops-launch{display:flex;gap:9px;flex-wrap:wrap;margin-top:14px}
      .ops-launch button{background:linear-gradient(120deg,#172b42,#241638);border:1px solid #41658a;box-shadow:none}
      .ops-panel{position:fixed;inset:0;z-index:10020;background:#030611df;backdrop-filter:blur(12px);display:none;place-items:center;padding:14px}
      .ops-panel.open{display:grid}.ops-window{width:min(920px,100%);max-height:min(88vh,850px);overflow:auto;border:1px solid #426080;border-radius:20px;background:linear-gradient(145deg,#111d30,#0a0e1b);box-shadow:0 25px 90px #000c;padding:clamp(16px,3vw,28px)}
      .ops-head{display:flex;justify-content:space-between;align-items:center;gap:12px}.ops-head h2{margin:0;font-size:clamp(20px,4vw,30px);letter-spacing:.06em}.ops-sub{color:#93aac4;font-size:12px;line-height:1.6}
      .ops-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:17px}
      .ops-card{padding:14px;border:1px solid #2b4564;border-radius:13px;background:#0b1525;min-width:0}.ops-card h3{font-size:12px;letter-spacing:.12em;margin:0 0 8px;color:#c9eaff}.ops-card p{font-size:11px;color:#9db0c7;line-height:1.5;margin:0 0 10px}
      .ops-track{height:7px;border-radius:20px;background:#1d2a3d;overflow:hidden;margin:10px 0}.ops-track i{display:block;height:100%;background:linear-gradient(90deg,#a855f7,#39e6ff);border-radius:20px}
      .ops-meta{display:flex;justify-content:space-between;gap:8px;color:#9eb5cf;font-size:10px}.ops-card button{padding:8px 11px;font-size:10px;box-shadow:none}
      .ops-tier{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:10px 0;border-bottom:1px solid #263b55;font-size:11px;color:#d7e7f7}.ops-tier small{display:block;color:#8198b3;margin-top:3px}.ops-tier button{padding:7px 9px;font-size:9px}
      .ops-badge{display:inline-block;padding:4px 7px;border:1px solid #31536a;border-radius:20px;color:#80f3d4;font-size:9px}
      @media(max-width:600px){.ops-grid{grid-template-columns:1fr}.ops-window{max-height:92vh}.ops-head{align-items:flex-start}}
    `;
    document.head.append(style);
    const panel=document.createElement('section'); panel.id='operationsPanel'; panel.className='ops-panel'; panel.setAttribute('aria-hidden','true');
    panel.innerHTML='<div class="ops-window" role="dialog" aria-modal="true" aria-labelledby="opsTitle"><div class="ops-head"><div><div class="intro-kicker">PILOT COMMAND / PROGRESSION</div><h2 id="opsTitle">OPERATIONS CENTER</h2><p class="ops-sub">Your missions, seasonal rewards and flight records.</p></div><button id="opsClose" type="button">CLOSE</button></div><div class="ops-grid"><article class="ops-card"><h3>ACTIVE CONTRACTS</h3><div id="opsMissions"></div></article><article class="ops-card"><h3>SEASON TRACK</h3><p>Earn operation XP by completing contracts. Rewards are claimed here and saved on this device.</p><div class="ops-meta"><b id="opsLevel">TIER 1</b><span id="opsXP">0 XP</span></div><div class="ops-track"><i id="opsProgress"></i></div><div id="opsTiers"></div></article><article class="ops-card"><h3>FLIGHT RECORDS</h3><div id="opsRecords" class="ops-sub">No operation records yet. Finish a run to create your first record.</div></article><article class="ops-card"><h3>DAILY DISPATCH</h3><p>Claim one dispatch reward each day you visit. Your next claim becomes available on the next local calendar day.</p><div class="ops-meta"><span id="opsDailyStatus">AVAILABLE</span><b>+50 XP · +100 CREDITS</b></div><button id="opsDailyClaim" type="button">CLAIM DAILY DISPATCH</button></article><article class="ops-card"><h3>CAREER MILESTONES</h3><div id="opsMilestones" class="ops-sub"></div></article><article class="ops-card"><h3>PILOT PROFILE</h3><p>Operation XP and credits are tracked separately from your existing pilot progression, so this update does not overwrite your current save.</p><div class="ops-meta"><span>OPERATION XP</span><b id="opsTotalXP">0</b></div><div class="ops-meta"><span>UNCLAIMED CONTRACTS</span><b id="opsPending">4</b></div></article></div></div>';
    document.body.append(panel);
    const launch=document.createElement('div'); launch.className='ops-launch';
    launch.innerHTML='<button id="opsOpen" type="button">▦ OPERATIONS CENTER</button>';
    const target=$('gameLobby') || document.querySelector('.app');
    if(target) target.append(launch);
    $('opsOpen').addEventListener('click',open); $('opsClose').addEventListener('click',close); $('opsDailyClaim').addEventListener('click',claimDaily);
    panel.addEventListener('click',e=>{if(e.target===panel)close()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  }
  function open(){ render(); $('operationsPanel').classList.add('open'); $('operationsPanel').setAttribute('aria-hidden','false'); }
  function close(){ $('operationsPanel').classList.remove('open'); $('operationsPanel').setAttribute('aria-hidden','true'); }
  function progress(m){
    const raw=state.records.reduce((n,r)=>n+(m.type==='runs'?1:m.type==='cores'?r.cores||0:m.type==='seconds'?r.seconds||0:r.score||0),0);
    return Math.min(m.goal,raw);
  }
  function localDay(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
  function claimDaily(){const today=localDay();if(state.dailyClaim===today)return;state.dailyClaim=today;state.xp+=50;state.credits+=100;save();render();announce('DAILY DISPATCH CLAIMED · +100 CREDITS')}
  function render(){
    $('opsMissions').innerHTML=missions.map(m=>{
      const n=progress(m),done=n>=m.goal,claimed=state.claimed.includes(m.id);
      return '<div class="ops-tier"><div><b>'+m.title+'</b><small>'+m.desc+' · '+n+'/'+m.goal+'</small><div class="ops-track"><i style="width:'+Math.round(n/m.goal*100)+'%"></i></div></div><button data-claim="'+m.id+'" '+(!done||claimed?'disabled':'')+'>'+ (claimed?'CLAIMED':done?'CLAIM':'IN PROGRESS')+'</button></div>';
    }).join('');
    $('opsMissions').querySelectorAll('[data-claim]').forEach(b=>b.addEventListener('click',()=>claim(b.dataset.claim)));
    const xp=state.xp, tier=Math.min(tiers.length,1+Math.floor(xp/100));
    $('opsLevel').textContent='TIER '+tier+' / '+tiers.length; $('opsXP').textContent=xp+' XP';
    $('opsTotalXP').textContent=xp; $('opsPending').textContent=missions.filter(m=>progress(m)>=m.goal&&!state.claimed.includes(m.id)).length;
    $('opsProgress').style.width=(tier===tiers.length?100:xp%100)+'%';
    $('opsTiers').innerHTML=tiers.map((t,i)=>'<div class="ops-tier"><div><b>'+String(i+1).padStart(2,'0')+' · '+t[0]+'</b><small>'+t[1]+' · '+t[2]+' XP</small></div><span class="ops-badge">'+(xp>=t[2]?'UNLOCKED':'LOCKED')+'</span></div>').join('');
    const dailyReady=state.dailyClaim!==localDay();$('opsDailyStatus').textContent=dailyReady?'AVAILABLE TODAY':'CLAIMED TODAY';$('opsDailyClaim').disabled=!dailyReady;$('opsDailyClaim').textContent=dailyReady?'CLAIM DAILY DISPATCH':'COME BACK TOMORROW';
    let career={runs:0,totalScore:0,totalCores:0,totalSeconds:0};try{career=Object.assign(career,JSON.parse(localStorage.getItem('neonDriftCareerStatsV1')||'{}'))}catch(_){}
    const milestones=[['Rookie Pilot',(career.runs||0)>=1,'Complete your first run'],['Core Collector',(career.totalCores||0)>=50,'Collect 50 lifetime cores'],['Deep Space',(career.totalSeconds||0)>=600,'Survive 10 lifetime minutes'],['Score Architect',(career.totalScore||0)>=10000,'Earn 10,000 lifetime points'],['Veteran',(career.runs||0)>=25,'Complete 25 runs']];
    $('opsMilestones').innerHTML=milestones.map(m=>'<div class="ops-tier"><div><b>'+m[0]+'</b><small>'+m[2]+'</small></div><span class="ops-badge">'+(m[1]?'EARNED':'LOCKED')+'</span></div>').join('');
    $('opsRecords').innerHTML=state.records.length?state.records.slice(-5).reverse().map(r=>'<div class="ops-tier"><div><b>RUN '+r.score.toLocaleString()+'</b><small>'+r.cores+' cores · '+r.seconds+' sec · '+new Date(r.at).toLocaleDateString()+'</small></div><span class="ops-badge">LOGGED</span></div>').join(''):'No operation records yet. Finish a run to create your first record.';
  }
  function claim(id){const m=missions.find(x=>x.id===id);if(!m||state.claimed.includes(id)||progress(m)<m.goal)return;state.claimed.push(id);state.xp+=m.xp;state.credits+=m.reward;save();render();announce('CONTRACT COMPLETE · +'+m.reward+' CREDITS');}
  function announce(message){const toast=$('toast');if(toast){toast.textContent=message;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2200);}}
  function recordRun(){
    const score=Number($('score')?.textContent?.replace(/,/g,''))||0;
    let career={totalCores:0,totalSeconds:0};try{career=Object.assign(career,JSON.parse(localStorage.getItem('neonDriftCareerStatsV1')||'{}'))}catch(_){}
    const previous=state.records[state.records.length-1]||{careerCores:0,careerSeconds:0};
    const cores=Math.max(0,(career.totalCores||0)-(previous.careerCores||0));
    const seconds=Math.max(0,(career.totalSeconds||0)-(previous.careerSeconds||0));
    state.records.push({score,cores,seconds,careerCores:career.totalCores||0,careerSeconds:career.totalSeconds||0,at:Date.now()});state.records=state.records.slice(-40);save();
    if($('operationsPanel')?.classList.contains('open'))render();
  }
  function hook(){
    // Record only when the game confirms a completed run. Listening to the
    // restart button used to count the previous run a second time on replay.
    window.addEventListener('neondrift:run-finished', recordRun);
  }
  function boot(){ensureUI();render();hook();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
