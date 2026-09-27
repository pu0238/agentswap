#!/usr/bin/env python3
"""Build the 13 AgentSwap frame sub-compositions from one shared shell.

Every frame: <template> root, full-bleed navy clip, content clip, chrome (wallet tag,
counter, holo progress strip), one paused GSAP timeline registered by frame id.
Reveal times are the real word times from audio_meta.json (hand-picked per cue).
"""
import json, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "compositions" / "frames"
DUR = {int(v["frame"]): v["duration_s"] for v in json.load(open(ROOT / "audio_meta.json"))["voices"]}
TOTAL = sum(DUR.values())
START = {}
acc = 0.0
for n in sorted(DUR):
    START[n] = acc
    acc += DUR[n]

GSAP = '<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>'

def css(p):
    return f"""<style>
  @font-face {{ font-family: "Archivo"; font-weight: 100 900; font-stretch: 62% 125%; src: url("assets/fonts/archivo-latin-wdth-normal.woff2") format("woff2"); }}
  @font-face {{ font-family: "Geist Mono"; font-weight: 500; src: url("assets/fonts/geist-mono-500.woff2") format("woff2"); }}
  #root {{ position: relative; width: 100%; height: 100%; overflow: hidden; font-family: "Archivo", sans-serif; color: #121212; }}
  .{p}-bg {{ position: absolute; inset: 0; background: #DCD3C6; }}
  .{p}-stage {{ position: absolute; inset: 0; }}
  .{p}-disp {{ font-weight: 900; font-stretch: 125%; letter-spacing: -0.04em; line-height: 0.88; text-transform: uppercase; }}
  .{p}-mono {{ font-family: "Geist Mono", monospace; text-transform: uppercase; }}
  .{p}-muted {{ color: #6E685F; }}
  .{p}-deep .{p}-muted {{ color: #9A9287; }}
  .{p}-frame {{ border: 3px solid #121212; }}
  .{p}-deep {{ background: #121212; color: #DCD3C6; }}
  .{p}-green {{ background: #14F195; color: #121212; }}
  .{p}-holo {{ background-image: linear-gradient(115deg,#ff9bd2 0%,#c7a8ff 17%,#8fd3ff 33%,#8dffd6 50%,#f4ff9a 66%,#ffc58f 83%,#ff9bd2 100%); background-size: 300% 300%; background-position: 0% 50%; color: #012136; }}
  .{p}-htext {{ background-image: linear-gradient(100deg,#ff9bd2,#c7a8ff,#8fd3ff,#8dffd6,#f4ff9a,#ffc58f,#ff9bd2); background-size: 250% 100%; background-position: 0% 50%; -webkit-background-clip: text; background-clip: text; color: transparent; }}
  .{p}-tag {{ position: absolute; left: 120px; top: 56px; font-family: "Geist Mono", monospace; font-size: 26px; text-transform: uppercase; border: 3px solid #121212; padding: 12px 18px; line-height: 1; }}
  .{p}-count {{ position: absolute; right: 120px; top: 64px; font-family: "Geist Mono", monospace; font-size: 26px; color: #121212; }}
  .{p}-bars {{ position: absolute; right: 250px; top: 58px; width: 150px; height: 34px; background: repeating-linear-gradient(90deg,#121212 0 2px,transparent 2px 4px,#121212 4px 5px,transparent 5px 9px,#121212 9px 13px,transparent 13px 14px,#121212 14px 15px,transparent 15px 19px,#121212 19px 20px,transparent 20px 23px); }}
  .{p}-track {{ position: absolute; left: 120px; right: 120px; top: 876px; height: 10px; background: #121212; overflow: hidden; }}
  .{p}-fill {{ position: absolute; left: 0; top: 0; bottom: 0; width: 100%; transform-origin: 0 50%; }}
  .{p}-term {{ font-family: "Geist Mono", monospace; white-space: pre; }}
</style>"""

