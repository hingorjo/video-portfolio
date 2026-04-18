import { useState, useEffect, useRef } from "react";

// ─── Storage ───────────────────────────────────────────────────────────────
const db = {
  async get(key, fallback) {
    try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; }
    catch { return fallback; }
  },
  async set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }
};

// ─── Helpers ───────────────────────────────────────────────────────────────
const getEmbedUrl = url => {
  if (!url) return '';
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vi = url.match(/vimeo\.com\/(\d+)/);
  if (vi) return `https://player.vimeo.com/video/${vi[1]}`;
  return url;
};
const getThumb = url => {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/);
  return yt ? `https://img.youtube.com/vi/${yt[1]}/maxresdefault.jpg` : null;
};

// ─── Defaults ──────────────────────────────────────────────────────────────
const DEF_PROFILE = {
  name: "Alex Rivera", title: "Video Editor & Colorist",
  tagline: "Crafting Cinematic\nStories Frame\nBy Frame.",
  bio: "7+ years of post-production expertise delivering world-class edits for global brands, independent filmmakers, and digital creators. Every cut is deliberate. Every color tells a story.",
  email: "hello@alexrivera.com", instagram: "@alexrivera", available: true,
  stats: [{ value:"7+", label:"Years Exp." },{ value:"120+", label:"Projects" },{ value:"45+", label:"Clients" },{ value:"12", label:"Awards" }]
};
const DEF_PROJECTS = [
  { id:1, title:"Nike — Just Run", category:"Commercial", videoUrl:"", desc:"Brand film for Nike's Asia-Pacific campaign. Shot across 4 cities." },
  { id:2, title:"The Last Light", category:"Short Film", videoUrl:"", desc:"Award-winning 12-minute drama. Festival circuit 2023." },
  { id:3, title:"Midnight Circuit", category:"Music Video", videoUrl:"", desc:"High-energy music video for electronic artist Sable." },
  { id:4, title:"Terra — Wanderlust", category:"Documentary", videoUrl:"", desc:"4-part travel documentary series across Southeast Asia." },
  { id:5, title:"Vogue — SS24", category:"Fashion", videoUrl:"", desc:"Editorial fashion film for Vogue's Spring/Summer 2024 issue." },
  { id:6, title:"Bloom Wedding Films", category:"Wedding", videoUrl:"", desc:"Luxury destination wedding in Tuscany, Italy." },
];
const DEF_SERVICES = [
  { id:1, icon:"✂", title:"Video Editing", desc:"Narrative-driven cuts with perfect pacing for any format — long-form to Reels." },
  { id:2, icon:"◈", title:"Color Grading", desc:"Cinematic color science, custom LUT creation, and film emulation for a signature look." },
  { id:3, icon:"◉", title:"Motion Graphics", desc:"Custom animated titles, lower thirds, kinetic text, and seamless visual effects." },
  { id:4, icon:"♫", title:"Sound Design", desc:"Audio mixing, SFX layering, foley integration, and music synchronization." },
];

const C = {
  bg:'#080808', surface:'#111', surface2:'#191919', surface3:'#222',
  accent:'#f5a623', accentDim:'rgba(245,166,35,0.1)',
  text:'#f0ede6', textMuted:'#888', textDim:'#444',
  border:'rgba(255,255,255,0.07)', borderHover:'rgba(255,255,255,0.15)',
};
const OWNER_PASSWORD = "editor2024";

