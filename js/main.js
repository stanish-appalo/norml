/* =====================================================================
   norml. PITCH — scroll engine
   preloader · cursor · word-split · pop-in reveals · scroll-spy nav
   counters · growth chart · video sound · mobile drawer · progress
   ===================================================================== */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch  = matchMedia('(max-width: 900px)').matches;

  /* ---------- Preloader ---------- */
  function preloader(){
    const pre = document.querySelector('.pre');
    if(!pre){ document.body.classList.remove('lock'); fireHero(); return; }
    const bar = pre.querySelector('.pre__bar i');
    const pct = pre.querySelector('.js-pct');
    document.body.classList.add('lock');
    let p = 0;
    const done = () => { pre.classList.add('done'); document.body.classList.remove('lock'); fireHero(); };
    if(reduce){ if(bar) bar.style.width='100%'; done(); return; }
    const tick = () => {
      p += Math.random()*16 + 7; if(p>=100) p=100;
      if(bar) bar.style.width = p+'%';
      if(pct) pct.textContent = String(Math.floor(p)).padStart(3,'0');
      if(p<100) setTimeout(tick,110); else setTimeout(done,340);
    };
    setTimeout(tick,250);
  }

  /* ---------- Custom cursor ---------- */
  function cursor(){
    if(touch) return;
    const dot=document.querySelector('.cur-dot'), ring=document.querySelector('.cur-ring');
    if(!dot||!ring) return;
    let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my;
    addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;dot.style.transform=`translate(${mx}px,${my}px) translate(-50%,-50%)`;});
    (function loop(){rx+=(mx-rx)*.18;ry+=(my-ry)*.18;ring.style.transform=`translate(${rx}px,${ry}px) translate(-50%,-50%)`;requestAnimationFrame(loop);})();
    const sel='a,button,.card,.phone,[data-cursor]';
    document.addEventListener('mouseover',e=>{if(e.target.closest(sel)) ring.classList.add('hot');});
    document.addEventListener('mouseout',e=>{if(e.target.closest(sel)) ring.classList.remove('hot');});
  }

  /* ---------- Split words for stagger ---------- */
  function split(){
    document.querySelectorAll('[data-split]').forEach(el=>{
      const html = el.innerHTML;
      // split on spaces but keep inline markup chunks simple: operate on text words
      const words = el.textContent.trim().split(/\s+/);
      el.innerHTML = words.map(w=>`<span class="w"><span>${w}</span></span>`).join(' ');
      el.classList.add('split');
    });
  }

  /* ---------- Reveals (pop-in / split / chart) ---------- */
  function reveals(){
    const obs = new IntersectionObserver((ents)=>{
      ents.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('in'); obs.unobserve(en.target); } });
    },{threshold:.16, rootMargin:'0px 0px -8% 0px'});
    document.querySelectorAll('[data-pop],.split,.chart,[data-count]').forEach(el=>obs.observe(el));
  }
  function fireHero(){ document.querySelectorAll('[data-hero] [data-pop], [data-hero].split, [data-hero] .split').forEach(el=>el.classList.add('in')); }

  /* ---------- Counters ---------- */
  function counters(){
    const obs=new IntersectionObserver((ents)=>{
      ents.forEach(en=>{
        if(!en.isIntersecting) return;
        const el=en.target, raw=el.dataset.count, target=parseFloat(raw), dec=(raw.split('.')[1]||'').length;
        const dur=1700, t0=performance.now();
        const step=(now)=>{const k=Math.min((now-t0)/dur,1),e=1-Math.pow(1-k,3);el.textContent=(target*e).toFixed(dec);if(k<1)requestAnimationFrame(step);else el.textContent=target.toFixed(dec);};
        requestAnimationFrame(step); obs.unobserve(el);
      });
    },{threshold:.6});
    document.querySelectorAll('[data-count]').forEach(el=>obs.observe(el));
  }

  /* ---------- Scroll-spy side nav ---------- */
  function spy(){
    const links=[...document.querySelectorAll('.nav-link')];
    const map=new Map(); links.forEach(l=>{const id=l.getAttribute('href').slice(1);const s=document.getElementById(id);if(s)map.set(s,l);});
    if(!map.size) return;
    const obs=new IntersectionObserver((ents)=>{
      ents.forEach(en=>{ if(en.isIntersecting){ links.forEach(l=>l.classList.remove('active')); const l=map.get(en.target); if(l) l.classList.add('active'); } });
    },{rootMargin:'-45% 0px -45% 0px',threshold:0});
    map.forEach((l,s)=>obs.observe(s));
  }

  /* ---------- Parallax ---------- */
  function parallax(){
    if(reduce) return;
    const items=[...document.querySelectorAll('[data-parallax]')];
    if(!items.length) return;
    let t=false;
    const run=()=>{const vh=innerHeight;items.forEach(el=>{const r=el.getBoundingClientRect();const off=(r.top+r.height/2-vh/2)/vh;el.style.transform=`translate3d(0,${(-off*(parseFloat(el.dataset.parallax)||.12)*100).toFixed(1)}px,0)`;});t=false;};
    addEventListener('scroll',()=>{if(!t){requestAnimationFrame(run);t=true;}},{passive:true}); run();
  }

  /* ---------- Magnetic ---------- */
  function magnetic(){
    if(touch) return;
    document.querySelectorAll('[data-mag]').forEach(el=>{
      el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.3}px,${(e.clientY-r.top-r.height/2)*.4}px)`;});
      el.addEventListener('mouseleave',()=>el.style.transform='');
    });
  }

  /* ---------- Progress bar ---------- */
  function progress(){
    const bar=document.querySelector('.progress'); if(!bar) return;
    addEventListener('scroll',()=>{const h=document.documentElement.scrollHeight-innerHeight;bar.style.transform=`scaleX(${h>0?scrollY/h:0})`;},{passive:true});
  }

  /* ---------- Mobile drawer ---------- */
  function drawer(){
    const burger=document.querySelector('.topbar__burger'); if(!burger) return;
    const close=()=>document.body.classList.remove('menu');
    burger.addEventListener('click',()=>document.body.classList.toggle('menu'));
    document.querySelectorAll('.rail .nav-link, .rail a[href^="#"]').forEach(a=>a.addEventListener('click',close));
  }

  /* ---------- Mango video sound toggle ---------- */
  function video(){
    const v=document.querySelector('.phone__scr video'); const btn=document.querySelector('.phone__sound');
    if(!v) return;
    v.muted=true; const play=()=>{const p=v.play();if(p)p.catch(()=>{});};
    // play only when in view to save resources
    new IntersectionObserver((e)=>{e.forEach(en=>en.isIntersecting?play():v.pause());},{threshold:.3}).observe(v);
    if(btn){ btn.addEventListener('click',()=>{ v.muted=!v.muted; btn.textContent=v.muted?'🔇':'🔊'; if(!v.muted)play(); }); }
  }

  /* ---------- Smooth-scroll offset for anchor clicks ---------- */
  function anchors(){
    document.querySelectorAll('a[href^="#"]').forEach(a=>{
      a.addEventListener('click',e=>{
        const id=a.getAttribute('href'); if(id.length<2) return;
        const t=document.querySelector(id); if(!t) return;
        e.preventDefault();
        t.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
        history.replaceState(null,'',id);
      });
    });
  }

  document.addEventListener('DOMContentLoaded',()=>{
    split(); preloader(); cursor(); reveals(); counters(); spy();
    parallax(); magnetic(); progress(); drawer(); video(); anchors();
  });
})();
