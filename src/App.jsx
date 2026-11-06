import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { ArrowLeft, ArrowUp, ArrowUpRight, Check, ChevronDown, ChevronLeft, ChevronRight, Globe2, LoaderCircle, MapPin, Volume2, VolumeX } from 'lucide-react';
import { demo, profile, projects } from './content.js';
import { clickSound } from './sound.js';

const WorldMap = lazy(() => import('./WorldMap.jsx'));
const prompt = 'show me your projects';
const buildSteps = ['Reading profile', 'Placing photo', 'Writing intro', 'Connecting to visitors', "Mapping everyone who’s stopped by", 'Drawing details'];
const delays = [0.2, 0.65, 1, 1.75, 1.85, 2.45];
const spring = { type: 'spring', duration: 0.5, bounce: 0.12 };

function WordReveal({ text, delay = 0, className = '' }) {
  const reduced = useReducedMotion();
  return <motion.span className={className} initial="hidden" animate="shown" transition={{ staggerChildren: reduced ? 0 : 0.025, delayChildren: reduced ? 0 : delay }}>
    {text.split(/(\s+)/).map((word, i) => /^\s+$/.test(word) ? word : <motion.span key={i} className="word"
      variants={{ hidden: { opacity: 0, filter: reduced ? 'none' : 'blur(4px)' }, shown: { opacity: 1, filter: 'blur(0px)' } }}
      transition={{ duration: reduced ? 0 : 0.3 }}>{word}</motion.span>)}
  </motion.span>;
}

function Count({ to, delay }) {
  const value = useMotionValue(0);
  const rounded = useTransform(value, n => Math.round(n));
  const reduced = useReducedMotion();
  useEffect(() => { const control = animate(value, to, { duration: reduced ? 0 : 1, delay: reduced ? 0 : delay, ease: 'easeOut' }); return () => control.stop(); }, [to, delay, reduced, value]);
  return <motion.span>{rounded}</motion.span>;
}

function Clock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setTime(new Date()), 15000); return () => clearInterval(id); }, []);
  return <span className="clock"><MapPin size={12} /> {profile.location} <span>{new Intl.DateTimeFormat('en', { timeZone: profile.timeZone, hour: 'numeric', minute: '2-digit' }).format(time)} {profile.timeLabel}</span></span>;
}

function Presence({ sound }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = event => { if (!ref.current?.contains(event.target)) setOpen(false); };
    const escape = event => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', close); document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', escape); };
  }, []);
  return <div className="presence" ref={ref} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
    <button className="presence-trigger mono" aria-expanded={open} aria-controls="visitor-list" onClick={() => { setOpen(!open); clickSound(sound); }}>
      <span className="live-dot" />3 HERE <span className="demo-tag">DEMO</span>
    </button>
    <AnimatePresence>{open && <motion.div className="presence-panel" id="visitor-list" initial={{ opacity: 0, scale: 0.96, y: -5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={spring}>
      <p className="panel-heading mono">A little company <span>DEMO</span></p>
      {demo.visitors.map((visitor, i) => <motion.div className="visitor" key={visitor.name} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.045 }}>
        <span className="visitor-dot" style={{ background: visitor.color }} /><span>{visitor.name}<small>{visitor.location}</small></span><span className="visitor-time">{i === 0 ? 'you' : 'sample'}</span>
      </motion.div>)}
      <p className="presence-note">Illustrative visitors. No tracking.</p>
    </motion.div>}</AnimatePresence>
  </div>;
}

function BuildLog({ replay, onReplay, sound }) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(reduced ? 6 : 0);
  const [done, setDone] = useState(!!reduced);
  useEffect(() => {
    if (reduced) { setProgress(6); setDone(true); return; }
    setDone(false); setProgress(0);
    const timers = delays.map((delay, i) => setTimeout(() => setProgress(i + 1), delay * 1000));
    timers.push(setTimeout(() => { setDone(true); setOpen(false); }, 3100));
    return () => timers.forEach(clearTimeout);
  }, [replay, reduced]);
  return <div className="build-log">
    <div className="build-toolbar">
      <button aria-expanded={open} aria-controls="build-steps" className="build-trigger" onClick={() => { setOpen(!open); clickSound(sound); }}>
        <motion.span animate={{ rotate: open ? 90 : 0 }}><ChevronRight size={14} /></motion.span>
        <span className={done ? '' : 'shimmer'}>{done ? 'Built in 3s' : 'Thinking'}</span>
        {!done && <span className="mono small">{progress === 0 ? '0.0' : delays[progress - 1].toFixed(1)}s</span>}
      </button>
      {done && <motion.button className="replay mono" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => { setOpen(true); onReplay(); clickSound(sound); }}>REPLAY</motion.button>}
    </div>
    <AnimatePresence initial={false}>{open && <motion.ol className="build-steps" id="build-steps" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring}>
      {buildSteps.map((step, i) => <li key={step} className={!done && i >= progress ? 'pending' : ''}><span className="step-dot" /><span>{i === 3 && (done || progress > i) ? 'Connected · 3 here' : step}{i === 3 && (done || progress > i) && <span className="build-peers">{demo.visitors.map(v => <span key={v.name}><i style={{ background: v.color }} />{v.name}</span>)}</span>}</span></li>)}
    </motion.ol>}</AnimatePresence>
  </div>;
}