def chrome(p, n, tag=None, tag_green=False):
    t = ""
    if tag:
        cls = f"{p}-tag {p}-green" if tag_green else f"{p}-tag"
        t = f'<div id="{p}-tag" class="{cls}">{tag}</div>'
    count = "" if n == 3 else f'<span class="{p}-bars"></span><div class="{p}-count">{n:02d} / 10</div>'
    return f'''{t}
    {count}
    <div class="{p}-track"><div id="{p}-fill" class="{p}-fill {p}-holo"></div></div>'''

def common_js(p, n, d):
    a, b = START[n] / TOTAL, (START[n] + d) / TOTAL
    return f'''
  const tl = gsap.timeline({{ paused: true }});
  const R = (sel, t, extra) => tl.fromTo(sel, {{ opacity: 0, y: 26 }}, Object.assign({{ opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }}, extra || {{}}), t);
  const W = (sel, t, d) => tl.fromTo(sel, {{ clipPath: "inset(0 100% 0 0)" }}, {{ clipPath: "inset(0 0% 0 0)", duration: d || 0.45, ease: "power3.out" }}, t);
  const TYPE = (sel, t, d, steps) => tl.fromTo(sel, {{ clipPath: "inset(0 100% 0 0)" }}, {{ clipPath: "inset(0 0% 0 0)", duration: d, ease: "steps(" + steps + ")" }}, t);
  // hard cuts: discrete sets only (a later fromTo would render its from-state early when seeking)
  const CUT = (sel, t) => {{ tl.set(sel, {{ opacity: 0 }}, 0); tl.set(sel, {{ opacity: 1 }}, t); }};
  const OFF = (sel, t) => tl.set(sel, {{ opacity: 0 }}, t);
  tl.fromTo("#{p}-fill", {{ scaleX: {a:.4f} }}, {{ scaleX: {b:.4f}, duration: {d:.3f}, ease: "none" }}, 0);
  document.querySelectorAll("[data-p='{p}'] .{p}-holo, [data-p='{p}'] .{p}-htext").forEach((el) => {{
    tl.fromTo(el, {{ backgroundPosition: "0% 50%" }}, {{ backgroundPosition: "100% 50%", duration: {d:.3f}, ease: "none" }}, 0);
  }});
'''

