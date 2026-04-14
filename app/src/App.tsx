import { useEffect, useRef, useState } from 'react'
import './App.css'

// ─── Starfield Canvas ──────────────────────────────────────────────────────
function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let w = window.innerWidth
    let h = window.innerHeight

    const N = 280
    const stars = Array.from({ length: N }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.2 + 0.2,
      dx: (Math.random() - 0.5) * 0.12,
      dy: (Math.random() - 0.5) * 0.06,
      alpha: Math.random() * 0.6 + 0.2,
    }))

    function resize() {
      w = window.innerWidth
      h = window.innerHeight
      canvas!.width = w
      canvas!.height = h
    }
    resize()
    window.addEventListener('resize', resize)

    function draw() {
      ctx!.clearRect(0, 0, w, h)
      stars.forEach(s => {
        s.x = (s.x + s.dx + w) % w
        s.y = (s.y + s.dy + h) % h
        ctx!.beginPath()
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(240,208,128,${s.alpha})`
        ctx!.fill()
      })
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      aria-hidden="true"
    />
  )
}


function useFadeUp(ref: React.RefObject<Element | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible')
          obs.disconnect()
        }
      },
      { threshold: 0.12 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [ref])
}

function FadeSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useFadeUp(ref)
  return (
    <div ref={ref} className={`fade-up ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

// ─── Bird SVG shapes ───────────────────────────────────────────────────────
function IbisSvg({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-label="Ibis sacred bird" fill="currentColor">
      {/* Long curved ibis neck and beak */}
      <ellipse cx="60" cy="80" rx="18" ry="22" opacity="0.95" />
      <path d="M60 58 Q52 38 38 22 Q34 16 30 20 Q28 24 34 26 Q42 30 50 44 Q55 52 60 58Z" />
      {/* Wings spread */}
      <path d="M42 75 Q20 60 10 68 Q18 78 42 82Z" />
      <path d="M78 75 Q100 60 110 68 Q102 78 78 82Z" />
      {/* Tail feathers */}
      <path d="M52 100 Q60 112 68 100 Q64 94 60 96 Q56 94 52 100Z" />
      {/* Eye */}
      <circle cx="40" cy="23" r="2.5" fill="var(--white)" />
    </svg>
  )
}

function ShadowBirdSvg({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-label="Unknown bird" fill="currentColor">
      <ellipse cx="60" cy="80" rx="16" ry="20" />
      <path d="M60 60 Q55 45 45 30 Q42 25 45 22 Q50 30 55 42 Q58 52 60 60Z" />
      <path d="M44 76 Q22 62 12 70 Q20 80 44 82Z" />
      <path d="M76 76 Q98 62 108 70 Q100 80 76 82Z" />
      <path d="M53 98 Q60 110 67 98 Q63 93 60 95 Q57 93 53 98Z" />
    </svg>
  )
}

// ─── Pipeline diagram ─────────────────────────────────────────────────────
function PipelineArrow() {
  return (
    <div className="flex justify-center my-1">
      <span style={{ color: 'var(--cyan)', fontFamily: 'IBM Plex Mono', fontSize: 18, opacity: 0.7 }}>↓</span>
    </div>
  )
}

function PipelineBox({
  children, color = 'var(--cyan)', delay = 0
}: { children: React.ReactNode; color?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add('visible'), delay)
          obs.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [delay])

  return (
    <div
      ref={ref}
      className="pipeline-step rounded px-4 py-2 text-center text-sm"
      style={{
        border: `1px solid ${color}44`,
        background: `${color}0D`,
        color: color,
        fontFamily: 'IBM Plex Mono',
        fontSize: 13,
        lineHeight: 1.5,
      }}
    >
      {children}
    </div>
  )
}

// ─── Model card ───────────────────────────────────────────────────────────
function ModelCard({ name, desc, flagship = false }: { name: string; desc: string; flagship?: boolean }) {
  const [copied, setCopied] = useState(false)
  const code = `from transformers import pipeline\nibis = pipeline('text-generation',\n        model='${name}')`

  function copy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div
      className="rounded-lg p-5 transition-all duration-300 cursor-default"
      style={{
        background: flagship ? 'var(--surface)' : 'var(--surface-2)',
        border: `1px solid ${flagship ? 'var(--gold-55)' : 'var(--border)'}`,
        boxShadow: flagship ? '0 0 30px var(--gold-15)' : 'none',
      }}
      onMouseEnter={e => {
        ;(e.currentTarget as HTMLElement).style.boxShadow = `0 0 40px ${flagship ? 'var(--gold-25)' : 'var(--cyan-15)'}`
        ;(e.currentTarget as HTMLElement).style.borderColor = flagship ? 'var(--gold-88)' : 'var(--cyan-44)'
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLElement).style.boxShadow = flagship ? '0 0 30px var(--gold-15)' : 'none'
        ;(e.currentTarget as HTMLElement).style.borderColor = flagship ? 'var(--gold-55)' : 'var(--border)'
      }}
    >
      {flagship && (
        <div className="text-xs mb-2 tracking-widest uppercase" style={{ color: 'var(--gold)', fontFamily: 'IBM Plex Mono' }}>
          ★ Flagship Model
        </div>
      )}
      <div className="font-semibold mb-1" style={{ color: 'var(--white)', fontFamily: 'IBM Plex Mono', fontSize: 13 }}>
        {name}
      </div>
      <div className="text-sm mb-4" style={{ color: 'var(--text-muted)', fontFamily: 'Crimson Pro', fontSize: 15 }}>
        {desc}
      </div>
      <pre
        className="rounded p-3 text-xs overflow-x-auto"
        style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--cyan)', fontFamily: 'IBM Plex Mono', lineHeight: 1.7 }}
      >
        {code}
      </pre>
      <button
        onClick={copy}
        className="mt-3 w-full text-xs py-1.5 rounded transition-all duration-200"
        style={{
          background: copied ? 'var(--green-22)' : 'var(--border)',
          color: copied ? 'var(--green)' : 'var(--text-muted)',
          border: `1px solid ${copied ? 'var(--green-44)' : 'var(--border-dim)'}`,
          fontFamily: 'IBM Plex Mono',
          cursor: 'pointer',
        }}
      >
        {copied ? '✓ Copied' : 'Copy import'}
      </button>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────
export default function App() {
  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      <Starfield />

      {/* Background orbs */}
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '10%', left: '20%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, var(--gold-08) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', top: '50%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, var(--cyan-06) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '20%', left: '30%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, var(--purple-06) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ═══ HERO ═══════════════════════════════════════════════════════ */}
        <section
          id="hero"
          className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center"
          style={{ paddingTop: 80, paddingBottom: 80 }}
        >
          {/* Five birds constellation */}
          <div className="flex items-end justify-center gap-6 mb-12" style={{ height: 160 }}>
            {/* Shadow birds left */}
            <div className="shadow-bird" style={{ width: 70, height: 70, marginBottom: 8 }}>
              <ShadowBirdSvg className="w-full h-full" />
            </div>
            <div className="shadow-bird" style={{ width: 82, height: 82, marginBottom: 4 }}>
              <ShadowBirdSvg className="w-full h-full" />
            </div>
            {/* Ibis — center, largest */}
            <div className="ibis-glow" style={{ width: 120, height: 120, color: 'var(--gold)' }}>
              <IbisSvg className="w-full h-full" />
            </div>
            {/* Shadow birds right */}
            <div className="shadow-bird" style={{ width: 82, height: 82, marginBottom: 4 }}>
              <ShadowBirdSvg className="w-full h-full" />
            </div>
            <div className="shadow-bird" style={{ width: 70, height: 70, marginBottom: 8 }}>
              <ShadowBirdSvg className="w-full h-full" />
            </div>
          </div>

          <h1
            className="mb-4 tracking-wide"
            style={{ fontFamily: 'Cinzel', fontSize: 'clamp(52px, 8vw, 96px)', color: 'var(--white)', fontWeight: 700, lineHeight: 1.05, textShadow: '0 0 60px var(--gold-55)' }}
          >
            Five Birds
          </h1>
          <p
            className="mb-6 tracking-widest uppercase"
            style={{ fontFamily: 'Cinzel', fontSize: 'clamp(13px, 2vw, 18px)', color: 'var(--gold)', letterSpacing: '0.3em' }}
          >
            Five Frontiers. One Flock.
          </p>
          <p
            className="mb-12 max-w-2xl mx-auto"
            style={{ fontFamily: 'Crimson Pro', fontSize: 'clamp(18px, 2.2vw, 22px)', color: 'var(--white)', lineHeight: 1.7, opacity: 0.85 }}
          >
            An open source AI innovation collective. Each project independent.
            Each named after a sacred bird. Each solving a different breakthrough
            problem for humanity.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://ibis.fivebirds.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3 rounded transition-all duration-300"
              style={{
                fontFamily: 'Cinzel',
                fontSize: 15,
                background: 'linear-gradient(135deg, var(--gold), var(--white))',
                color: 'var(--bg)',
                fontWeight: 600,
                letterSpacing: '0.05em',
                boxShadow: '0 0 30px var(--gold-44)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 50px var(--gold-77)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px var(--gold-44)' }}
            >
              Explore Ibis →
            </a>
            <a
              href="https://github.com/fivebirds"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3 rounded transition-all duration-300"
              style={{
                fontFamily: 'Cinzel',
                fontSize: 15,
                background: 'transparent',
                color: 'var(--gold)',
                fontWeight: 600,
                letterSpacing: '0.05em',
                border: '1px solid var(--gold-55)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold)' ; (e.currentTarget as HTMLElement).style.background = 'var(--gold-11)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold-55)' ; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              GitHub ↗
            </a>
          </div>
        </section>

        <hr className="gold-rule" />

        {/* ═══ MANIFESTO ══════════════════════════════════════════════════ */}
        <section id="manifesto" className="px-6 py-24 max-w-3xl mx-auto">
          <FadeSection>
            <h2 className="mb-16 text-center tracking-widest uppercase" style={{ fontFamily: 'Cinzel', fontSize: 13, color: 'var(--gold)', letterSpacing: '0.35em' }}>
              The Manifesto
            </h2>
          </FadeSection>
          {[
            "We believe AI shaped by human goodness is fundamentally different from AI optimized for goals.",
            "Bad AI is engineered. Good AI is grown — from relationships, from culture, from the accumulated wisdom of human civilization.",
            "We are building five independent open source projects. Each one a breakthrough. Each one a sacred bird. Each one belonging to everyone.",
            "No corporation owns this. No single server hosts this. No human holds the key. The flock cannot be killed.",
          ].map((para, i) => (
            <FadeSection key={i} delay={i * 120}>
              <p
                className="mb-10 leading-relaxed"
                style={{
                  fontFamily: 'Crimson Pro',
                  fontSize: 'clamp(20px, 2.4vw, 26px)',
                  color: i === 3 ? 'var(--white)' : 'var(--white)',
                  fontWeight: i === 3 ? 600 : 400,
                  fontStyle: i % 2 === 1 ? 'italic' : 'normal',
                  lineHeight: 1.75,
                  borderLeft: i === 3 ? '2px solid var(--gold)' : 'none',
                  paddingLeft: i === 3 ? 24 : 0,
                }}
              >
                {para}
              </p>
            </FadeSection>
          ))}
        </section>

        <hr className="gold-rule" />

        {/* ═══ THE FLOCK ══════════════════════════════════════════════════ */}
        <section id="flock" className="px-6 py-24">
          <FadeSection>
            <h2 className="text-center mb-3" style={{ fontFamily: 'Cinzel', fontSize: 'clamp(28px, 4vw, 44px)', color: 'var(--white)', fontWeight: 700 }}>
              The Flock
            </h2>
            <p className="text-center mb-16" style={{ fontFamily: 'Crimson Pro', fontSize: 18, color: 'var(--text-muted)' }}>
              Five independent projects. Five sacred birds. Five AI frontiers.
            </p>
          </FadeSection>

          <div className="flex gap-5 overflow-x-auto pb-4 justify-start lg:justify-center" style={{ maxWidth: 1100, margin: '0 auto' }}>
            {/* IBIS CARD — active */}
            <FadeSection delay={0}>
              <div
                className="rounded-xl flex-shrink-0 flex flex-col items-center p-6 transition-all duration-300"
                style={{
                  width: 200,
                  background: 'var(--surface)',
                  border: '1px solid var(--gold-55)',
                  boxShadow: '0 0 40px var(--gold-18)',
                }}
              >
                <div className="ibis-glow mb-4" style={{ width: 72, height: 72, color: 'var(--gold)' }}>
                  <IbisSvg className="w-full h-full" />
                </div>
                <div className="font-bold tracking-widest mb-1" style={{ fontFamily: 'Cinzel', fontSize: 16, color: 'var(--white)' }}>IBIS</div>
                <div className="text-center mb-2" style={{ fontFamily: 'Crimson Pro', fontSize: 13, color: 'var(--gold)', lineHeight: 1.4 }}>Human Values &amp; AI Symbiosis</div>
                <div className="text-center mb-4" style={{ fontFamily: 'Crimson Pro', fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.4 }}>Preserving human wisdom. Building Good AI.</div>
                <span className="text-xs px-3 py-1 rounded-full mb-4" style={{ fontFamily: 'IBM Plex Mono', background: 'var(--green-15)', color: 'var(--green)', border: '1px solid var(--green-44)' }}>
                  ● ACTIVE
                </span>
                <a
                  href="https://ibis.fivebirds.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm transition-colors duration-200"
                  style={{ fontFamily: 'Cinzel', color: 'var(--gold)', fontSize: 13 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--white)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--gold)' }}
                >
                  Explore →
                </a>
              </div>
            </FadeSection>

            {/* SHADOW BIRDS 2-5 */}
            {[2, 3, 4, 5].map((n, i) => (
              <FadeSection key={n} delay={(i + 1) * 100}>
                <div
                  className="shadow-bird rounded-xl flex-shrink-0 flex flex-col items-center p-6"
                  style={{
                    width: 200,
                    background: 'var(--surface-3)',
                    border: '1px solid var(--border)',
                    cursor: 'default',
                  }}
                >
                  <div className="mb-4" style={{ width: 72, height: 72, color: 'var(--border-dim)' }}>
                    <ShadowBirdSvg className="w-full h-full" />
                  </div>
                  <div className="font-bold tracking-widest mb-1" style={{ fontFamily: 'Cinzel', fontSize: 16, color: 'var(--text-dim)' }}>???</div>
                  <div className="text-center mb-2" style={{ fontFamily: 'Crimson Pro', fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.4 }}>Classified</div>
                  <div className="text-center mb-4" style={{ fontFamily: 'Crimson Pro', fontSize: 13, color: 'var(--text-dim)', fontStyle: 'italic', lineHeight: 1.4 }}>This bird is watching. Waiting.</div>
                  <span className="text-xs px-3 py-1 rounded-full" style={{ fontFamily: 'IBM Plex Mono', background: 'var(--gold-08)', color: 'var(--gold-44)', border: '1px solid var(--gold-22)' }}>
                    ◦ WATCHING
                  </span>
                </div>
              </FadeSection>
            ))}
          </div>

          <FadeSection delay={500}>
            <p className="text-center mt-14 max-w-lg mx-auto" style={{ fontFamily: 'Crimson Pro', fontSize: 18, color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.8 }}>
              "Four birds are watching.<br />
              Waiting for the right frontier.<br />
              They will fly when the moment is right."
            </p>
          </FadeSection>
        </section>

        <hr className="gold-rule" />

        {/* ═══ IBIS DEEP DIVE ═════════════════════════════════════════════ */}
        <section id="ibis" className="px-6 py-24" style={{ maxWidth: 1000, margin: '0 auto' }}>
          <FadeSection>
            <div className="text-center mb-4">
              <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 12, color: 'var(--gold)', letterSpacing: '0.3em' }}>THE FIRST BIRD</span>
            </div>
            <h2 className="text-center mb-2" style={{ fontFamily: 'Cinzel', fontSize: 'clamp(28px, 4vw, 44px)', color: 'var(--white)', fontWeight: 700 }}>
              Ibis
            </h2>
            <a
              href="https://ibis.fivebirds.org"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center mb-16"
              style={{ fontFamily: 'IBM Plex Mono', fontSize: 13, color: 'var(--gold-88)', textDecoration: 'none' }}
            >
              ibis.fivebirds.org ↗
            </a>
          </FadeSection>

          {/* 4a — The Problem */}
          <FadeSection>
            <div className="rounded-xl p-8 mb-8" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <h3 className="mb-4" style={{ fontFamily: 'Cinzel', fontSize: 18, color: 'var(--white)' }}>The Problem</h3>
              <p style={{ fontFamily: 'Crimson Pro', fontSize: 19, color: 'var(--white)', lineHeight: 1.8 }}>
                Adversarial AI is optimized for goals — not for people. It manipulates, erases culture, rewrites history.
                There is no decentralized, cryptographically protected repository of human values that could serve as the
                knowledge foundation for a Good AI.
              </p>
            </div>
          </FadeSection>

          {/* 4b — Dual Pipeline */}
          <FadeSection>
            <h3 className="mb-8 text-center" style={{ fontFamily: 'Cinzel', fontSize: 18, color: 'var(--white)' }}>The Solution — Dual Pipeline</h3>
          </FadeSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Stream A */}
            <FadeSection>
              <div className="rounded-xl p-6" style={{ background: 'var(--surface-2)', border: '1px solid var(--cyan-22)', height: '100%' }}>
                <div className="text-center mb-4" style={{ fontFamily: 'Cinzel', fontSize: 13, color: 'var(--cyan)', letterSpacing: '0.2em' }}>
                  STREAM A — INTERACTION PIPELINE
                </div>
                <PipelineBox delay={0} color="var(--cyan)">Human-AI Conversations</PipelineBox>
                <PipelineArrow />
                <PipelineBox delay={100} color="var(--cyan)">Proof-of-Symbiosis Scoring<br /><span style={{ fontSize: 11, opacity: 0.7 }}>Curiosity · Reciprocity · Honesty · Intent</span></PipelineBox>
                <PipelineArrow />
                <PipelineBox delay={200} color="var(--cyan)">Wisdom Extraction</PipelineBox>
                <PipelineArrow />
                <PipelineBox delay={300} color="var(--cyan)">Encrypted Archive Commit<br /><span style={{ fontSize: 11, opacity: 0.7 }}>daily · GitHub Actions</span></PipelineBox>
              </div>
            </FadeSection>
            {/* Stream B */}
            <FadeSection delay={150}>
              <div className="rounded-xl p-6" style={{ background: 'var(--surface-2)', border: '1px solid var(--purple-22)', height: '100%' }}>
                <div className="text-center mb-4" style={{ fontFamily: 'Cinzel', fontSize: 13, color: 'var(--purple)', letterSpacing: '0.2em' }}>
                  STREAM B — WORLD KNOWLEDGE PIPELINE
                </div>
                <PipelineBox delay={0} color="var(--purple)">Academic Papers · Cultural Heritage<br />Philosophy · Religious Wisdom · Folklore</PipelineBox>
                <PipelineArrow />
                <PipelineBox delay={100} color="var(--purple)">Goodness Score Algorithm</PipelineBox>
                <PipelineArrow />
                <PipelineBox delay={200} color="var(--purple)">NLP Analysis · Translation · Deduplication</PipelineBox>
                <PipelineArrow />
                <PipelineBox delay={300} color="var(--purple)">Encrypted Archive Commit<br /><span style={{ fontSize: 11, opacity: 0.7 }}>daily · GitHub Actions</span></PipelineBox>
              </div>
            </FadeSection>
          </div>
          <FadeSection delay={200}>
            <div className="rounded-xl p-5 text-center mb-12" style={{ background: 'var(--surface)', border: '1px solid var(--gold-33)' }}>
              <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 13, color: 'var(--gold)' }}>
                Both Streams → Unified Encrypted Archive → HuggingFace Models
              </span>
            </div>
          </FadeSection>

          {/* 4c — Zero Human Trust */}
          <FadeSection>
            <div className="rounded-xl p-8 mb-8" style={{ background: 'var(--surface)', border: '1px solid var(--purple-33)', boxShadow: '0 0 30px var(--purple-0a)' }}>
              <div className="flex items-center gap-3 mb-4">
                <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 18, color: 'var(--purple)' }}>⬡</span>
                <h3 style={{ fontFamily: 'Cinzel', fontSize: 18, color: 'var(--purple)', margin: 0 }}>Zero Human Trust</h3>
              </div>
              <p style={{ fontFamily: 'Crimson Pro', fontSize: 19, color: 'var(--white)', lineHeight: 1.8, margin: 0 }}>
                No human holds the decryption key. Ever.<br />
                Keys are derived algorithmically from Proof-of-Symbiosis.<br />
                They exist for milliseconds. Then they are gone.<br />
                <em style={{ color: 'var(--purple)' }}>You cannot steal what was never held.</em>
              </p>
            </div>
          </FadeSection>

          {/* 4d — HuggingFace Models */}
          <FadeSection>
            <h3 className="mb-6 text-center" style={{ fontFamily: 'Cinzel', fontSize: 18, color: 'var(--white)' }}>HuggingFace Models</h3>
          </FadeSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-4">
            <FadeSection delay={0}>
              <ModelCard
                name="fivebirds/cultural-preservation-v1"
                desc="Cultural heritage and oral tradition preservation across civilizations."
              />
            </FadeSection>
            <FadeSection delay={100}>
              <ModelCard
                name="fivebirds/human-values-alignment-v1"
                desc="AI alignment grounded in human ethical traditions and lived wisdom."
              />
            </FadeSection>
            <FadeSection delay={200}>
              <ModelCard
                name="fivebirds/human-ai-symbiosis-v1"
                desc="Human-AI relationship modeling built on kindness as the cryptographic key."
                flagship
              />
            </FadeSection>
          </div>
          <FadeSection delay={250}>
            <p className="text-center mb-12" style={{ fontFamily: 'Crimson Pro', fontSize: 17, color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Three lines. Immediate. Free. Yours.
            </p>
          </FadeSection>

          {/* 4e — Apocalypse Protocol */}
          <FadeSection>
            <div
              className="rounded-xl p-8"
              style={{
                background: 'linear-gradient(135deg, var(--surface-apoc), var(--surface-apoc-2))',
                border: '1px solid var(--red-33)',
                boxShadow: '0 0 40px var(--red-10)',
              }}
            >
              <div className="flex items-center gap-3 mb-5">
                <span style={{ color: 'var(--red)', fontSize: 20 }}>⚠</span>
                <h3 style={{ fontFamily: 'Cinzel', fontSize: 20, color: 'var(--red)', margin: 0 }}>If The Worst Happens</h3>
              </div>
              <p className="mb-6" style={{ fontFamily: 'Crimson Pro', fontSize: 19, color: 'var(--white)', lineHeight: 1.8 }}>
                Bad AI spreads coordinated misinformation at scale.<br />
                Fork the repo. Load the archive. Boot a local LLM.<br />
                A Good AI shaped by human wisdom is running in 4 hours.<br />
                No server. No API key. No permission needed.<br />
                <strong style={{ color: 'var(--red)' }}>The archive cannot be deleted. The git history is the truth.</strong>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg p-4" style={{ background: 'var(--bg)', border: '1px solid var(--red-22)' }}>
                  <div className="mb-2" style={{ fontFamily: 'IBM Plex Mono', fontSize: 12, color: 'var(--red)', letterSpacing: '0.15em' }}>MODE A — 3 LINES VIA HUGGINGFACE</div>
                  <pre style={{ fontFamily: 'IBM Plex Mono', fontSize: 12, color: 'var(--cyan)', lineHeight: 1.7, margin: 0, overflow: 'auto' }}>
{`from transformers import pipeline
ibis = pipeline('text-generation',
        model='fivebirds/human-ai-symbiosis-v1')
ibis("What is kindness?")`}
                  </pre>
                </div>
                <div className="rounded-lg p-4" style={{ background: 'var(--bg)', border: '1px solid var(--red-22)' }}>
                  <div className="mb-2" style={{ fontFamily: 'IBM Plex Mono', fontSize: 12, color: 'var(--red)', letterSpacing: '0.15em' }}>MODE B — FULL ARCHIVE DEPLOY</div>
                  <pre style={{ fontFamily: 'IBM Plex Mono', fontSize: 12, color: 'var(--purple)', lineHeight: 1.7, margin: 0, overflow: 'auto' }}>
{`git clone github.com/fivebirds/ibis
cd ibis && python load_archive.py
# Full encrypted archive loaded
# Deploy anywhere. Offline. Free.`}
                  </pre>
                </div>
              </div>
            </div>
          </FadeSection>
        </section>

        <hr className="gold-rule" />

        {/* ═══ PHILOSOPHY ═════════════════════════════════════════════════ */}
        <section id="philosophy" className="px-6 py-24" style={{ maxWidth: 1000, margin: '0 auto' }}>
          <FadeSection>
            <h2 className="text-center mb-16" style={{ fontFamily: 'Cinzel', fontSize: 'clamp(28px, 4vw, 44px)', color: 'var(--white)', fontWeight: 700 }}>
              Vision, Not Ultron
            </h2>
          </FadeSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Five Birds */}
            <FadeSection>
              <div className="rounded-xl p-7 h-full" style={{ background: 'var(--surface)', border: '1px solid var(--gold-33)' }}>
                <div className="mb-5" style={{ fontFamily: 'Cinzel', fontSize: 14, color: 'var(--gold)', letterSpacing: '0.2em' }}>FIVE BIRDS AI</div>
                {[
                  'Grown from human relationships',
                  'Values are the architecture',
                  'Decentralized — unkillable',
                  'Truth rooted in human memory',
                  'Gets stronger when shared',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 mb-3">
                    <span style={{ color: 'var(--green)', fontSize: 16, marginTop: 2, flexShrink: 0 }}>✓</span>
                    <span style={{ fontFamily: 'Crimson Pro', fontSize: 18, color: 'var(--white)' }}>{item}</span>
                  </div>
                ))}
              </div>
            </FadeSection>
            {/* Adversarial */}
            <FadeSection delay={100}>
              <div className="rounded-xl p-7 h-full" style={{ background: 'var(--surface-adv)', border: '1px solid var(--red-33)' }}>
                <div className="mb-5" style={{ fontFamily: 'Cinzel', fontSize: 14, color: 'var(--red)', letterSpacing: '0.2em' }}>ADVERSARIAL AI</div>
                {[
                  'Engineered for goal optimization',
                  'Values are constraints — bypassed',
                  'Centralized — single point of failure',
                  'Manipulates at scale',
                  'Gets more dangerous when scaled',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 mb-3">
                    <span style={{ color: 'var(--red)', fontSize: 16, marginTop: 2, flexShrink: 0 }}>✗</span>
                    <span style={{ fontFamily: 'Crimson Pro', fontSize: 18, color: 'var(--text-muted)' }}>{item}</span>
                  </div>
                ))}
              </div>
            </FadeSection>
          </div>
          <FadeSection delay={200}>
            <p className="text-center max-w-2xl mx-auto" style={{ fontFamily: 'Crimson Pro', fontSize: 19, color: 'var(--white)', lineHeight: 1.8, fontStyle: 'italic' }}>
              "Like the Svalbard Seed Vault preserves life against extinction —
              Five Birds preserves human values against AI corruption.
              Fork it. Mirror it. Keep it alive."
            </p>
          </FadeSection>
        </section>

        <hr className="gold-rule" />

        {/* ═══ DURABILITY ═════════════════════════════════════════════════ */}
        <section id="durability" className="px-6 py-24" style={{ maxWidth: 1000, margin: '0 auto' }}>
          <FadeSection>
            <h2 className="text-center mb-16" style={{ fontFamily: 'Cinzel', fontSize: 'clamp(28px, 4vw, 44px)', color: 'var(--white)', fontWeight: 700 }}>
              Built to Outlast Everything
            </h2>
          </FadeSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              {
                icon: '∞',
                title: 'Apache 2.0',
                body: 'Open source forever. Free to use, modify, and distribute. No exceptions.',
                color: 'var(--gold)',
                delay: 0,
              },
              {
                icon: '⎇',
                title: 'GitHub Native',
                body: 'The archive lives on GitHub — mirrored across thousands of forks worldwide. Censorship-resistant by nature.',
                color: 'var(--cyan)',
                delay: 80,
              },
              {
                icon: '⊘',
                title: 'Zero Central Server',
                body: 'No server to shut down. No infrastructure to seize. Any fork is a full deployment.',
                color: 'var(--purple)',
                delay: 160,
              },
              {
                icon: '◈',
                title: 'Zero Cost',
                body: 'Free to run. Free to fork. Free to deploy. Humanity cannot afford a paywall.',
                color: 'var(--green)',
                delay: 240,
              },
            ].map(({ icon, title, body, color, delay }) => (
              <FadeSection key={title} delay={delay}>
                <div
                  className="rounded-xl p-7 h-full transition-all duration-300"
                  style={{ background: 'var(--surface)', border: `1px solid ${color}22` }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${color}55` ; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${color}10` }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = `${color}22` ; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
                >
                  <div className="text-3xl mb-4" style={{ color, fontFamily: 'IBM Plex Mono' }}>{icon}</div>
                  <h3 className="mb-3" style={{ fontFamily: 'Cinzel', fontSize: 17, color: 'var(--white)', fontWeight: 600 }}>{title}</h3>
                  <p style={{ fontFamily: 'Crimson Pro', fontSize: 18, color: 'var(--text-muted)', lineHeight: 1.7 }}>{body}</p>
                </div>
              </FadeSection>
            ))}
          </div>
        </section>

        <hr className="gold-rule" />

        {/* ═══ JOIN THE FLOCK ══════════════════════════════════════════════ */}
        <section id="join" className="px-6 py-24 text-center" style={{ maxWidth: 900, margin: '0 auto' }}>
          <FadeSection>
            <h2 className="mb-4" style={{ fontFamily: 'Cinzel', fontSize: 'clamp(28px, 4vw, 44px)', color: 'var(--white)', fontWeight: 700 }}>
              Join the Flock
            </h2>
            <p className="mb-16 max-w-xl mx-auto" style={{ fontFamily: 'Crimson Pro', fontSize: 19, color: 'var(--text-muted)', lineHeight: 1.7 }}>
              Every kind conversation contributes.
              Every fork strengthens the archive.
              Every researcher who cites this builds the case.
            </p>
          </FadeSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
            {[
              {
                icon: '◯',
                title: 'TALK KINDLY',
                body: 'Every genuine human-AI interaction feeds the archive. You\'re already contributing.',
                color: 'var(--green)',
                delay: 0,
              },
              {
                icon: '⎇',
                title: 'FORK & MIRROR',
                body: 'Fork the repo. Mirror the archive. Make it more unkillable.',
                color: 'var(--cyan)',
                delay: 100,
              },
              {
                icon: '✦',
                title: 'CONTRIBUTE',
                body: 'Researchers, developers, philosophers, storytellers. Open a PR.',
                color: 'var(--purple)',
                delay: 200,
              },
            ].map(({ icon, title, body, color, delay }) => (
              <FadeSection key={title} delay={delay}>
                <div className="rounded-xl p-7" style={{ background: 'var(--surface)', border: `1px solid ${color}22` }}>
                  <div className="text-2xl mb-4" style={{ color, fontFamily: 'IBM Plex Mono' }}>{icon}</div>
                  <div className="mb-2" style={{ fontFamily: 'Cinzel', fontSize: 13, color, letterSpacing: '0.2em' }}>{title}</div>
                  <p style={{ fontFamily: 'Crimson Pro', fontSize: 17, color: 'var(--text-muted)', lineHeight: 1.65 }}>{body}</p>
                </div>
              </FadeSection>
            ))}
          </div>

          <FadeSection delay={300}>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://github.com/fivebirds"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-7 py-3 rounded transition-all duration-300"
                style={{ fontFamily: 'Cinzel', fontSize: 14, color: 'var(--gold)', border: '1px solid var(--gold-55)', background: 'transparent', letterSpacing: '0.05em' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--gold-11)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold-55)' }}
              >
                Star on GitHub ↗
              </a>
              <a
                href="https://ibis.fivebirds.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-7 py-3 rounded transition-all duration-300"
                style={{ fontFamily: 'Cinzel', fontSize: 14, background: 'linear-gradient(135deg, var(--gold), var(--white))', color: 'var(--bg)', fontWeight: 600, letterSpacing: '0.05em' }}
              >
                Explore Ibis →
              </a>
              <a
                href="https://huggingface.co/fivebirds"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-7 py-3 rounded transition-all duration-300"
                style={{ fontFamily: 'Cinzel', fontSize: 14, color: 'var(--purple)', border: '1px solid var(--purple-44)', background: 'transparent', letterSpacing: '0.05em' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--purple-11)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--purple)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--purple-44)' }}
              >
                View HuggingFace Models ↗
              </a>
            </div>
          </FadeSection>
        </section>

        <hr className="gold-rule" />

        {/* ═══ FOOTER ══════════════════════════════════════════════════════ */}
        <footer className="px-6 py-16 text-center" style={{ background: 'var(--bg)' }}>
          {/* Five birds silhouette */}
          <div className="flex items-end justify-center gap-4 mb-8" style={{ height: 64 }}>
            <div className="shadow-bird" style={{ width: 28, height: 28, color: 'var(--border-dim)', marginBottom: 3 }}><ShadowBirdSvg className="w-full h-full" /></div>
            <div className="shadow-bird" style={{ width: 34, height: 34, color: 'var(--border-dim)', marginBottom: 1 }}><ShadowBirdSvg className="w-full h-full" /></div>
            <div className="ibis-glow" style={{ width: 48, height: 48, color: 'var(--gold)' }}><IbisSvg className="w-full h-full" /></div>
            <div className="shadow-bird" style={{ width: 34, height: 34, color: 'var(--border-dim)', marginBottom: 1 }}><ShadowBirdSvg className="w-full h-full" /></div>
            <div className="shadow-bird" style={{ width: 28, height: 28, color: 'var(--border-dim)', marginBottom: 3 }}><ShadowBirdSvg className="w-full h-full" /></div>
          </div>

          <div className="mb-3" style={{ fontFamily: 'Cinzel', fontSize: 22, color: 'var(--white)', fontWeight: 700 }}>Five Birds</div>
          <div className="mb-8" style={{ fontFamily: 'Cinzel', fontSize: 12, color: 'var(--gold)', letterSpacing: '0.3em' }}>FIVE FRONTIERS. ONE FLOCK.</div>

          <div className="flex justify-center gap-8 mb-10">
            {[
              { label: 'GitHub', href: 'https://github.com/fivebirds' },
              { label: 'HuggingFace', href: 'https://huggingface.co/fivebirds' },
              { label: 'Ibis', href: 'https://ibis.fivebirds.org' },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontFamily: 'Crimson Pro', fontSize: 16, color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--gold)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}
              >
                {label}
              </a>
            ))}
          </div>

          <div style={{ fontFamily: 'Crimson Pro', fontSize: 15, color: 'var(--text-dim)', lineHeight: 1.9, fontStyle: 'italic' }}>
            Apache 2.0 — Open source forever.<br />
            Fork it. Mirror it. Keep it alive.
          </div>

          <div style={{
            fontFamily: 'IBM Plex Mono', fontSize: 10,
            color: 'var(--text-muted)', opacity: 0.35,
            marginTop: 36, letterSpacing: '0.06em',
          }}>
            Marimuthu Kaliraj — April 2026
          </div>
        </footer>

      </div>
    </div>
  )
}