function Prompt({ onSubmit, replay, sound }) {
  const [length, setLength] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [sending, setSending] = useState(false);
  const reduced = useReducedMotion();
  const arrowRef = useRef(null), timerRef = useRef(null);
  const x = useSpring(0, { stiffness: 260, damping: 20, mass: 0.6 });
  const y = useSpring(0, { stiffness: 260, damping: 20, mass: 0.6 });
  const rotate = useSpring(0, { stiffness: 260, damping: 20, mass: 0.6 });
  useEffect(() => {
    setLength(reduced ? prompt.length : 0); setSending(false);
    let interval;
    const timer = setTimeout(() => { interval = setInterval(() => setLength(n => { if (n >= prompt.length) { clearInterval(interval); return n; } return n + 1; }), 75); }, reduced ? 0 : 2600);
    return () => { clearTimeout(timer); clearInterval(interval); clearTimeout(timerRef.current); };
  }, [replay, reduced]);
  const submit = useCallback(() => {
    if (sending) return;
    setLength(prompt.length); setSending(true); clickSound(sound, 0.4);
    timerRef.current = setTimeout(onSubmit, reduced ? 0 : 280);
  }, [sending, sound, onSubmit, reduced]);
  useEffect(() => {
    const enter = event => {
      if (event.key === 'Enter' && !event.repeat && !event.metaKey && !event.ctrlKey && !event.altKey && !event.target.closest('a,button,input,textarea,select,[role="dialog"]')) { event.preventDefault(); submit(); }
    };
    window.addEventListener('keydown', enter); return () => window.removeEventListener('keydown', enter);
  }, [submit]);
  return <div className="prompt-wrapper" onPointerEnter={event => { if (event.pointerType === 'mouse') setHovered(true); }} onPointerLeave={() => { setHovered(false); x.set(0); y.set(0); rotate.set(0); }}
    onPointerMove={event => {
      if (reduced || event.pointerType !== 'mouse' || !arrowRef.current) return;
      const box = arrowRef.current.getBoundingClientRect();
      const dx = event.clientX - box.left - box.width / 2, dy = event.clientY - box.top - box.height / 2;
      x.set(Math.max(-10, Math.min(10, dx * 0.18))); y.set(Math.max(-4, Math.min(4, dy * 0.18)));
      rotate.set(Math.atan2(dy, dx) * 180 / Math.PI + 90);
    }}>
    <AnimatePresence>{hovered && !sending && <div className="prompt-previews" aria-hidden="true">{projects.map((project, i) => <motion.span key={project.id} initial={{ y: 22, opacity: 0, rotate: 0 }} animate={{ y: 0, opacity: 1, rotate: [-4, 1, 5][i] }} exit={{ y: 22, opacity: 0, rotate: 0 }} transition={{ type: 'spring', duration: 0.5, bounce: 0.35, delay: i * 0.05 }}><img src={project.image} alt="" />{project.name}</motion.span>)}</div>}</AnimatePresence>
    <motion.button className="prompt" onClick={submit} disabled={sending} aria-label="Show me your projects" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduced ? 0 : 2.3, duration: 0.5 }}>
      <span className="prompt-text" style={{ viewTransitionName: 'prompt-message' }}>{length ? prompt.slice(0, length) : <span className="muted">Ask me something…</span>}{!sending && <span className="caret" />}</span>
      <motion.span ref={arrowRef} className="send" style={{ x, y }} whileTap={{ scale: 0.94 }}><motion.span style={{ rotate: sending ? 0 : rotate }}>{sending ? <LoaderCircle size={18} className="spinner" /> : <ArrowUp size={19} />}</motion.span></motion.span>
    </motion.button>
    <motion.p className="prompt-hint mono" initial={{ opacity: 0 }} animate={{ opacity: length === prompt.length && !sending ? 1 : 0 }}>PRESS ↵ TO SEND</motion.p>
  </div>;
}