def caltrop_js(p, d, canvas_id, w, h):
    return f'''
  (function () {{
    const T = window.THREE, canvas = document.getElementById("{canvas_id}");
    if (!T || !canvas) return;
    const VS = "uniform float uTime; varying vec3 vN; varying vec3 vV;" +
      "float arm(vec3 d, vec3 a){{ float c = max(dot(d, normalize(a)), 0.0); return 1.3*pow(c, 12.0); }}" +
      "vec3 shape(vec3 d){{ d = normalize(d); float r = 0.36 + arm(d, vec3(1.,1.,1.)) + arm(d, vec3(1.,-1.,-1.)) + arm(d, vec3(-1.,1.,-1.)) + arm(d, vec3(-1.,-1.,1.)); r += sin(d.x*6.0 + uTime)*0.012 + sin(d.y*5.0 - uTime*0.8)*0.012; return d * r; }}" +
      "void main(){{ vec3 d = normalize(position); vec3 up = abs(d.y) < 0.99 ? vec3(0.,1.,0.) : vec3(1.,0.,0.); vec3 t = normalize(cross(d, up)); vec3 b = normalize(cross(d, t)); vec3 p = shape(d), p1 = shape(d + t*0.006), p2 = shape(d + b*0.006); vec3 n = normalize(cross(p1 - p, p2 - p)); if (dot(n, p) < 0.0) n = -n; vec4 mv = modelViewMatrix * vec4(p, 1.0); vN = normalize(normalMatrix * n); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }}";
    const FS = "uniform float uTime; varying vec3 vN; varying vec3 vV;" +
      "vec3 pal(float t){{ return 0.5 + 0.5*cos(6.2831*(t + vec3(0.0, 0.33, 0.67))); }}" +
      "void main(){{ vec3 n = normalize(vN), v = normalize(vV); float f = 1.0 - max(dot(n, v), 0.0); vec3 irid = pal(f*1.5 + n.y*0.4 + n.x*0.3 + uTime*0.06); vec3 l = normalize(vec3(0.4, 0.8, 0.6)); float spec = pow(max(dot(reflect(-l, n), v), 0.0), 36.0); vec3 col = irid * (0.55 + 0.55*max(dot(n, l), 0.0)); col = mix(col, vec3(0.06, 0.06, 0.06), (1.0 - f) * 0.28); col += spec * 0.9 + pow(f, 3.0) * 0.3; gl_FragColor = vec4(col, 1.0); }}";
    const r = new T.WebGLRenderer({{ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true }});
    r.setPixelRatio(1); r.setSize({w}, {h}, false);
    const scene = new T.Scene();
    const cam = new T.PerspectiveCamera(34, {w}/{h}, 0.1, 50);
    cam.position.set(0, 0, 7.6 * Math.max(1, 0.85 / ({w}/{h})));
    const mat = new T.ShaderMaterial({{ uniforms: {{ uTime: {{ value: 0 }} }}, vertexShader: VS, fragmentShader: FS }});
    const mesh = new T.Mesh(new T.SphereGeometry(1, 200, 200), mat);
    scene.add(mesh);
    const clock = {{ t: 0 }};
    const draw = () => {{ const t = clock.t + 4.0; mat.uniforms.uTime.value = t; mesh.rotation.set(0.6 + t * 0.17, t * 0.29, 0.2 + t * 0.11); r.render(scene, cam); }};
    tl.fromTo(clock, {{ t: 0 }}, {{ t: {d:.3f}, duration: {d:.3f}, ease: "none", onUpdate: draw }}, 0);
    draw();
  }})();
'''

def frame(n, name, body, js, tag=None, tag_green=False, three=None):
    p = f"f{n:02d}"
    fid = f"{n:02d}-{name}"
    d = DUR[n]
    three_src = '<script src="assets/vendor/three.min.js"></script>' if three else ""
    three_js = caltrop_js(p, d, *three) if three else ""
    html = f'''<template>
<div id="root" data-composition-id="{fid}" data-width="1920" data-height="1080" data-duration="{d:.3f}">
  {css(p)}
  <div class="clip {p}-bg" data-start="0" data-duration="{d:.3f}" data-track-index="0"></div>
  <div class="clip {p}-stage" data-p="{p}" data-start="0" data-duration="{d:.3f}" data-track-index="1">
    {chrome(p, n, tag, tag_green)}
    {body.replace("{p}", p)}
  </div>
  {GSAP}
  {three_src}
  <script>
{common_js(p, n, d)}{js.replace("{p}", p)}{three_js}
  window.__timelines["{fid}"] = tl;
  </script>
</div>
</template>
'''
    (OUT / f"{fid}.html").write_text(html)
    return fid

OUT.mkdir(parents=True, exist_ok=True)

# Continuity: 04–06 share ONE terminal panel (same box, same place); lines carry over.
TERM_OPEN = '<div class="{p}-frame {p}-deep" style="position:absolute;left:120px;right:120px;top:150px;height:700px"><div class="{p}-mono {p}-muted" style="font-size:26px;padding:18px 28px;border-bottom:3px solid currentColor">terminal · agent run · solana mainnet</div>'
TERM_CLOSE = '</div>'

