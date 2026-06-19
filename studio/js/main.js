/* =====================================================================
   norml. STUDIO — Lenis + GSAP + Three.js
   ===================================================================== */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch  = matchMedia('(max-width: 900px)').matches;
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);
  const hasThree = !!window.THREE;
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  /* ===== Lenis smooth scroll (synced to GSAP) ===== */
  let lenis = null;
  function smooth(){
    if (reduce || !window.Lenis) return;
    lenis = new Lenis({ lerp:0.1, wheelMultiplier:1, smoothWheel:true });
    if (hasGSAP){
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t*1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  const scrollTo = (target) => {
    if (lenis) lenis.scrollTo(target, { offset:0, duration:1.4 });
    else document.querySelector(target)?.scrollIntoView({behavior:reduce?'auto':'smooth'});
  };

  /* ===== Cursor ===== */
  function cursor(){
    if (touch) return;
    const c = document.querySelector('.cur'); if(!c) return;
    let x=innerWidth/2,y=innerHeight/2,cx=x,cy=y;
    addEventListener('mousemove',e=>{x=e.clientX;y=e.clientY;});
    (function loop(){cx+=(x-cx)*.2;cy+=(y-cy)*.2;c.style.transform=`translate(${cx}px,${cy}px) translate(-50%,-50%)`;requestAnimationFrame(loop);})();
    addEventListener('mouseover',e=>{
      const t=e.target.closest('[data-cursor],a,button,.work-media');
      if(!t){c.classList.remove('big','lbl');return;}
      const l=t.getAttribute('data-cursor');
      if(l){c.classList.add('big','lbl');c.setAttribute('data-l',l);} else c.classList.add('big');
    });
    addEventListener('mouseout',e=>{ if(e.target.closest('[data-cursor],a,button,.work-media')) c.classList.remove('big','lbl'); });
  }

  /* ===== Three.js morphing blob ===== */
  function blob(){
    const canvas = document.getElementById('gl');
    if(!canvas || !hasThree) return;
    const T = window.THREE;
    const renderer = new T.WebGLRenderer({canvas, alpha:true, antialias:true});
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    const scene = new T.Scene();
    const cam = new T.PerspectiveCamera(42, innerWidth/innerHeight, .1, 100);
    cam.position.z = 3.4;

    const snoise = `
    vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x,289.0);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
    float snoise(vec3 v){
      const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
      vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
      vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
      vec3 x1=x0-i1+1.0*C.xxx;vec3 x2=x0-i2+2.0*C.xxx;vec3 x3=x0-1.0+3.0*C.xxx;
      i=mod(i,289.0);
      vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
      float n_=1.0/7.0;vec3 ns=n_*D.wyz-D.xzx;
      vec4 j=p-49.0*floor(p*ns.z*ns.z);
      vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
      vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
      vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
      vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
      vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
      vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
      vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
      p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
      vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
      return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
    }`;

    const uniforms = {
      uTime:{value:0}, uAmp:{value:0.22}, uMouse:{value:new T.Vector2(0,0)},
      uC1:{value:new T.Color(0xf0531a)}, uC2:{value:new T.Color(0xffc24b)}, uC3:{value:new T.Color(0xfff6e6)}
    };
    const mat = new T.ShaderMaterial({
      uniforms,
      vertexShader:`
        uniform float uTime; uniform float uAmp; uniform vec2 uMouse;
        varying vec3 vN; varying vec3 vP; varying float vD;
        ${snoise}
        float disp(vec3 p){ return (snoise(p*1.05+uTime*0.22+vec3(uMouse*0.6,0.0))*0.62 + snoise(p*2.2-uTime*0.16)*0.38)*uAmp; }
        void main(){
          vec3 p=position; float d=disp(p); vec3 dp=p+normal*d; vD=d;
          vec3 tg=normalize(cross(normal,vec3(0.0,1.0,0.0))+1e-4);
          vec3 bt=normalize(cross(normal,tg)); float e=0.22;
          vec3 a=(p+tg*e); a+=normal*disp(a);
          vec3 b=(p+bt*e); b+=normal*disp(b);
          vec3 nn=normalize(cross(a-dp,b-dp));
          vN=normalize(normalMatrix*nn);
          vec4 mv=modelViewMatrix*vec4(dp,1.0); vP=mv.xyz;
          gl_Position=projectionMatrix*mv;
        }`,
      fragmentShader:`
        precision highp float;
        uniform float uTime; uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uC3;
        varying vec3 vN; varying vec3 vP; varying float vD;
        void main(){
          vec3 N=normalize(vN); vec3 V=normalize(-vP);
          float fres=pow(1.0-max(dot(N,V),0.0),2.3);
          vec3 base=mix(uC1,uC2,smoothstep(-0.35,0.5,vD));
          float irid=0.5+0.5*sin(vD*9.0+uTime*0.7+vP.y*2.2);
          vec3 col=mix(base,uC3,fres*0.85);
          col+=irid*0.06;
          float lite=0.5+0.5*N.y;
          col*=0.74+lite*0.4;
          gl_FragColor=vec4(col,1.0);
        }`
    });

    const detail = touch ? 14 : 40;
    const geo = new T.IcosahedronGeometry(1.18, detail);
    const mesh = new T.Mesh(geo, mat);
    scene.add(mesh);

    function place(){ mesh.position.x = innerWidth>900 ? 0.45 : 0; mesh.scale.setScalar(innerWidth>900 ? 1 : 0.8); }
    place();

    const mouse = {x:0,y:0,tx:0,ty:0};
    addEventListener('mousemove',e=>{ mouse.tx=(e.clientX/innerWidth)*2-1; mouse.ty=-((e.clientY/innerHeight)*2-1); });
    let scrollAmp=0;
    addEventListener('scroll',()=>{ scrollAmp = Math.min(scrollY/innerHeight,1); }, {passive:true});

    function resize(){ cam.aspect=innerWidth/innerHeight; cam.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight); place(); }
    resize(); addEventListener('resize',resize);

    const clock = new T.Clock();
    (function render(){
      requestAnimationFrame(render);
      if (scrollY > innerHeight*1.15) return;           // pause when hero off-screen
      const dt = clock.getDelta();
      uniforms.uTime.value += dt;
      mouse.x += (mouse.tx-mouse.x)*0.05; mouse.y += (mouse.ty-mouse.y)*0.05;
      uniforms.uMouse.value.set(mouse.x, mouse.y);
      uniforms.uAmp.value = 0.2 + scrollAmp*0.34 + Math.abs(mouse.x)*0.05;
      mesh.rotation.y += dt*0.15 + mouse.x*dt*0.6;
      mesh.rotation.x = mouse.y*0.4 + scrollAmp*0.5;
      mesh.position.y = -scrollAmp*1.2;
      renderer.render(scene,cam);
    })();
  }

  /* ===== Reveals + parallax ===== */
  function reveals(){
    if(!hasGSAP) return;
    // generic fade-up
    gsap.utils.toArray('[data-fade]').forEach(el=>{
      gsap.from(el,{y:parseFloat(el.dataset.fade)||44,opacity:0,duration:1,ease:'power3.out',
        scrollTrigger:{trigger:el,start:'top 86%'}});
    });
    // line masks
    gsap.utils.toArray('.r-line').forEach(line=>{
      const inner=line.children[0]; if(!inner) return;
      gsap.set(inner,{yPercent:110});
      ScrollTrigger.create({trigger:line,start:'top 90%',onEnter:()=>gsap.to(inner,{yPercent:0,duration:1.05,ease:'power4.out'})});
    });
    // parallax
    gsap.utils.toArray('[data-para]').forEach(el=>{
      gsap.to(el,{yPercent:parseFloat(el.dataset.para)||-12,ease:'none',
        scrollTrigger:{trigger:el.closest('section')||el,start:'top bottom',end:'bottom top',scrub:true}});
    });
    // work media reveal (uncover)
    gsap.utils.toArray('.work-media').forEach(m=>{
      ScrollTrigger.create({trigger:m,start:'top 82%',onEnter:()=>m.classList.add('in')});
    });
  }

  /* ===== Horizontal scroll (services) ===== */
  function horizontal(){
    if(!hasGSAP || innerWidth<=900) return;
    const sec=document.querySelector('.hsec'); const track=document.querySelector('.htrack');
    if(!sec||!track) return;
    const dist=()=> track.scrollWidth - innerWidth + 1;
    gsap.to(track,{x:()=>-dist(),ease:'none',
      scrollTrigger:{trigger:sec,start:'top top',end:()=>'+='+dist(),scrub:1,pin:true,anticipatePin:1,invalidateOnRefresh:true}});
  }

  /* ===== Counters ===== */
  function counters(){
    document.querySelectorAll('[data-count]').forEach(el=>{
      const target=parseFloat(el.dataset.count), dec=(el.dataset.count.split('.')[1]||'').length;
      const run=()=>{const t0=performance.now(),dur=1700;(function s(n){const k=Math.min((n-t0)/dur,1),e=1-Math.pow(1-k,3);el.textContent=(target*e).toFixed(dec);if(k<1)requestAnimationFrame(s);else el.textContent=target.toFixed(dec);})(t0);};
      if(hasGSAP) ScrollTrigger.create({trigger:el,start:'top 90%',once:true,onEnter:run});
      else new IntersectionObserver((en,o)=>en.forEach(x=>{if(x.isIntersecting){run();o.disconnect();}}),{threshold:.6}).observe(el);
    });
  }

  /* ===== Chart ===== */
  function chart(){
    const path=document.querySelector('.chart path.line'); if(!path) return;
    const len=path.getTotalLength(); path.style.strokeDasharray=len; path.style.strokeDashoffset=len;
    const area=document.querySelector('.chart path.area'); if(area) area.style.opacity=0;
    const draw=()=>{ if(hasGSAP){gsap.to(path,{strokeDashoffset:0,duration:2.2,ease:'power2.out'});if(area)gsap.to(area,{opacity:1,duration:1,delay:.9});}
      else {path.style.transition='stroke-dashoffset 2.2s ease';path.style.strokeDashoffset=0;if(area){area.style.transition='opacity 1s .9s';area.style.opacity=1;}} };
    if(hasGSAP) ScrollTrigger.create({trigger:path,start:'top 82%',once:true,onEnter:draw});
    else new IntersectionObserver((en,o)=>en.forEach(x=>{if(x.isIntersecting){draw();o.disconnect();}}),{threshold:.4}).observe(path);
  }

  /* ===== Marquee (infinite) ===== */
  function marquee(){
    document.querySelectorAll('.marq').forEach(m=>{
      const t=m.querySelector('.marq__t'); if(!t||!hasGSAP) return;
      const clone=t.cloneNode(true); m.appendChild(clone);
      const w=t.scrollWidth+40;
      gsap.to([t,clone],{x:`-=${w}`,ease:'none',duration:w/90,repeat:-1,modifiers:{x:gsap.utils.unitize(x=>parseFloat(x)%w)}});
    });
  }

  /* ===== Video ===== */
  function video(){
    const v=document.querySelector('.zoom__screen video'); if(!v) return;
    v.muted=true; v.setAttribute('playsinline','');
    const p=()=>{const q=v.play();if(q&&q.catch)q.catch(()=>{});}; p();
    new IntersectionObserver(e=>e.forEach(x=>x.isIntersecting?p():v.pause()),{threshold:.05}).observe(v);
    const b=document.querySelector('.zoom__device .snd');
    if(b) b.addEventListener('click',e=>{e.stopPropagation();v.muted=!v.muted;b.textContent=v.muted?'🔇':'🔊';if(!v.muted)p();});
  }

  /* ===== Scroll-into-screen (zoom) ===== */
  function zoomScreen(){
    if(!hasGSAP) return;
    const sec=document.querySelector('.zoom'); const dev=document.querySelector('.zoom__device');
    if(!sec||!dev) return;
    const target=()=> Math.max(innerWidth/dev.offsetWidth, innerHeight/dev.offsetHeight)*1.18;
    const tl=gsap.timeline({scrollTrigger:{trigger:sec,start:'top top',end:'bottom bottom',scrub:1,invalidateOnRefresh:true}});
    tl.to(dev,{scale:()=>target(),ease:'power1.inOut'},0)
      .to(['.zoom__frame','.zoom__notch'],{opacity:0,ease:'none'},0)
      .to('.zoom__lead',{opacity:0,yPercent:-30,ease:'none'},0)
      .fromTo('.zoom__cap',{opacity:0},{opacity:1,ease:'none'},0.5);
  }

  /* ===== Progress + magnetic + anchors ===== */
  function progress(){const bar=document.querySelector('.prog');if(!bar)return;const upd=()=>{const h=document.documentElement.scrollHeight-innerHeight;bar.style.transform=`scaleX(${h>0?scrollY/h:0})`;};upd();addEventListener('scroll',upd,{passive:true});}
  function magnetic(){if(touch)return;document.querySelectorAll('[data-mag]').forEach(el=>{el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.3}px,${(e.clientY-r.top-r.height/2)*.4}px)`;});el.addEventListener('mouseleave',()=>el.style.transform='');});}
  function anchors(){document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const id=a.getAttribute('href');if(id.length<2)return;if(!document.querySelector(id))return;e.preventDefault();scrollTo(id);}));}

  /* ===== Preloader ===== */
  function preloader(done){
    const pre=document.querySelector('.pre');
    if(!pre){done();return;}
    if(lenis) lenis.stop();
    const bar=pre.querySelector('.pre__bar'), pct=pre.querySelector('.pre__pct'), word=pre.querySelector('.pre__n b');
    if(hasGSAP) gsap.to(word,{yPercent:0,duration:.9,ease:'power3.out',delay:.1});
    let p=0;
    const finish=()=>{
      if(hasGSAP){
        gsap.to(pre,{yPercent:-100,duration:1,ease:'power4.inOut',delay:.2,onStart:()=>{word&&gsap.to(word,{yPercent:-110,duration:.6,ease:'power3.in'});},onComplete:()=>{pre.remove();if(lenis)lenis.start();done();}});
      } else { pre.remove(); if(lenis)lenis.start(); done(); }
    };
    if(reduce){ if(bar)bar.style.width='100%'; finish(); return; }
    (function tick(){ p+=Math.random()*14+7; if(p>=100)p=100;
      if(bar)bar.style.width=p+'%'; if(pct)pct.textContent=String(Math.floor(p)).padStart(3,'0')+' / 100';
      if(p<100)setTimeout(tick,110); else setTimeout(finish,360);
    })();
  }

  /* ===== Hero intro reveal ===== */
  function heroIn(){
    if(!hasGSAP) return;
    const lines=document.querySelectorAll('.hero .r-line>*');
    gsap.set(lines,{yPercent:110});
    gsap.to(lines,{yPercent:0,duration:1.1,ease:'power4.out',stagger:.09});
    gsap.from('[data-hero-fade]',{opacity:0,y:20,duration:1,ease:'power2.out',stagger:.1,delay:.3});
  }

  document.addEventListener('DOMContentLoaded',()=>{
    smooth(); cursor(); blob(); reveals(); horizontal(); zoomScreen(); counters(); chart(); marquee(); video(); progress(); magnetic(); anchors();
    preloader(()=>{ heroIn(); if(hasGSAP) ScrollTrigger.refresh(); });
  });
})();