function Home({ onProjects, sound, setSound }) {
  const [replay, setReplay] = useState(0);
  const reduced = useReducedMotion();
  const show = (delay, y = 0) => ({ initial: { opacity: 0, y: reduced ? 0 : y }, animate: { opacity: 1, y: 0 }, transition: { delay: reduced ? 0 : delay, duration: reduced ? 0 : 0.55 } });
  return <main className="home column" key={replay}>
    <BuildLog replay={replay} onReplay={() => setReplay(n => n + 1)} sound={sound} />
    <div className="identity-row">
      <motion.img className="portrait" src={profile.photo} alt="Profile photo placeholder" width="44" height="44" {...show(0.65, 5)} />
      <motion.div {...show(1.75)}><Presence sound={sound} /></motion.div>
    </div>
    <section className="intro" aria-labelledby="name">
      <h1 id="name"><WordReveal text={`Hey, I'm ${profile.name}`} delay={0.2} /></h1>
      <motion.p className="subtitle" {...show(0.5)}>{profile.role} based in {profile.location}</motion.p>
      <p className="bio"><WordReveal text="Currently, I'm building things at" delay={1} />{' '}<motion.span className="company-mention" {...show(1.2)}><a href={profile.companyUrl} target="_blank" rel="noreferrer" className="company-link">{profile.company}</a>.</motion.span>{' '}<WordReveal text={profile.introduction} delay={1.3} /></p>
    </section>
    <motion.div className="map-section" {...show(1.85)}><Suspense fallback={<div className="map-loading" aria-label="Loading map" />}><WorldMap replay={replay} /></Suspense></motion.div>
    <section className="community" aria-labelledby="community-title">
      <h2 id="community-title"><WordReveal text="You're in good company" delay={2.05} /><span className="demo-tag mono">DEMO</span></h2>
      <motion.p className="muted" {...show(2.1)}><Count to={demo.people} delay={2.05} /> people from <Count to={demo.countries} delay={2.05} /> countries have wandered through here. A small world, after all.</motion.p>
    </section>
    <Prompt onSubmit={onProjects} replay={replay} sound={sound} />
    <motion.footer {...show(2.55)}>
      <p>Say hi <span className="wave" aria-hidden="true">✋</span> via <a href={`mailto:${profile.email}`}>email</a> or <a href={profile.socialUrl} target="_blank" rel="noreferrer">{profile.socialLabel}</a>.</p>
      <div className="footer-meta"><Clock /><button className="sound-toggle" aria-label={sound ? 'Mute interaction sounds' : 'Enable interaction sounds'} aria-pressed={sound} onClick={() => { setSound(!sound); clickSound(!sound); }}>{sound ? <Volume2 size={14} /> : <VolumeX size={14} />}</button></div>
    </motion.footer>
  </main>;
}

function ProjectCard({ project, index, sound }) {
  const [active, setActive] = useState(false), [step, setStep] = useState(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    setStep(reduced ? project.steps.length : 0);
    if (!active || reduced) return;
    const timers = project.steps.map((_, i) => setTimeout(() => setStep(i + 1), 420 * (i + 1)));
    return () => timers.forEach(clearTimeout);
  }, [active, project.steps, reduced]);
  return <motion.a className="project-card" href={project.href} target="_blank" rel="noreferrer" aria-label={`${project.name} — open placeholder project in a new tab`}
    onMouseEnter={() => setActive(true)} onMouseLeave={() => setActive(false)} onFocus={() => setActive(true)} onBlur={() => setActive(false)}
    onClick={() => clickSound(sound)}
    initial={{ opacity: 0, x: reduced ? 0 : 24, y: reduced ? 0 : 8, scale: reduced ? 1 : 0.97, filter: reduced ? 'none' : 'blur(8px)' }} animate={{ opacity: 1, x: 0, y: 0, scale: 1, filter: 'blur(0px)' }} transition={{ type: 'spring', duration: reduced ? 0 : 0.8, bounce: 0.1, delay: reduced ? 0 : 0.45 + index * 0.1 }}>
    <div className="project-media"><img src={project.image} alt={`Neutral image placeholder for ${project.name}`} width="1056" height="720" />
      <AnimatePresence>{active && <motion.div className="project-overlay" initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: 6 }} transition={spring}>
        <AnimatePresence mode="wait" initial={false}>{step >= project.steps.length ? <motion.span className="project-destination" key="destination" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><Globe2 size={14} />{project.linkLabel}<ArrowUpRight size={14} /></motion.span> : <motion.ol key="steps" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{project.steps.map((text, i) => <li key={text} className={i < step ? 'completed' : i === step ? 'shimmer' : 'pending'}>{i < step ? <Check size={11} /> : i === step ? <LoaderCircle size={11} className="spinner" /> : <span className="tiny-dot" />}{text}</li>)}</motion.ol>}</AnimatePresence>
      </motion.div>}</AnimatePresence>
    </div>
    <p className="project-caption"><span>{project.name}</span> <span className="muted">{project.description}</span></p>
  </motion.a>;
}