# ---------------------------------------------------------------- 01 wrong token
frame(1, "wrong-token", """
    <div id="{p}-lens" class="{p}-frame {p}-deep" style="position:absolute;right:120px;top:150px;width:640px;height:680px;overflow:hidden">
      <canvas id="{p}-cal" width="634" height="674" style="position:absolute;left:0;top:0;width:634px;height:674px;display:block"></canvas>
    </div>
    <div style="position:absolute;left:120px;top:190px;width:1000px;display:flex;flex-direction:column;gap:18px">
      <div class="{p}-disp" style="font-size:112px"><span id="{p}-l1a" style="display:block">Your agent</span><span id="{p}-l1b" style="display:block">has <span id="{p}-usdc">USDC.</span></span></div>
      <div id="{p}-l2" class="{p}-disp {p}-muted" style="font-size:84px;margin-top:22px">But the site wants</div>
      <div class="{p}-deep" style="position:relative;width:600px;height:160px">
        <div id="{p}-t1" class="{p}-disp {p}-htext" style="position:absolute;left:26px;top:24px;font-size:136px">SOL.</div>
        <div id="{p}-t2" class="{p}-disp {p}-htext" style="position:absolute;left:26px;top:24px;font-size:136px">BONK.</div>
        <div id="{p}-t3" class="{p}-disp {p}-htext" style="position:absolute;left:26px;top:24px;font-size:136px">JUP.</div>
      </div>
    </div>""", """
  W("#{p}-lens", 0.1, 0.6);
  R("#{p}-l1a", 0.3);
  R("#{p}-l1b", 0.9);
  tl.fromTo("#{p}-usdc", { backgroundColor: "rgba(20,241,149,0)" }, { backgroundColor: "rgba(20,241,149,1)", duration: 0.2 }, 1.2);
  R("#{p}-l2", 2.3);
  CUT("#{p}-t1", 3.2); OFF("#{p}-t1", 4.1);
  CUT("#{p}-t2", 4.1); OFF("#{p}-t2", 4.9);
  CUT("#{p}-t3", 4.9);
""", tag="agent wallet · USDC", three=("f01-cal", 634, 674))

# ---------------------------------------------------------------- 02 agents can't click
frame(2, "agents-cant-click", """
    <div id="{p}-split" style="position:absolute;left:120px;right:120px;top:160px;height:680px;display:grid;grid-template-columns:1fr 1fr">
      <div class="{p}-frame" style="border-right:none;padding:48px;display:flex;flex-direction:column;gap:34px">
        <div class="{p}-mono {p}-muted" style="font-size:28px">A swap today</div>
        <div id="{p}-s1" class="{p}-disp" style="font-size:66px;position:relative;white-space:nowrap;align-self:flex-start">Open a DEX<span id="{p}-x1" style="position:absolute;left:0;right:0;top:46%;height:10px;background:#14F195"></span></div>
        <div id="{p}-s2" class="{p}-disp" style="font-size:66px;position:relative;white-space:nowrap;align-self:flex-start">Wallet popup<span id="{p}-x2" style="position:absolute;left:0;right:0;top:46%;height:10px;background:#14F195"></span></div>
        <div id="{p}-s3" class="{p}-disp" style="font-size:66px;position:relative;white-space:nowrap;align-self:flex-start">Click<span id="{p}-x3" style="position:absolute;left:0;right:0;top:46%;height:10px;background:#14F195"></span></div>
      </div>
      <div class="{p}-frame {p}-deep" style="padding:48px;display:flex;flex-direction:column;justify-content:flex-end">
        <div class="{p}-disp" style="font-size:96px"><span id="{p}-a1" style="display:block">But an agent can't</span><span id="{p}-a2" class="{p}-htext" style="display:block">click.</span></div>
      </div>
    </div>""", """
  W("#{p}-split", 0.0, 0.5);
  R("#{p}-s1", 1.4); R("#{p}-s2", 2.3); R("#{p}-s3", 3.6);
  [["#{p}-x1", 1.8], ["#{p}-x2", 2.8], ["#{p}-x3", 4.0]].forEach(([s, t]) => tl.fromTo(s, { scaleX: 0, transformOrigin: "0 50%" }, { scaleX: 1, duration: 0.3, ease: "power3.out" }, t));
  [["#{p}-s1", 1.8], ["#{p}-s2", 2.8], ["#{p}-s3", 4.0]].forEach(([s, t]) => tl.to(s, { color: "#6E685F", duration: 0.3 }, t));
  R("#{p}-a1", 4.3);
  R("#{p}-a2", 5.2);
""", tag="agent wallet · USDC")