// ─── Global Styles ─────────────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth}
    body{cursor:none!important;overflow-x:hidden}
    *{cursor:none!important}
    ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:${C.bg}}::-webkit-scrollbar-thumb{background:${C.surface3};border-radius:2px}
    .dp{font-family:'Bebas Neue',sans-serif;letter-spacing:0.02em}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
    @keyframes rotateSlow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
    @keyframes shakeX{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
    @keyframes scaleIn{from{opacity:0;transform:scale(0.93)}to{opacity:1;transform:scale(1)}}
    @keyframes scrollDot{0%{transform:translateY(0);opacity:1}100%{transform:translateY(16px);opacity:0}}
    .reveal{opacity:0;transform:translateY(36px);transition:opacity 0.8s cubic-bezier(0.16,1,0.3,1),transform 0.8s cubic-bezier(0.16,1,0.3,1)}
    .reveal.visible{opacity:1;transform:translateY(0)}
    .reveal-left{opacity:0;transform:translateX(-40px);transition:opacity 0.8s cubic-bezier(0.16,1,0.3,1),transform 0.8s cubic-bezier(0.16,1,0.3,1)}
    .reveal-left.visible{opacity:1;transform:translateX(0)}
    .reveal-right{opacity:0;transform:translateX(40px);transition:opacity 0.8s cubic-bezier(0.16,1,0.3,1),transform 0.8s cubic-bezier(0.16,1,0.3,1)}
    .reveal-right.visible{opacity:1;transform:translateX(0)}
    .s1{transition-delay:0.05s!important}.s2{transition-delay:0.12s!important}.s3{transition-delay:0.19s!important}
    .s4{transition-delay:0.26s!important}.s5{transition-delay:0.33s!important}.s6{transition-delay:0.40s!important}
    .vc{transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1),border-color 0.25s,box-shadow 0.35s}
    .vc:hover{transform:translateY(-8px)!important;box-shadow:0 28px 56px rgba(0,0,0,0.55),0 0 0 1px rgba(245,166,35,0.18)!important}
    .vc:hover .vthumb{transform:scale(1.08)!important}
    .vc:hover .vplay{transform:scale(1.2)!important}
    .vc:hover .vtitle{color:${C.accent}!important}
    .nav-link{position:relative}
    .nav-link::after{content:'';position:absolute;bottom:-3px;left:0;width:0;height:1px;background:${C.accent};transition:width 0.3s ease}
    .nav-link:hover::after{width:100%}
    .hire-btn{transition:all 0.28s cubic-bezier(0.34,1.56,0.64,1)!important}
    .hire-btn:hover{transform:scale(1.08)!important;box-shadow:0 8px 28px rgba(245,166,35,0.38)!important}
    .cta-btn{position:relative;overflow:hidden;transition:all 0.3s ease!important;display:inline-block}
    .cta-btn::before{content:'';position:absolute;inset:0;background:rgba(255,255,255,0.1);transform:translateX(-101%);transition:transform 0.4s cubic-bezier(0.16,1,0.3,1)}
    .cta-btn:hover::before{transform:translateX(0)}
    .cta-btn:hover{transform:translateY(-3px)!important;box-shadow:0 14px 36px rgba(245,166,35,0.42)!important}
    .ghost-btn{transition:all 0.25s ease!important;display:inline-block}
    .ghost-btn:hover{border-color:${C.borderHover}!important;background:rgba(255,255,255,0.04)!important;transform:translateY(-2px)!important}
    .srv-card{transition:background 0.3s,transform 0.35s cubic-bezier(0.34,1.56,0.64,1)}
    .srv-card:hover{transform:translateY(-5px)!important}
    .filter-btn{transition:all 0.22s cubic-bezier(0.34,1.56,0.64,1)!important}
    .filter-btn:hover{transform:scale(1.07)!important}
    .stat-item{transition:transform 0.3s ease}
    .stat-item:hover .sval{transform:scale(1.1);color:#fff!important}
    .stat-item:hover .slabel{color:${C.accent}!important}
    input,textarea{background:${C.surface2};border:1px solid ${C.border};color:${C.text};padding:10px 14px;border-radius:6px;font-family:'DM Sans',sans-serif;font-size:14px;outline:none;width:100%;transition:border-color 0.25s,box-shadow 0.25s}
    input:focus,textarea:focus{border-color:${C.accent};box-shadow:0 0 0 3px rgba(245,166,35,0.1)}
    textarea{resize:vertical;min-height:80px}
    select{background:${C.surface2};border:1px solid ${C.border};color:${C.text};padding:10px 14px;border-radius:6px;font-family:'DM Sans',sans-serif;font-size:14px;outline:none;width:100%}
    @keyframes sidebarIn{from{transform:translateX(100%)}to{transform:translateX(0)}}
    @keyframes sidebarOut{from{transform:translateX(0)}to{transform:translateX(100%)}}
    .nav-desktop{display:flex;gap:clamp(16px,3vw,36px);align-items:center}
    .nav-hamburger{display:none;background:none;border:none;padding:6px;flex-direction:column;gap:5px;justify-content:center;align-items:center;z-index:101}
    .nav-hamburger span{display:block;width:22px;height:2px;background:${C.text};border-radius:2px;transition:transform 0.35s cubic-bezier(0.16,1,0.3,1),opacity 0.25s,width 0.3s}
    .nav-hamburger.open span:nth-child(1){transform:translateY(7px) rotate(45deg)}
    .nav-hamburger.open span:nth-child(2){opacity:0;width:0}
    .nav-hamburger.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
    @media(max-width:768px){
      .nav-desktop{display:none!important}
      .nav-hamburger{display:flex!important}
    }
  `}</style>
);

// ─── Hooks ─────────────────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal,.reveal-left,.reveal-right');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  });
}

function useCounter(target) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);
  const num = parseInt(target.replace(/\D/g, '')) || 0;
  const suffix = target.replace(/[0-9]/g, '');
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting && !started) { setStarted(true); obs.disconnect(); } }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!started) return;
    let s = 0; const step = num / (1600 / 16);
    const t = setInterval(() => { s = Math.min(s + step, num); setCount(Math.floor(s)); if (s >= num) clearInterval(t); }, 16);
    return () => clearInterval(t);
  }, [started, num]);
  return { ref, display: `${count}${suffix}` };
}

// ─── Custom Cursor ─────────────────────────────────────────────────────────
function Cursor() {
  const dot = useRef(null); const ring = useRef(null);
  const pos = useRef({ x:0, y:0 }); const rpos = useRef({ x:0, y:0 });
  useEffect(() => {
    const m = e => { pos.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('mousemove', m);
    let raf;
    const loop = () => {
      rpos.current.x += (pos.current.x - rpos.current.x) * 0.13;
      rpos.current.y += (pos.current.y - rpos.current.y) * 0.13;
      if (dot.current) { dot.current.style.left=pos.current.x+'px'; dot.current.style.top=pos.current.y+'px'; }
      if (ring.current) { ring.current.style.left=rpos.current.x+'px'; ring.current.style.top=rpos.current.y+'px'; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const over = () => { dot.current?.classList.add('cx'); ring.current?.classList.add('cx'); };
    const out = () => { dot.current?.classList.remove('cx'); ring.current?.classList.remove('cx'); };
    const targets = document.querySelectorAll('a,button,.vc,.filter-btn');
    targets.forEach(el => { el.addEventListener('mouseenter', over); el.addEventListener('mouseleave', out); });
    return () => { window.removeEventListener('mousemove', m); cancelAnimationFrame(raf); };
  }, []);
  return (
    <>
      <style>{`
        .cdot{position:fixed;width:6px;height:6px;background:${C.accent};border-radius:50%;pointer-events:none;z-index:9999;transform:translate(-50%,-50%);transition:width .2s,height .2s}
        .cring{position:fixed;width:30px;height:30px;border:1px solid rgba(245,166,35,0.45);border-radius:50%;pointer-events:none;z-index:9998;transform:translate(-50%,-50%);transition:width .2s,height .2s,border-color .2s}
        .cdot.cx{width:12px;height:12px;background:#fff}
        .cring.cx{width:52px;height:52px;border-color:rgba(245,166,35,0.7)}
      `}</style>
      <div ref={dot} className="cdot" />
      <div ref={ring} className="cring" />
    </>
  );
}

// ─── Page Loader ───────────────────────────────────────────────────────────
function Loader({ onDone }) {
  const [pct, setPct] = useState(0);
  const [out, setOut] = useState(false);
  useEffect(() => {
    let v = 0;
    const t = setInterval(() => {
      v += Math.random() * 16 + 8;
      if (v >= 100) { v = 100; clearInterval(t); setTimeout(() => { setOut(true); setTimeout(onDone, 550); }, 350); }
      setPct(Math.floor(v));
    }, 80);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{
      position:'fixed',inset:0,background:C.bg,zIndex:10000,
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
      opacity:out?0:1,transform:out?'scale(1.05)':'scale(1)',
      transition:'opacity 0.55s ease,transform 0.55s ease',
      pointerEvents:out?'none':'all',
    }}>
      <div style={{textAlign:'center',marginBottom:52}}>
        <div className="dp" style={{fontSize:58,color:C.text,letterSpacing:'0.08em',lineHeight:1}}>
          PORT<span style={{color:C.accent}}>FOLIO</span>
        </div>
        <div style={{fontSize:10,color:C.textMuted,letterSpacing:'0.35em',fontFamily:'DM Sans',textTransform:'uppercase',marginTop:6}}>
          Loading Experience
        </div>
      </div>
      <div style={{width:220,height:1,background:C.surface3,position:'relative',marginBottom:14}}>
        <div style={{
          position:'absolute',top:0,left:0,height:'100%',background:C.accent,
          width:`${pct}%`,transition:'width 0.1s ease',
          boxShadow:`0 0 10px ${C.accent},0 0 20px rgba(245,166,35,0.3)`,
        }}/>
      </div>
      <div style={{fontSize:11,color:C.accent,letterSpacing:'0.25em',fontFamily:'DM Sans'}}>{pct}%</div>
      <div style={{position:'absolute',bottom:0,left:0,right:0,display:'flex',borderTop:`1px solid ${C.border}`,overflow:'hidden'}}>
        {['PREMIERE','RESOLVE','AFTER EFFECTS','FINAL CUT','AUDITION'].map((w,i)=>(
          <div key={i} style={{
            padding:'10px 22px',fontSize:9,color:C.textDim,letterSpacing:'0.18em',fontFamily:'DM Sans',
            textTransform:'uppercase',borderRight:`1px solid ${C.border}`,whiteSpace:'nowrap',
            animation:`fadeIn 0.4s ${i*0.1}s ease both`,
          }}>{w}</div>
        ))}
      </div>
    </div>
  );
}

// ─── Marquee Ticker ────────────────────────────────────────────────────────
function Marquee() {
  const words = ['VIDEO EDITING','COLOR GRADING','MOTION GRAPHICS','SOUND DESIGN','SHORT FILMS','COMMERCIALS','MUSIC VIDEOS','DOCUMENTARIES'];
  const all = [...words,...words];
  return (
    <div style={{overflow:'hidden',borderTop:`1px solid ${C.border}`,borderBottom:`1px solid ${C.border}`,padding:'13px 0',background:C.surface}}>
      <div style={{display:'flex',animation:'marquee 24s linear infinite',whiteSpace:'nowrap',width:'max-content'}}>
        {all.map((w,i)=>(
          <span key={i} style={{
            fontFamily:'Bebas Neue,sans-serif',fontSize:17,letterSpacing:'0.12em',
            color:i%2===0?C.textDim:C.accent,padding:'0 28px',
          }}>{w} <span style={{color:C.border,marginLeft:24}}>✦</span></span>
        ))}
      </div>
    </div>
  );
}

// ─── Nav ───────────────────────────────────────────────────────────────────
function Nav({ profile, onAdmin }) {
  const [scrolled, setScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const closeSidebar = () => {
    setClosing(true);
    setTimeout(() => { setSidebarOpen(false); setClosing(false); }, 360);
  };

  const links = [['work','Work'],['about','About'],['services','Services'],['contact','Contact']];
  const name = profile.name.split(' ');

  return (
    <>
      <nav style={{
        position:'fixed',top:0,left:0,right:0,zIndex:100,height:64,
        padding:'0 clamp(20px,4vw,48px)',display:'flex',alignItems:'center',justifyContent:'space-between',
        background:scrolled?'rgba(8,8,8,0.97)':'rgba(8,8,8,0.4)',
        backdropFilter:'blur(20px)',
        borderBottom:scrolled?`1px solid ${C.border}`:'none',
        transition:'all 0.4s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <button onClick={()=>window.scrollTo({top:0,behavior:'smooth'})} style={{background:'none',border:'none',transition:'opacity 0.2s'}}
          onMouseEnter={e=>e.currentTarget.style.opacity='0.65'}
          onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
          <span className="dp" style={{fontSize:22,color:C.text,letterSpacing:'0.05em'}}>
            {name[0]}<span style={{color:C.accent}}>{name[1]?`.${name[1]}`:''}</span>
          </span>
        </button>

        <div className="nav-desktop">
          {links.map(([id,label])=>(
            <a key={id} href={`#${id}`} className="nav-link" style={{color:C.textMuted,textDecoration:'none',fontSize:12,letterSpacing:'0.12em',textTransform:'uppercase',fontFamily:'DM Sans',transition:'color 0.2s'}}
              onMouseEnter={e=>e.currentTarget.style.color=C.text}
              onMouseLeave={e=>e.currentTarget.style.color=C.textMuted}>{label}</a>
          ))}
          <a href="#contact" className="hire-btn" style={{background:C.accent,color:'#000',padding:'8px 22px',borderRadius:4,textDecoration:'none',fontWeight:500,fontSize:12,letterSpacing:'0.08em',textTransform:'uppercase',fontFamily:'DM Sans'}}>Hire Me</a>
        </div>

        <button
          className={`nav-hamburger${sidebarOpen?' open':''}`}
          onClick={()=> sidebarOpen ? closeSidebar() : setSidebarOpen(true)}
          aria-label="Toggle menu">
          <span/><span/><span/>
        </button>
      </nav>

      {sidebarOpen && (
        <div onClick={closeSidebar} style={{
          position:'fixed',inset:0,zIndex:150,
          background:'rgba(0,0,0,0.7)',
          backdropFilter:'blur(4px)',
          animation:'fadeIn 0.3s ease both',
        }}/>
      )}

      {sidebarOpen && (
        <div style={{
          position:'fixed',top:0,right:0,bottom:0,zIndex:151,
          width:'min(300px,82vw)',
          background:C.surface,
          borderLeft:`1px solid ${C.border}`,
          display:'flex',flexDirection:'column',
          animation: closing
            ? 'sidebarOut 0.36s cubic-bezier(0.16,1,0.3,1) both'
            : 'sidebarIn 0.38s cubic-bezier(0.16,1,0.3,1) both',
          boxShadow:'-24px 0 80px rgba(0,0,0,0.7)',
        }}>
          <div style={{height:64,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
            <span className="dp" style={{fontSize:20,color:C.text,letterSpacing:'0.05em'}}>
              {name[0]}<span style={{color:C.accent}}>{name[1]?`.${name[1]}`:''}</span>
            </span>
            <button onClick={closeSidebar} style={{
              background:'none',border:`1px solid ${C.border}`,color:C.textMuted,
              width:34,height:34,borderRadius:'50%',fontSize:18,
              display:'flex',alignItems:'center',justifyContent:'center',
              transition:'all 0.25s',
            }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.color=C.accent;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textMuted;}}
            >×</button>
          </div>

          <div style={{flex:1,display:'flex',flexDirection:'column',padding:'24px',overflowY:'auto'}}>
            {links.map(([id,label],i)=>(
              <a key={id} href={`#${id}`} onClick={closeSidebar}
                style={{
                  display:'flex',alignItems:'center',gap:14,
                  padding:'16px 0',
                  color:C.textMuted,textDecoration:'none',
                  fontSize:13,letterSpacing:'0.14em',textTransform:'uppercase',
                  fontFamily:'DM Sans',
                  borderBottom:`1px solid ${C.border}`,
                  transition:'color 0.2s, padding-left 0.25s',
                  animation:`fadeUp 0.4s ${i*0.07}s ease both`,
                }}
                onMouseEnter={e=>{e.currentTarget.style.color=C.text;e.currentTarget.style.paddingLeft='8px';}}
                onMouseLeave={e=>{e.currentTarget.style.color=C.textMuted;e.currentTarget.style.paddingLeft='0';}}>
                <span style={{color:C.accent,fontFamily:'DM Sans',fontSize:10,minWidth:20,letterSpacing:'0.08em'}}>0{i+1}</span>
                {label}
              </a>
            ))}
          </div>

          <div style={{padding:'24px',borderTop:`1px solid ${C.border}`,flexShrink:0}}>
            <a href="#contact" onClick={closeSidebar}
              style={{
                display:'block',textAlign:'center',
                background:C.accent,color:'#000',
                padding:'14px 0',borderRadius:4,
                textDecoration:'none',fontWeight:500,
                fontSize:12,letterSpacing:'0.1em',textTransform:'uppercase',
                fontFamily:'DM Sans',transition:'opacity 0.2s',
              }}
              onMouseEnter={e=>e.currentTarget.style.opacity='0.85'}
              onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
              Hire Me
            </a>
            <p style={{textAlign:'center',marginTop:14,fontSize:11,color:C.textDim,fontFamily:'DM Sans',letterSpacing:'0.05em'}}>
              {profile.email}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Stat Item ─────────────────────────────────────────────────────────────
function StatItem({ stat, delay }) {
  const { ref, display } = useCounter(stat.value);
  return (
    <div ref={ref} className="stat-item reveal" style={{transitionDelay:`${delay}s`}}>
      <div className="dp sval" style={{fontSize:'clamp(32px,4vw,50px)',color:C.accent,lineHeight:1,transition:'transform 0.3s ease,color 0.3s',textShadow:`0 0 30px rgba(245,166,35,0.25)`}}>{display}</div>
      <div className="slabel" style={{fontSize:11,color:C.textMuted,letterSpacing:'0.14em',textTransform:'uppercase',marginTop:5,fontFamily:'DM Sans',transition:'color 0.3s'}}>{stat.label}</div>
    </div>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────
function Hero({ profile }) {
  const lines = profile.tagline.split('\n');
  return (
    <section style={{minHeight:'100vh',display:'flex',flexDirection:'column',justifyContent:'center',padding:'90px clamp(20px,4vw,48px) 60px',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',inset:0,zIndex:0,backgroundImage:`linear-gradient(${C.border} 1px,transparent 1px),linear-gradient(90deg,${C.border} 1px,transparent 1px)`,backgroundSize:'56px 56px',WebkitMaskImage:'radial-gradient(ellipse 90% 80% at 25% 50%, black 10%, transparent 80%)',maskImage:'radial-gradient(ellipse 90% 80% at 25% 50%, black 10%, transparent 80%)'}}/>
      <div style={{position:'absolute',width:800,height:800,borderRadius:'50%',background:'radial-gradient(circle, rgba(245,166,35,0.06) 0%, transparent 65%)',top:'20%',right:'-5%',pointerEvents:'none',zIndex:0,animation:'floatY 9s ease-in-out infinite'}}/>
      <div style={{position:'absolute',width:420,height:420,borderRadius:'50%',border:'1px solid rgba(245,166,35,0.05)',top:'15%',right:'10%',pointerEvents:'none',zIndex:0,animation:'rotateSlow 30s linear infinite'}}/>
      <div style={{position:'absolute',width:640,height:640,borderRadius:'50%',border:'1px solid rgba(245,166,35,0.03)',top:'3%',right:'1%',pointerEvents:'none',zIndex:0,animation:'rotateSlow 55s linear infinite reverse'}}/>
      <div style={{position:'relative',zIndex:1,maxWidth:960}}>
        {profile.available && (
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:C.accentDim,border:`1px solid rgba(245,166,35,0.28)`,padding:'6px 16px',borderRadius:100,marginBottom:36,animation:'fadeIn 0.6s 0.1s ease both'}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:C.accent,animation:'pulse 2s infinite'}}/>
            <span style={{color:C.accent,fontSize:11,letterSpacing:'0.12em',textTransform:'uppercase',fontFamily:'DM Sans'}}>Available for new projects</span>
          </div>
        )}
        <h1 className="dp" style={{fontSize:'clamp(64px,11.5vw,152px)',lineHeight:1,color:C.text,marginBottom:36}}>
          {lines.map((line,i)=>(
            <div key={i} style={{overflow:'hidden',paddingBottom:'0.12em',marginBottom:'-0.12em',animation:`fadeUp 0.7s ${0.3+i*0.18}s cubic-bezier(0.16,1,0.3,1) both`}}>
              <span style={{display:'block',color:i===1?C.accent:C.text,textShadow:i===1?`0 0 40px rgba(245,166,35,0.22)`:'none'}}>{line}</span>
            </div>
          ))}
        </h1>
        <p style={{fontSize:'clamp(15px,1.5vw,18px)',color:C.textMuted,maxWidth:520,lineHeight:1.75,marginBottom:52,fontWeight:300,fontFamily:'DM Sans',animation:'fadeUp 0.7s 0.85s cubic-bezier(0.16,1,0.3,1) both'}}>{profile.bio}</p>
        <div style={{display:'flex',gap:14,flexWrap:'wrap',alignItems:'center',animation:'fadeUp 0.7s 1.05s cubic-bezier(0.16,1,0.3,1) both'}}>
          <a href="#work" className="cta-btn" style={{background:C.accent,color:'#000',padding:'15px 38px',borderRadius:4,textDecoration:'none',fontWeight:500,fontSize:13,letterSpacing:'0.06em',textTransform:'uppercase',fontFamily:'DM Sans'}}>View My Work</a>
          <a href={`mailto:${profile.email}`} className="ghost-btn" style={{color:C.text,padding:'15px 38px',borderRadius:4,textDecoration:'none',fontSize:13,letterSpacing:'0.06em',textTransform:'uppercase',border:`1px solid ${C.border}`,fontFamily:'DM Sans'}}>Get In Touch</a>
        </div>
        <div style={{display:'flex',gap:'clamp(28px,4vw,64px)',marginTop:80,paddingTop:48,borderTop:`1px solid ${C.border}`,flexWrap:'wrap'}}>
          {profile.stats.map((s,i)=><StatItem key={i} stat={s} delay={1.2+i*0.1}/>)}
        </div>
      </div>
      <div style={{position:'absolute',bottom:32,left:'50%',transform:'translateX(-50%)',display:'flex',flexDirection:'column',alignItems:'center',gap:8,animation:'fadeIn 1s 1.8s ease both'}}>
        <span style={{fontSize:9,color:C.textDim,letterSpacing:'0.25em',textTransform:'uppercase',fontFamily:'DM Sans'}}>Scroll</span>
        <div style={{width:20,height:34,border:`1px solid ${C.border}`,borderRadius:10,display:'flex',justifyContent:'center',paddingTop:6}}>
          <div style={{width:2,height:6,background:C.accent,borderRadius:1,animation:'scrollDot 1.5s ease infinite'}}/>
        </div>
      </div>
    </section>
  );
}

// ─── Video Card ────────────────────────────────────────────────────────────
function VideoCard({ project, onPlay, delay=0 }) {
  const thumb = getThumb(project.videoUrl);
  return (
    <div className="vc reveal" style={{transitionDelay:`${delay}s`,background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,overflow:'hidden'}} onClick={()=>onPlay(project)}>
      <div style={{position:'relative',paddingBottom:'56.25%',background:C.surface2,overflow:'hidden'}}>
        {thumb ? (
          <img className="vthumb" src={thumb} alt={project.title} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.6s cubic-bezier(0.16,1,0.3,1)'}}/>
        ):(
          <div style={{position:'absolute',inset:0,background:`linear-gradient(135deg,${C.surface2},${C.surface3})`,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:10}}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><rect x="1" y="1" width="38" height="38" rx="5" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/><polygon points="14,10 30,20 14,30" fill="rgba(255,255,255,0.12)"/></svg>
            <span style={{color:C.textDim,fontSize:11,letterSpacing:'0.12em',textTransform:'uppercase',fontFamily:'DM Sans'}}>{project.videoUrl?'Video Ready':'Add URL'}</span>
          </div>
        )}
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.05) 60%)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div className="vplay" style={{width:58,height:58,borderRadius:'50%',background:'rgba(245,166,35,0.88)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',transition:'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',boxShadow:'0 8px 24px rgba(245,166,35,0.4)'}}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="black"><polygon points="5,3 15,9 5,15"/></svg>
          </div>
        </div>
        <span style={{position:'absolute',top:12,left:12,background:'rgba(8,8,8,0.85)',color:C.accent,backdropFilter:'blur(6px)',fontSize:10,padding:'4px 12px',borderRadius:100,letterSpacing:'0.12em',textTransform:'uppercase',fontFamily:'DM Sans'}}>{project.category}</span>
      </div>
      <div style={{padding:'18px 22px 22px'}}>
        <h3 className="vtitle" style={{fontSize:15,fontWeight:500,color:C.text,marginBottom:6,fontFamily:'DM Sans',transition:'color 0.25s'}}>{project.title}</h3>
        <p style={{fontSize:13,color:C.textMuted,lineHeight:1.6,fontFamily:'DM Sans'}}>{project.desc}</p>
      </div>
    </div>
  );
}

// ─── Video Modal ───────────────────────────────────────────────────────────
function VideoModal({ project, onClose }) {
  useEffect(()=>{ document.body.style.overflow=project?'hidden':''; },[project]);
  if (!project) return null;
  const embed = getEmbedUrl(project.videoUrl);
  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:1000,background:'rgba(0,0,0,0.95)',display:'flex',alignItems:'center',justifyContent:'center',padding:24,animation:'fadeIn 0.3s ease'}}>
      <div onClick={e=>e.stopPropagation()} style={{width:'100%',maxWidth:920,animation:'scaleIn 0.35s cubic-bezier(0.16,1,0.3,1)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:18}}>
          <div>
            <h2 className="dp" style={{fontSize:30,color:C.text,lineHeight:1}}>{project.title}</h2>
            <span style={{color:C.accent,fontSize:11,letterSpacing:'0.12em',textTransform:'uppercase',fontFamily:'DM Sans'}}>{project.category}</span>
          </div>
          <button onClick={onClose} style={{background:C.surface2,border:`1px solid ${C.border}`,color:C.text,width:40,height:40,borderRadius:'50%',fontSize:20,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',transition:'transform 0.25s'}}
            onMouseEnter={e=>e.currentTarget.style.transform='rotate(90deg)'}
            onMouseLeave={e=>e.currentTarget.style.transform='rotate(0deg)'}>×</button>
        </div>
        {embed ? (
          <div style={{position:'relative',paddingBottom:'56.25%',background:'#000',borderRadius:10,overflow:'hidden',boxShadow:'0 32px 80px rgba(0,0,0,0.8)'}}>
            <iframe src={embed+'?autoplay=1&rel=0'} style={{position:'absolute',inset:0,width:'100%',height:'100%',border:'none'}} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen/>
          </div>
        ):(
          <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:64,textAlign:'center'}}>
            <p style={{color:C.textMuted,fontFamily:'DM Sans'}}>No video URL yet. Open admin panel to add a YouTube or Vimeo link.</p>
          </div>
        )}
        {project.desc && <p style={{color:C.textMuted,fontSize:14,marginTop:16,fontFamily:'DM Sans',lineHeight:1.6}}>{project.desc}</p>}
      </div>
    </div>
  );
}

// ─── Work Section ──────────────────────────────────────────────────────────
function WorkSection({ projects, onPlay }) {
  const [filter, setFilter] = useState('All');
  useScrollReveal();
  const cats = ['All',...new Set(projects.map(p=>p.category))];
  const visible = filter==='All'?projects:projects.filter(p=>p.category===filter);
  return (
    <section id="work" style={{padding:'100px clamp(20px,4vw,48px)',borderTop:`1px solid ${C.border}`}}>
      <div style={{maxWidth:1280,margin:'0 auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:56,flexWrap:'wrap',gap:24}}>
          <div>
            <p className="reveal" style={{color:C.accent,fontSize:11,letterSpacing:'0.18em',textTransform:'uppercase',marginBottom:10,fontFamily:'DM Sans'}}>Portfolio</p>
            <h2 className="dp reveal" style={{fontSize:'clamp(38px,6vw,80px)',color:C.text,lineHeight:1}}>Selected Work</h2>
          </div>
          <div className="reveal" style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {cats.map(c=>(
              <button key={c} className="filter-btn" onClick={()=>setFilter(c)} style={{padding:'8px 20px',borderRadius:100,fontSize:11,letterSpacing:'0.1em',textTransform:'uppercase',fontFamily:'DM Sans',background:filter===c?C.accent:'transparent',color:filter===c?'#000':C.textMuted,border:filter===c?'none':`1px solid ${C.border}`}}>{c}</button>
            ))}
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:22}}>
          {visible.map((p,i)=><VideoCard key={p.id} project={p} onPlay={onPlay} delay={i*0.06}/>)}
        </div>
        {visible.length===0 && (
          <div style={{textAlign:'center',padding:80,color:C.textMuted,fontFamily:'DM Sans'}}>
            No projects yet. Click "Edit Portfolio" to add your work.
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Skill Bar ─────────────────────────────────────────────────────────────
function SkillBar({ skill, level, delay=0 }) {
  const ref = useRef(null); const bar = useRef(null);
  useEffect(()=>{
    const obs = new IntersectionObserver(([e])=>{
      if(e.isIntersecting){ setTimeout(()=>{ if(bar.current)bar.current.style.width=`${level}%`; },80+delay*900); obs.disconnect(); }
    },{threshold:0.4});
    if(ref.current) obs.observe(ref.current);
    return ()=>obs.disconnect();
  },[level,delay]);
  return (
    <div ref={ref} style={{marginBottom:26}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
        <span style={{fontSize:13,color:C.text,letterSpacing:'0.04em',fontFamily:'DM Sans'}}>{skill}</span>
        <span style={{fontSize:12,color:C.accent,fontFamily:'DM Sans'}}>{level}%</span>
      </div>
      <div style={{height:2,background:C.surface3,borderRadius:1,overflow:'hidden'}}>
        <div ref={bar} style={{height:'100%',borderRadius:1,width:0,background:`linear-gradient(90deg,${C.accent},rgba(245,166,35,0.35))`,transition:`width 1.3s cubic-bezier(0.16,1,0.3,1) ${delay}s`,boxShadow:`0 0 8px rgba(245,166,35,0.35)`}}/>
      </div>
    </div>
  );
}

// ─── About ─────────────────────────────────────────────────────────────────
function AboutSection({ profile }) {
  useScrollReveal();
  const skills=[{s:'Adobe Premiere Pro',l:98},{s:'DaVinci Resolve',l:94},{s:'After Effects',l:88},{s:'Final Cut Pro',l:82},{s:'Audition / Logic',l:74}];
  return (
    <section id="about" style={{padding:'100px clamp(20px,4vw,48px)',background:C.surface,borderTop:`1px solid ${C.border}`,borderBottom:`1px solid ${C.border}`}}>
      <div style={{maxWidth:1280,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'clamp(40px,6vw,90px)',alignItems:'center'}}>
        <div>
          <p className="reveal" style={{color:C.accent,fontSize:11,letterSpacing:'0.18em',textTransform:'uppercase',marginBottom:10,fontFamily:'DM Sans'}}>About</p>
          <h2 className="dp reveal" style={{fontSize:'clamp(38px,5.5vw,72px)',color:C.text,lineHeight:0.92,marginBottom:32}}>The Editor<br/>Behind<br/><span style={{color:C.accent}}>The Screen</span></h2>
          <p className="reveal" style={{color:C.textMuted,fontSize:16,lineHeight:1.85,fontWeight:300,fontFamily:'DM Sans',marginBottom:20}}>{profile.bio}</p>
          <p className="reveal" style={{color:C.textMuted,fontSize:15,lineHeight:1.85,fontWeight:300,fontFamily:'DM Sans'}}>Working globally with clients across every timezone, I bring cinematic discipline to every project — whether it's a 6-second bumper ad or a 90-minute documentary feature.</p>
          <div className="reveal" style={{marginTop:36}}>
            <a href={`mailto:${profile.email}`} style={{color:C.accent,textDecoration:'none',fontSize:13,letterSpacing:'0.08em',textTransform:'uppercase',fontFamily:'DM Sans',fontWeight:500,borderBottom:`1px solid rgba(245,166,35,0.3)`,paddingBottom:2,transition:'border-color 0.2s,letter-spacing 0.3s'}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.letterSpacing='0.14em';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(245,166,35,0.3)';e.currentTarget.style.letterSpacing='0.08em';}}>
              Send an Email →
            </a>
          </div>
        </div>
        <div className="reveal-right">
          {skills.map((s,i)=><SkillBar key={i} skill={s.s} level={s.l} delay={i*0.09}/>)}
        </div>
      </div>
    </section>
  );
}

// ─── Services ──────────────────────────────────────────────────────────────
function ServicesSection({ services }) {
  useScrollReveal();
  return (
    <section id="services" style={{padding:'100px clamp(20px,4vw,48px)',borderTop:`1px solid ${C.border}`}}>
      <div style={{maxWidth:1280,margin:'0 auto'}}>
        <div style={{marginBottom:64}}>
          <p className="reveal" style={{color:C.accent,fontSize:11,letterSpacing:'0.18em',textTransform:'uppercase',marginBottom:10,fontFamily:'DM Sans'}}>What I Do</p>
          <h2 className="dp reveal" style={{fontSize:'clamp(38px,6vw,80px)',color:C.text,lineHeight:1}}>Services</h2>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))'}}>
          {services.map((s,i)=>(
            <div key={s.id} className={`srv-card reveal s${i+1}`} style={{padding:'44px 36px',borderRight:(i+1)%2===1?`1px solid ${C.border}`:'none',borderBottom:i<services.length-2?`1px solid ${C.border}`:'none'}}
              onMouseEnter={e=>e.currentTarget.style.background=C.surface2}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <span style={{fontSize:34,color:C.accent,display:'inline-block',marginBottom:22,transition:'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)'}}
                onMouseEnter={e=>e.currentTarget.style.transform='scale(1.25) rotate(-8deg)'}
                onMouseLeave={e=>e.currentTarget.style.transform='scale(1) rotate(0deg)'}>{s.icon}</span>
              <h3 className="dp" style={{fontSize:30,color:C.text,marginBottom:14}}>{s.title}</h3>
              <p style={{color:C.textMuted,fontSize:14,lineHeight:1.75,fontFamily:'DM Sans'}}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Contact ───────────────────────────────────────────────────────────────
function ContactSection({ profile }) {
  useScrollReveal();
  return (
    <section id="contact" style={{padding:'100px clamp(20px,4vw,48px)',borderTop:`1px solid ${C.border}`,textAlign:'center',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',width:700,height:700,borderRadius:'50%',background:'radial-gradient(circle,rgba(245,166,35,0.05) 0%,transparent 70%)',top:'50%',left:'50%',transform:'translate(-50%,-50%)',pointerEvents:'none',animation:'floatY 11s ease-in-out infinite'}}/>
      <div style={{maxWidth:680,margin:'0 auto',position:'relative',zIndex:1}}>
        <p className="reveal" style={{color:C.accent,fontSize:11,letterSpacing:'0.18em',textTransform:'uppercase',marginBottom:16,fontFamily:'DM Sans'}}>Let's Work Together</p>
        <h2 className="dp reveal" style={{fontSize:'clamp(52px,9vw,110px)',color:C.text,lineHeight:0.88,marginBottom:32}}>Got a<br/><span style={{color:C.accent,textShadow:`0 0 60px rgba(245,166,35,0.18)`}}>Project?</span></h2>
        <p className="reveal" style={{color:C.textMuted,fontSize:17,lineHeight:1.8,marginBottom:52,fontWeight:300,fontFamily:'DM Sans'}}>I'm always open to discussing new projects and creative opportunities. Let's make something unforgettable together.</p>
        <div className="reveal">
          <a href={`mailto:${profile.email}`} className="cta-btn" style={{background:C.accent,color:'#000',padding:'18px 56px',borderRadius:4,textDecoration:'none',fontWeight:500,fontSize:14,letterSpacing:'0.08em',textTransform:'uppercase',fontFamily:'DM Sans'}}>{profile.email}</a>
        </div>
        {profile.instagram && (
          <div className="reveal" style={{marginTop:32}}>
            <a href="#" style={{color:C.textMuted,fontSize:13,letterSpacing:'0.06em',textDecoration:'none',fontFamily:'DM Sans',transition:'color 0.2s,letter-spacing 0.3s'}}
              onMouseEnter={e=>{e.currentTarget.style.color=C.accent;e.currentTarget.style.letterSpacing='0.1em';}}
              onMouseLeave={e=>{e.currentTarget.style.color=C.textMuted;e.currentTarget.style.letterSpacing='0.06em';}}>Instagram: {profile.instagram}</a>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Password Gate ─────────────────────────────────────────────────────────
function PasswordGate({ open, onClose, onSuccess }) {
  const [pwd,setPwd]=useState(''); const [err,setErr]=useState(false); const [shake,setShake]=useState(false);
  const inputRef=useRef(null);
  useEffect(()=>{ if(open){setPwd('');setErr(false);setTimeout(()=>inputRef.current?.focus(),100);} },[open]);
  if (!open) return null;
  const attempt=()=>{
    if(pwd===OWNER_PASSWORD){onSuccess();onClose();setPwd('');setErr(false);}
    else{setErr(true);setShake(true);setPwd('');setTimeout(()=>setShake(false),500);}
  };
  return (
    <div style={{position:'fixed',inset:0,zIndex:300,background:'rgba(0,0,0,0.9)',display:'flex',alignItems:'center',justifyContent:'center',padding:24,animation:'fadeIn 0.25s ease'}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:'44px 40px',width:'100%',maxWidth:380,animation:shake?'shakeX 0.4s ease':'scaleIn 0.35s cubic-bezier(0.16,1,0.3,1)'}}>
        <style>{`@keyframes shakeX{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}`}</style>
        <div style={{textAlign:'center',marginBottom:28}}>
          <div style={{width:56,height:56,borderRadius:'50%',background:C.accentDim,border:`1px solid rgba(245,166,35,0.3)`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 18px'}}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h2 className="dp" style={{fontSize:28,color:C.text,marginBottom:6}}>Owner Access</h2>
          <p style={{color:C.textMuted,fontSize:13,fontFamily:'DM Sans',lineHeight:1.6}}>Enter your password to edit this portfolio</p>
        </div>
        <div style={{marginBottom:16}}>
          <input ref={inputRef} type="password" placeholder="Enter password" value={pwd} onChange={e=>{setPwd(e.target.value);setErr(false);}} onKeyDown={e=>e.key==='Enter'&&attempt()} style={{textAlign:'center',fontSize:16,letterSpacing:'0.2em',borderColor:err?'#e04040':C.border}}/>
          {err && <p style={{color:'#e04040',fontSize:12,textAlign:'center',marginTop:8,fontFamily:'DM Sans'}}>Incorrect password. Try again.</p>}
        </div>
        <div style={{display:'flex',gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:'12px 0',background:'none',border:`1px solid ${C.border}`,color:C.textMuted,borderRadius:6,fontFamily:'DM Sans',fontSize:13,transition:'all 0.2s'}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=C.borderHover;e.currentTarget.style.color=C.text;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textMuted;}}>Cancel</button>
          <button onClick={attempt} style={{flex:2,padding:'12px 0',background:C.accent,border:'none',color:'#000',borderRadius:6,fontFamily:'DM Sans',fontWeight:500,fontSize:13,transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)'}}
            onMouseEnter={e=>e.currentTarget.style.transform='scale(1.04)'}
            onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>Unlock</button>
        </div>

      </div>
    </div>
  );
}

// ─── Admin Panel ───────────────────────────────────────────────────────────
function LBL({ children }) {
  return <label style={{fontSize:11,color:C.textMuted,letterSpacing:'0.1em',textTransform:'uppercase',display:'block',marginBottom:7,fontFamily:'DM Sans'}}>{children}</label>;
}

function AdminPanel({ open, onClose, profile, projects, services, onSave }) {
  const [tab,setTab]=useState('profile');
  const [p,setP]=useState(profile);
  const [projs,setProjs]=useState(projects);
  const [srvs,setSrvs]=useState(services);
  const [newProj,setNewProj]=useState({title:'',category:'Commercial',videoUrl:'',desc:''});
  useEffect(()=>{ if(open){setP(profile);setProjs(projects);setSrvs(services);} },[open,profile,projects,services]);
  if(!open) return null;
  const save=()=>{ onSave({profile:p,projects:projs,services:srvs}); onClose(); };
  const addProj=()=>{ if(!newProj.title.trim())return; setProjs(prev=>[...prev,{...newProj,id:Date.now()}]); setNewProj({title:'',category:'Commercial',videoUrl:'',desc:''}); };
  const delProj=id=>setProjs(prev=>prev.filter(x=>x.id!==id));
  const editProj=(id,k,v)=>setProjs(prev=>prev.map(x=>x.id===id?{...x,[k]:v}:x));
  const editSrv=(id,k,v)=>setSrvs(prev=>prev.map(x=>x.id===id?{...x,[k]:v}:x));
  const tabs=[['profile','Profile'],['projects','Projects'],['services','Services']];
  const CATS=['Commercial','Short Film','Music Video','Documentary','Fashion','Wedding','Corporate','Travel','Social Media','Other'];
  return (
    <div style={{position:'fixed',inset:0,zIndex:200,background:'rgba(0,0,0,0.85)',display:'flex',justifyContent:'flex-end',animation:'fadeIn 0.25s ease'}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{width:'100%',maxWidth:560,height:'100%',background:C.surface,borderLeft:`1px solid ${C.border}`,display:'flex',flexDirection:'column',animation:'slidePanel 0.38s cubic-bezier(0.16,1,0.3,1)'}}>
        <style>{`@keyframes slidePanel{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
        <div style={{padding:'22px 28px',borderBottom:`1px solid ${C.border}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div><h2 className="dp" style={{fontSize:26,color:C.text}}>Edit Portfolio</h2><p style={{fontSize:12,color:C.textMuted,marginTop:2,fontFamily:'DM Sans'}}>Manage content & profile</p></div>
          <button onClick={onClose} style={{background:'none',border:`1px solid ${C.border}`,color:C.textMuted,width:36,height:36,borderRadius:'50%',fontSize:20,display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.25s'}}
            onMouseEnter={e=>{e.currentTarget.style.background=C.surface3;e.currentTarget.style.transform='rotate(90deg)';}}
            onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.transform='rotate(0deg)';}}>×</button>
        </div>
        <div style={{display:'flex',borderBottom:`1px solid ${C.border}`}}>
          {tabs.map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:'13px 0',background:'none',border:'none',fontFamily:'DM Sans',fontSize:13,color:tab===id?C.accent:C.textMuted,borderBottom:tab===id?`2px solid ${C.accent}`:'2px solid transparent',transition:'all 0.2s'}}>{label}</button>
          ))}
        </div>
        <div style={{flex:1,overflow:'auto',padding:28}}>
          {tab==='profile' && (
            <div style={{display:'flex',flexDirection:'column',gap:18}}>
              <div><LBL>Full Name</LBL><input value={p.name} onChange={e=>setP({...p,name:e.target.value})}/></div>
              <div><LBL>Title</LBL><input value={p.title} onChange={e=>setP({...p,title:e.target.value})}/></div>
              <div><LBL>Hero Tagline (use \n for line breaks)</LBL><input value={p.tagline} onChange={e=>setP({...p,tagline:e.target.value})}/></div>
              <div><LBL>Bio</LBL><textarea value={p.bio} onChange={e=>setP({...p,bio:e.target.value})}/></div>
              <div><LBL>Email</LBL><input value={p.email} onChange={e=>setP({...p,email:e.target.value})}/></div>
              <div><LBL>Instagram</LBL><input value={p.instagram} onChange={e=>setP({...p,instagram:e.target.value})}/></div>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <input type="checkbox" id="av" checked={p.available} onChange={e=>setP({...p,available:e.target.checked})} style={{width:'auto'}}/>
                <label htmlFor="av" style={{color:C.textMuted,fontSize:14,fontFamily:'DM Sans'}}>Show "Available" badge</label>
              </div>
              <div style={{borderTop:`1px solid ${C.border}`,paddingTop:18}}>
                <LBL>Hero Stats</LBL>
                {p.stats.map((s,i)=>(
                  <div key={i} style={{display:'flex',gap:10,marginBottom:10}}>
                    <input value={s.value} onChange={e=>setP({...p,stats:p.stats.map((x,j)=>j===i?{...x,value:e.target.value}:x)})} placeholder="Value" style={{flex:1}}/>
                    <input value={s.label} onChange={e=>setP({...p,stats:p.stats.map((x,j)=>j===i?{...x,label:e.target.value}:x)})} placeholder="Label" style={{flex:2}}/>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab==='projects' && (
            <div>
              <div style={{background:C.surface2,border:`1px solid ${C.border}`,borderRadius:8,padding:20,marginBottom:24}}>
                <h3 style={{color:C.text,fontSize:14,marginBottom:16,fontFamily:'DM Sans',fontWeight:500}}>Add New Project</h3>
                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                  <input placeholder="Project Title *" value={newProj.title} onChange={e=>setNewProj({...newProj,title:e.target.value})}/>
                  <select value={newProj.category} onChange={e=>setNewProj({...newProj,category:e.target.value})}>{CATS.map(c=><option key={c}>{c}</option>)}</select>
                  <input placeholder="YouTube or Vimeo URL" value={newProj.videoUrl} onChange={e=>setNewProj({...newProj,videoUrl:e.target.value})}/>
                  <input placeholder="Short description" value={newProj.desc} onChange={e=>setNewProj({...newProj,desc:e.target.value})}/>
                  <button onClick={addProj} style={{background:C.accent,color:'#000',border:'none',padding:'11px',borderRadius:6,fontFamily:'DM Sans',fontWeight:500,fontSize:13,transition:'opacity 0.2s'}}
                    onMouseEnter={e=>e.currentTarget.style.opacity='0.85'}
                    onMouseLeave={e=>e.currentTarget.style.opacity='1'}>+ Add Project</button>
                </div>
              </div>
              <p style={{color:C.textMuted,fontSize:11,marginBottom:16,letterSpacing:'0.08em',textTransform:'uppercase',fontFamily:'DM Sans'}}>{projs.length} project{projs.length!==1?'s':''}</p>
              {projs.map(proj=>(
                <div key={proj.id} style={{background:C.surface2,border:`1px solid ${C.border}`,borderRadius:8,padding:16,marginBottom:10,transition:'border-color 0.2s'}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=C.borderHover}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                    <span style={{color:C.text,fontWeight:500,fontSize:14,fontFamily:'DM Sans',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}}>{proj.title||'Untitled'}</span>
                    <button onClick={()=>delProj(proj.id)} style={{background:'none',border:'none',color:'#e04',fontSize:18,marginLeft:8,transition:'transform 0.2s'}}
                      onMouseEnter={e=>e.currentTarget.style.transform='rotate(90deg)'}
                      onMouseLeave={e=>e.currentTarget.style.transform='rotate(0deg)'}>×</button>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:8}}>
                    <input placeholder="Title" value={proj.title} onChange={e=>editProj(proj.id,'title',e.target.value)} style={{fontSize:13}}/>
                    <select value={proj.category} onChange={e=>editProj(proj.id,'category',e.target.value)}>{CATS.map(c=><option key={c}>{c}</option>)}</select>
                    <input placeholder="YouTube / Vimeo URL" value={proj.videoUrl} onChange={e=>editProj(proj.id,'videoUrl',e.target.value)} style={{fontSize:13}}/>
                    <input placeholder="Description" value={proj.desc} onChange={e=>editProj(proj.id,'desc',e.target.value)} style={{fontSize:13}}/>
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab==='services' && (
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              {srvs.map(s=>(
                <div key={s.id} style={{background:C.surface2,border:`1px solid ${C.border}`,borderRadius:8,padding:16}}>
                  <div style={{display:'flex',gap:10,marginBottom:10}}>
                    <input value={s.icon} onChange={e=>editSrv(s.id,'icon',e.target.value)} style={{width:64,fontSize:22,textAlign:'center'}} placeholder="Icon"/>
                    <input value={s.title} onChange={e=>editSrv(s.id,'title',e.target.value)} placeholder="Service Name"/>
                  </div>
                  <textarea value={s.desc} onChange={e=>editSrv(s.id,'desc',e.target.value)} placeholder="Description" style={{minHeight:64}}/>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{padding:'16px 28px',borderTop:`1px solid ${C.border}`,display:'flex',gap:12}}>
          <button onClick={onClose} style={{flex:1,padding:'12px 0',background:'none',border:`1px solid ${C.border}`,color:C.textMuted,borderRadius:6,fontFamily:'DM Sans',fontSize:14,transition:'all 0.2s'}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=C.borderHover;e.currentTarget.style.color=C.text;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textMuted;}}>Cancel</button>
          <button onClick={save} style={{flex:2,padding:'12px 0',background:C.accent,border:'none',color:'#000',borderRadius:6,fontFamily:'DM Sans',fontWeight:500,fontSize:14,transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)'}}
            onMouseEnter={e=>e.currentTarget.style.transform='scale(1.02)'}
            onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>Save All Changes</button>
        </div>
      </div>
    </div>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────
export default function App() {
  const [profile,setProfile]=useState(DEF_PROFILE);
  const [projects,setProjects]=useState(DEF_PROJECTS);
  const [services,setServices]=useState(DEF_SERVICES);
  const [activeVideo,setActiveVideo]=useState(null);
  const [gateOpen,setGateOpen]=useState(false);
  const [adminOpen,setAdminOpen]=useState(false);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    (async()=>{
      const [p,pr,sv]=await Promise.all([db.get('ve_profile',DEF_PROFILE),db.get('ve_projects',DEF_PROJECTS),db.get('ve_services',DEF_SERVICES)]);
      setProfile(p); setProjects(pr); setServices(sv);
    })();
  },[]);

  const handleSave=async({profile:p,projects:pr,services:sv})=>{
    setProfile(p); setProjects(pr); setServices(sv);
    await db.set('ve_profile',p); await db.set('ve_projects',pr); await db.set('ve_services',sv);
  };

  return (
    <div style={{background:C.bg,minHeight:'100vh',color:C.text,fontFamily:'DM Sans,sans-serif'}}>
      <GlobalStyle/>
      <Cursor/>
      {loading && <Loader onDone={()=>setLoading(false)}/>}
      <Nav profile={profile} onAdmin={()=>setGateOpen(true)}/>
      <Hero profile={profile}/>
      <Marquee/>
      <WorkSection projects={projects} onPlay={setActiveVideo}/>
      <AboutSection profile={profile}/>
      <ServicesSection services={services}/>
      <ContactSection profile={profile}/>
      <footer style={{padding:'28px clamp(20px,4vw,48px)',borderTop:`1px solid ${C.border}`,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16}}>
        <span className="dp" style={{fontSize:18,color:C.textDim}}>{profile.name}</span>
        <span style={{fontSize:12,color:C.textDim,fontFamily:'DM Sans'}}>© {new Date().getFullYear()} — All Rights Reserved</span>
        <button onClick={()=>setGateOpen(true)} style={{background:'none',border:`1px solid ${C.border}`,color:C.textDim,padding:'7px 16px',borderRadius:4,fontSize:11,letterSpacing:'0.1em',textTransform:'uppercase',fontFamily:'DM Sans',transition:'all 0.25s'}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.color=C.accent;e.currentTarget.style.transform='translateY(-2px)';}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textDim;e.currentTarget.style.transform='translateY(0)';}}>✎ Edit Portfolio</button>
      </footer>
      <VideoModal project={activeVideo} onClose={()=>setActiveVideo(null)}/>
      <PasswordGate open={gateOpen} onClose={()=>setGateOpen(false)} onSuccess={()=>setAdminOpen(true)}/>
      <AdminPanel open={adminOpen} onClose={()=>setAdminOpen(false)} profile={profile} projects={projects} services={services} onSave={handleSave}/>
    </div>
  );
}