function Projects({ onBack, sound }) {
  const [ready, setReady] = useState(false);
  const reduced = useReducedMotion(), rail = useRef(null);
  useEffect(() => { const timer = setTimeout(() => setReady(true), reduced ? 0 : 900); return () => clearTimeout(timer); }, [reduced]);
  useEffect(() => {
    const key = event => { if (event.key === 'Escape') onBack(); };
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  }, [onBack]);
  useEffect(() => {
    if (!ready) return;
    const element = rail.current;
    const wheel = event => {
      if (event.ctrlKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : 1);
      if ((delta > 0 && element.scrollLeft < element.scrollWidth - element.clientWidth - 1) || (delta < 0 && element.scrollLeft > 0)) { event.preventDefault(); element.scrollLeft += delta; }
    };
    element.addEventListener('wheel', wheel, { passive: false });
    return () => element.removeEventListener('wheel', wheel);
  }, [ready]);
  return <main className="projects-page">
    <h1 className="sr-only">Selected projects</h1>
    <div className="column">
      <button className="back-button" onClick={() => { clickSound(sound); onBack(); }}><ArrowLeft size={16} />Back<span className="mono">ESC</span></button>
      <div className="message-row"><motion.p className="message-author" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduced ? 0 : 0.3 }}>You <span className="mono">DEMO</span></motion.p><p className="message" style={{ viewTransitionName: 'prompt-message' }}>{prompt}</p></div>
      <p className="thinking" role="status">{ready ? <span className="tiny-dot" /> : <LoaderCircle className="spinner" size={12} />}<span className={ready ? '' : 'shimmer'}>{ready ? `Found ${projects.length} projects` : 'Thinking'}</span></p>
      {ready && <p className="projects-intro"><WordReveal text="Here are a few things I've been working on. Hover or focus on one to explore the details, click to take a closer look." /></p>}
    </div>
    {ready && <><div className="project-rail" ref={rail} aria-label="Selected projects">{projects.map((project, i) => <ProjectCard project={project} index={i} key={project.id} sound={sound} />)}</div><div className="gallery-controls column"><span className="mono">3 SELECTED PROJECTS</span><div><button aria-label="Previous project" onClick={() => rail.current.scrollBy({ left: -rail.current.querySelector('.project-card').offsetWidth - 20, behavior: reduced ? 'instant' : 'smooth' })}><ChevronLeft size={16} /></button><button aria-label="Next project" onClick={() => rail.current.scrollBy({ left: rail.current.querySelector('.project-card').offsetWidth + 20, behavior: reduced ? 'instant' : 'smooth' })}><ChevronRight size={16} /></button></div></div></>}
  </main>;
}

export default function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [sound, setSound] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => { const change = () => setPath(window.location.pathname); window.addEventListener('popstate', change); return () => window.removeEventListener('popstate', change); }, []);
  const navigate = useCallback(next => {
    const update = () => { window.history.pushState({}, '', next); flushSync(() => setPath(next)); window.scrollTo(0, 0); };
    if (document.startViewTransition && !reduced) document.startViewTransition(update); else update();
  }, [reduced]);
  const home = useCallback(() => navigate('/'), [navigate]);
  const work = useCallback(() => navigate('/projects'), [navigate]);
  if (path !== '/' && path !== '/projects') return <main className="not-found column"><p className="mono muted">404</p><h1>A little off the beaten path.</h1><button className="back-button" onClick={home}><ArrowLeft size={16} />Back home</button></main>;
  return path === '/projects' ? <Projects onBack={home} sound={sound} /> : <Home onProjects={work} sound={sound} setSound={setSound} />;
}