# ---------------------------------------------------------------- 03 the real landing, 1:1 full-bleed
frame(3, "meet-agentswap", """
    <div style="position:absolute;inset:0;overflow:hidden;background:#DCD3C6">
      <img id="{p}-page" src="assets/full-page.png" alt="" data-layout-allow-overflow style="position:absolute;left:0;top:0;width:1920px;display:block">
    </div>""", """
  tl.fromTo("#{p}-page", { y: 0 }, { y: -3964, duration: 1.1, ease: "power3.inOut" }, 7.9);
""")

# ---------------------------------------------------------------- 04 demo · quote (terminal, part 1)
frame(4, "demo-quote", TERM_OPEN + """
      <div class="{p}-term" style="padding:30px 40px;font-size:40px;line-height:1.7">
<span id="{p}-cmd" style="display:inline-block"><span class="{p}-muted">$</span> pnpm demo USDC SOL 1</span>
<span id="{p}-j1" style="display:inline-block">▸ Quote 1 USDC → SOL</span>
<span id="{p}-j2" style="display:inline-block">  outAmount  <span style="color:#14F195">0.008186968 SOL</span></span>
<span id="{p}-j3" style="display:inline-block">  route      Byreal (via Jupiter)</span></div>
      <div id="{p}-free" class="{p}-green {p}-mono" style="position:absolute;right:40px;top:110px;font-size:34px;padding:8px 18px">free</div>""" + TERM_CLOSE, """
  TYPE("#{p}-cmd", 0.3, 0.7, 22);
  R("#{p}-j1", 2.5, { duration: 0.3 }); R("#{p}-j2", 2.9, { duration: 0.3 }); R("#{p}-j3", 3.2, { duration: 0.3 });
  tl.fromTo("#{p}-free", { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.3, ease: "power3.out" }, 4.0);
""", tag="agent wallet · USDC")

# ---------------------------------------------------------------- 05 demo · 402 (terminal, part 2)
frame(5, "demo-402", TERM_OPEN + """
      <div class="{p}-term" style="padding:30px 40px;font-size:40px;line-height:1.7">
<span class="{p}-muted">▸ Quote 1 USDC → SOL · 0.008186968 SOL · free</span>
<span id="{p}-c1" style="display:inline-block"><span class="{p}-muted">$</span> POST /api/swap</span>
<span id="{p}-c2" style="display:inline-block">  ← <span style="color:currentColor">402 Payment Required</span></span>
<span id="{p}-c3" style="display:inline-block">  amount  10000  <span class="{p}-green" style="padding:0 10px">= $0.01 USDC</span></span>
<span id="{p}-c4" style="display:inline-block">  network solana mainnet · fee sponsored</span></div>
      <div id="{p}-big" class="{p}-disp {p}-htext" style="position:absolute;right:60px;bottom:40px;font-size:230px">402</div>""" + TERM_CLOSE, """
  R("#{p}-c1", 1.1, { duration: 0.3 });
  R("#{p}-c2", 2.8, { duration: 0.3 });
  tl.fromTo("#{p}-big", { scale: 1.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: "expo.out" }, 2.8);
  R("#{p}-c3", 4.0, { duration: 0.3 });
  R("#{p}-c4", 4.9, { duration: 0.3 });
""", tag="agent wallet · USDC")

