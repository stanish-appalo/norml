/* =====================================================================
   norml. PITCH — "Mango Drop" motion engine (GSAP + ScrollTrigger)
   Content is visible by default; GSAP layers reveals on top, so if the
   CDN fails the page still works.
   ===================================================================== */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch  = matchMedia('(max-width: 900px)').matches;
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Preloader ---------- */
  function preloader(done){
    const pre = document.querySelector('.pre');
    if(!pre){ document.body.classList.remove('lock'); done(); return; }
    const bar = pre.querySelector('.pre__bar i'), pct = pre.querySelector('.js-pct');
    document.body.classList.add('lock');
    const finish = () => { pre.classList.add('done'); document.body.classList.remove('lock'); done(); };
    if(reduce){ if(bar) bar.style.width='100%'; finish(); return; }
    let p=0;
    (function tick(){ p+=Math.random()*16+8; if(p>=100)p=100;
      if(bar)bar.style.width=p+'%'; if(pct)pct.textContent=String(Math.floor(p)).padStart(3,'0');
      if(p<100) setTimeout(tick,100); else setTimeout(finish,360);
    })();
  }

  /* ---------- Cursor ---------- */
  function cursor(){
    if(touch) return;
    const dot=document.querySelector('.cur-dot'), ring=document.querySelector('.cur-ring');
    if(!dot||!ring) return;
    let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my;
    addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;dot.style.transform=`translate(${mx}px,${my}px) translate(-50%,-50%)`;});
    (function loop(){rx+=(mx-rx)*.18;ry+=(my-ry)*.18;ring.style.transform=`translate(${rx}px,${ry}px) translate(-50%,-50%)`;requestAnimationFrame(loop);})();
    const sel='a,button,.card,.videowrap,[data-cursor]';
    document.addEventListener('mouseover',e=>{if(e.target.closest(sel))ring.classList.add('hot');});
    document.addEventListener('mouseout',e=>{if(e.target.closest(sel))ring.classList.remove('hot');});
  }

  /* ---------- Reveals + parallax (GSAP) ---------- */
  function motion(){
    if(!hasGSAP || reduce) return;
    // group reveals per section so each section's items stagger together
    document.querySelectorAll('.section:not([data-hero])').forEach(sec=>{
      const items = sec.querySelectorAll('[data-anim]');
      if(!items.length) return;
      gsap.set(items,{opacity:0,y:46,scale:.97,filter:'blur(6px)'});
      ScrollTrigger.create({
        trigger:sec, start:'top 72%',
        onEnter:()=>gsap.to(items,{opacity:1,y:0,scale:1,filter:'blur(0px)',duration:.95,ease:'power3.out',stagger:.09,overwrite:true})
      });
    });
    // parallax
    gsap.utils.toArray('[data-parallax]').forEach(el=>{
      const amt = parseFloat(el.dataset.parallax)||40;
      gsap.fromTo(el,{y:-amt},{y:amt,ease:'none',scrollTrigger:{trigger:el.closest('.section')||el,start:'top bottom',end:'bottom top',scrub:true}});
    });
    // hero load reveal
    const heroItems=document.querySelectorAll('[data-hero] [data-anim]');
    if(heroItems.length){ gsap.set(heroItems,{opacity:0,y:40,filter:'blur(6px)'}); }
  }
  function revealHero(){
    if(!hasGSAP || reduce) return;
    const heroItems=document.querySelectorAll('[data-hero] [data-anim]');
    gsap.to(heroItems,{opacity:1,y:0,filter:'blur(0px)',duration:1,ease:'power3.out',stagger:.1});
  }

  /* ---------- Counters ---------- */
  function counters(){
    document.querySelectorAll('[data-count]').forEach(el=>{
      const target=parseFloat(el.dataset.count), dec=(el.dataset.count.split('.')[1]||'').length;
      const run=()=>{ const o={v:0}; const t0=performance.now(), dur=1700;
        (function step(now){ const k=Math.min((now-t0)/dur,1), e=1-Math.pow(1-k,3); el.textContent=(target*e).toFixed(dec); if(k<1)requestAnimationFrame(step); else el.textContent=target.toFixed(dec); })(t0);
      };
      if(hasGSAP){ ScrollTrigger.create({trigger:el,start:'top 88%',once:true,onEnter:run}); }
      else { new IntersectionObserver((en,o)=>{en.forEach(x=>{if(x.isIntersecting){run();o.disconnect();}});},{threshold:.6}).observe(el); }
    });
  }

  /* ---------- Growth chart draw ---------- */
  function chart(){
    const path=document.querySelector('.chart path.line'); if(!path) return;
    const len=path.getTotalLength();
    path.style.strokeDasharray=len; path.style.strokeDashoffset=len;
    const area=document.querySelector('.chart path.area'); if(area) area.style.opacity=0;
    const draw=()=>{
      if(hasGSAP){ gsap.to(path,{strokeDashoffset:0,duration:2.2,ease:'power2.out'}); if(area)gsap.to(area,{opacity:1,duration:1,delay:.9}); }
      else { path.style.transition='stroke-dashoffset 2.2s ease'; path.style.strokeDashoffset=0; if(area){area.style.transition='opacity 1s ease .9s';area.style.opacity=1;} }
    };
    if(hasGSAP){ ScrollTrigger.create({trigger:path,start:'top 80%',once:true,onEnter:draw}); }
    else { new IntersectionObserver((en,o)=>{en.forEach(x=>{if(x.isIntersecting){draw();o.disconnect();}});},{threshold:.4}).observe(path); }
  }

  /* ---------- Side-nav scroll-spy ---------- */
  function spy(){
    const links=[...document.querySelectorAll('.nav-link')];
    const map=new Map(); links.forEach(l=>{const s=document.getElementById(l.getAttribute('href').slice(1));if(s)map.set(s,l);});
    if(!map.size) return;
    const set=l=>{links.forEach(x=>x.classList.remove('active'));l&&l.classList.add('active');};
    if(hasGSAP){ map.forEach((l,s)=>ScrollTrigger.create({trigger:s,start:'top 50%',end:'bottom 50%',onToggle:e=>{if(e.isActive)set(l);}})); }
    else { new IntersectionObserver(en=>en.forEach(e=>{if(e.isIntersecting)set(map.get(e.target));}),{rootMargin:'-45% 0px -45% 0px'}).forEach?0:0;
      const io=new IntersectionObserver(en=>en.forEach(e=>{if(e.isIntersecting)set(map.get(e.target));}),{rootMargin:'-45% 0px -45% 0px'}); map.forEach((l,s)=>io.observe(s)); }
  }

  /* ---------- Video: autoplay + sound ---------- */
  function video(){
    const v=document.querySelector('.videowrap video'); if(!v) return;
    const btn=document.querySelector('.v-sound');
    v.muted=true; v.setAttribute('playsinline','');
    const tryPlay=()=>{const p=v.play();if(p&&p.catch)p.catch(()=>{});};
    tryPlay();
    new IntersectionObserver(en=>en.forEach(e=>e.isIntersecting?tryPlay():v.pause()),{threshold:.25}).observe(v);
    if(btn) btn.addEventListener('click',()=>{ v.muted=!v.muted; btn.textContent=v.muted?'🔇':'🔊'; if(!v.muted)tryPlay(); });
  }

  /* ---------- Progress ---------- */
  function progress(){ const bar=document.querySelector('.progress'); if(!bar)return;
    addEventListener('scroll',()=>{const h=document.documentElement.scrollHeight-innerHeight;bar.style.transform=`scaleX(${h>0?scrollY/h:0})`;},{passive:true}); }

  /* ---------- Magnetic ---------- */
  function magnetic(){ if(touch)return;
    document.querySelectorAll('[data-mag]').forEach(el=>{
      el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.3}px,${(e.clientY-r.top-r.height/2)*.4}px)`;});
      el.addEventListener('mouseleave',()=>el.style.transform='');
    });
  }

  /* ---------- Mobile drawer ---------- */
  function drawer(){ const b=document.querySelector('.topbar__burger'); if(!b)return;
    b.addEventListener('click',()=>document.body.classList.toggle('menu'));
    document.querySelectorAll('.rail a[href^="#"]').forEach(a=>a.addEventListener('click',()=>document.body.classList.remove('menu')));
  }

  /* ---------- Anchor smooth scroll ---------- */
  function anchors(){
    document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
      const id=a.getAttribute('href'); if(id.length<2)return; const t=document.querySelector(id); if(!t)return;
      e.preventDefault(); t.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'}); history.replaceState(null,'',id);
    }));
  }

  document.addEventListener('DOMContentLoaded',()=>{
    cursor(); motion(); counters(); chart(); spy(); video(); progress(); magnetic(); drawer(); anchors();
    preloader(()=>{ revealHero(); if(hasGSAP) ScrollTrigger.refresh(); });
  });
})();