# ---------------------------------------------------------------- 06 demo · pay, sign, send (terminal, part 3)
frame(6, "demo-pay-sign-send", TERM_OPEN + """
      <div class="{p}-term" style="padding:30px 40px;font-size:40px;line-height:1.7">
<span class="{p}-muted">▸ Quote 0.008186968 SOL · 402 · $0.01 USDC</span>
<span id="{p}-r1" style="display:inline-block"><span style="color:#14F195">✓</span> x402 fee paid     <span class="{p}-muted">tx 3Vw7GZn4…c6f4e</span></span>
<span id="{p}-r2" style="display:inline-block"><span style="color:#14F195">✓</span> unsigned tx received</span>
<span id="{p}-r3" style="display:inline-block"><span style="color:#14F195">✓</span> signed locally     <span class="{p}-muted">own key, never sent</span></span>
<span id="{p}-r4" style="display:inline-block"><span style="color:#14F195">✓</span> swap sent          <span class="{p}-muted">tx 2SpRNZCS…BopWMx</span></span></div>
      <div id="{p}-nh" class="{p}-disp {p}-htext" style="position:absolute;left:40px;bottom:40px;font-size:72px">No human in the loop.</div>""" + TERM_CLOSE, """
  R("#{p}-r1", 2.7, { duration: 0.3 });
  R("#{p}-r2", 4.4, { duration: 0.3 });
  R("#{p}-r3", 5.3, { duration: 0.3 });
  R("#{p}-r4", 6.3, { duration: 0.3 });
  R("#{p}-nh", 7.3);
""", tag="agent wallet · USDC → SOL")

# ---------------------------------------------------------------- 07 demo · on-chain
frame(7, "demo-onchain", """
    <div id="{p}-shot" class="{p}-frame" style="position:absolute;left:120px;top:160px;width:1060px;height:680px;overflow:hidden;background:#FFFFFF">
      <img src="assets/solscan-tx.png" alt="" data-layout-allow-overflow style="position:absolute;left:-190px;top:-230px;width:1920px;display:block">
    </div>
    <div id="{p}-ok" style="position:absolute;left:512px;top:340px;width:430px;height:62px;border:6px solid #14F195"></div>
    <div class="{p}-frame {p}-deep" style="position:absolute;left:1180px;right:120px;top:160px;height:680px;padding:40px;display:flex;flex-direction:column;justify-content:space-between">
      <div class="{p}-mono {p}-muted" style="font-size:26px">Solscan · finalized</div>
      <div class="{p}-disp" style="font-size:64px"><span id="{p}-in" style="display:block">1 USDC in</span><span id="{p}-out" style="display:block;margin-top:24px">0.008186967<br>SOL out</span></div>
      <div class="{p}-mono {p}-muted" style="font-size:24px;text-transform:none">signer 7QbNPZ…DuSL</div>
    </div>""", """
  W("#{p}-shot", 0.6, 0.5);
  W("#{p}-ok", 1.0, 0.4);
  R("#{p}-in", 1.8);
  R("#{p}-out", 3.9);
""", tag="agent wallet · SOL ✓", tag_green=True)

# ---------------------------------------------------------------- 08 MCP
frame(8, "ask-claude", """
    <div style="position:absolute;left:120px;right:120px;top:140px;display:flex;flex-direction:column;gap:24px">
      <div id="{p}-k" class="{p}-mono {p}-muted" style="font-size:28px">MCP · Claude · Claude Code</div>
      <div id="{p}-h" class="{p}-disp" style="font-size:80px">Also an MCP server.</div>
      <div id="{p}-q" class="{p}-disp" style="font-size:64px;align-self:flex-start">"How much BONK for 5 USDC?"</div>
      <div id="{p}-res" class="{p}-frame {p}-deep {p}-term" style="font-size:36px;line-height:1.6;padding:26px 32px"><span class="{p}-muted">⚙ agentswap · get_quote  {from: USDC, to: BONK, amount: 5}</span>
<span id="{p}-o1" style="display:inline-block">→ <span style="color:#14F195">1,366,700 BONK</span>  via BisonFi → Whirlpool → Scorch</span></div>
      <div id="{p}-cc" class="{p}-frame {p}-mono" style="font-size:30px;padding:18px 28px;text-transform:none;display:flex;gap:18px;align-items:center"><span class="{p}-green" style="padding:2px 12px">Claude Code</span><span>your trading strategy</span><span class="{p}-muted">→ /api/quote + /api/swap (x402)</span></div>
    </div>""", """
  R("#{p}-k", 0.3); R("#{p}-h", 0.9);
  TYPE("#{p}-q", 2.3, 1.7, 26);
  W("#{p}-res", 4.6, 0.4);
  R("#{p}-o1", 4.9, { duration: 0.3 });
  W("#{p}-cc", 5.7, 0.45);
""")

# ---------------------------------------------------------------- 09 next
frame(9, "whats-next", """
    <div id="{p}-cols" class="{p}-frame" style="position:absolute;left:120px;right:120px;top:170px;height:640px;display:grid;grid-template-columns:1fr 1fr">
      <div style="display:flex;flex-direction:column"><div class="{p}-green {p}-mono" style="font-size:30px;padding:18px 30px;border-bottom:3px solid currentColor">Now</div><div style="padding:40px 30px;display:flex;flex-direction:column;gap:22px"><span class="{p}-disp {p}-muted" style="font-size:72px">Jupiter-routed</span><span class="{p}-mono {p}-muted" style="font-size:28px;text-transform:none">what you just saw</span></div></div>
      <div style="border-left:3px solid currentColor;display:flex;flex-direction:column"><div id="{p}-nh" class="{p}-holo {p}-mono" style="font-size:30px;padding:18px 30px;border-bottom:3px solid currentColor">Next</div><div style="padding:40px 30px;display:flex;flex-direction:column;gap:22px"><span id="{p}-p" class="{p}-disp" style="font-size:88px">Own pools</span><span id="{p}-f" class="{p}-mono" style="font-size:30px;text-transform:none">built for agent flow</span></div></div>
    </div>""", """
  W("#{p}-cols", 0.0, 0.4);
  W("#{p}-nh", 0.3, 0.4);
  R("#{p}-p", 1.3);
  R("#{p}-f", 2.9);
""")

# ---------------------------------------------------------------- 10 plug it in (final frame)
frame(10, "plug-it-in", """
    <div id="{p}-lens" class="{p}-frame {p}-deep" style="position:absolute;right:120px;top:150px;width:560px;height:680px;overflow:hidden">
      <canvas id="{p}-cal" width="554" height="674" style="position:absolute;left:0;top:0;width:554px;height:674px;display:block"></canvas>
    </div>
    <div style="position:absolute;left:120px;top:170px;width:1080px;display:flex;flex-direction:column;gap:30px">
      <div id="{p}-w" class="{p}-disp" style="font-size:118px;white-space:nowrap">AgentSwap</div>
      <div class="{p}-disp" style="font-size:58px"><span id="{p}-c1" style="display:block">Let your agent pay with</span><span id="{p}-c2" style="display:block;margin-top:10px"><span style="background:#121212;padding:6px 14px;-webkit-box-decoration-break:clone;box-decoration-break:clone;line-height:1.35"><span class="{p}-htext">whatever the world accepts.</span></span></span></div>
      <div id="{p}-cmd" class="{p}-deep {p}-mono {p}-frame" style="font-size:28px;padding:18px 24px;text-transform:none;align-self:flex-start">$ claude mcp add --transport http agentswap …/mcp</div>
      <div id="{p}-gh" class="{p}-mono" style="font-size:30px;text-transform:none">github.com/pu0238/agentswap</div>
    </div>""", """
  tl.fromTo("#{p}-w", { scale: 1.15, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: "expo.out", transformOrigin: "0 50%" }, 0.3);
  W("#{p}-lens", 0.5, 0.6);
  R("#{p}-c1", 1.6); R("#{p}-c2", 3.0);
  W("#{p}-cmd", 4.5, 0.4); R("#{p}-gh", 5.0);
""", tag="agent wallet · SOL ✓", tag_green=True, three=("f10-cal", 554, 674))

print("built", len(list(OUT.glob("*.html"))), "frames; total", round(TOTAL, 3), "s")
