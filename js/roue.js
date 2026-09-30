/* =========================================================
   EPS ONE — Tirage au sort : roue qui tourne (couleurs de l'app)
   Remplace l'outil « tirage ». Prénoms affichés sur la roue,
   sans remise possible, tic-tic sonore, grand affichage du gagnant.
   ========================================================= */
(() => {
  document.head.insertAdjacentHTML('beforeend', `<style>
.rw-wrap{position:relative;width:min(100%,560px);margin:0 auto;aspect-ratio:1}
.rw-wrap canvas{width:100%;height:100%;display:block;cursor:pointer;touch-action:manipulation}
.rw-ptr{position:absolute;left:50%;top:-6px;transform:translateX(-50%);width:0;height:0;border-left:18px solid transparent;border-right:18px solid transparent;border-top:34px solid var(--gold,#C9A227);filter:drop-shadow(0 3px 3px rgba(0,0,0,.35));z-index:2}
.rw-hub{position:absolute;left:50%;top:50%;width:19%;aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;background:#fff url(icons/icone-v3-192.png) center/78% no-repeat;box-shadow:0 0 0 5px var(--gold,#C9A227),0 4px 14px rgba(0,0,0,.3);pointer-events:none}
.rw-res{position:fixed;inset:0;z-index:420;display:grid;place-items:center;background:rgba(7,18,42,.72);padding:18px;animation:rwf .25s}
.rw-res .b{background:var(--card);border-radius:26px;padding:24px 22px;text-align:center;max-width:520px;width:100%;box-shadow:0 20px 50px rgba(0,0,0,.35);animation:rwp .35s cubic-bezier(.2,1.6,.4,1)}
.rw-res .n{font-size:clamp(2.2rem,9vw,4rem);font-weight:900;line-height:1.05;margin:6px 0;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}
.rw-cf{position:fixed;top:-12px;width:10px;height:16px;z-index:421;border-radius:2px;pointer-events:none;animation:rwc linear forwards}
.rw-mode{display:flex;gap:6px;margin-top:10px}.rw-mode button{flex:1;padding:10px;border-radius:12px;border:1.5px solid var(--line);background:var(--card);font-weight:800}
.rw-mode button.on{background:var(--grad);color:#fff;border-color:transparent}
.rw-hist{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.rw-hist span{padding:4px 10px;border-radius:999px;background:var(--grad-soft);border:1px solid var(--line);font-weight:700;font-size:.85rem}
@keyframes rwf{from{opacity:0}}@keyframes rwp{from{transform:scale(.6);opacity:0}}
@keyframes rwc{to{transform:translateY(105vh) rotate(720deg)}}
</style>`);

  const COLS = ['#C9A227', '#1E5BD8', '#0B2A5B', '#E6C76E', '#3E7BEA', '#8A6D1F', '#16407F', '#D9B84A'];
  const txtCol = c => ['#E6C76E', '#D9B84A', '#C9A227'].includes(c) ? '#0B2A5B' : '#fff';
  // « DUPONT Léa » → « Léa D. » (prénom + initiale du nom) ; sinon le nom tel quel
  const label = n => { const w = String(n).trim().split(/\s+/); let i = 0; while (i < w.length - 1 && w[i] === w[i].toUpperCase() && /[A-ZÀ-Ý]/.test(w[i])) i++;
    return i > 0 ? `${w.slice(i).join(' ')} ${w[0][0]}.` : String(n).trim(); };

  TOOL_IMPL.tirage = function (el) {
    const T = DB.tirageOpt = Object.assign({ mode: 'roue', nr: true }, DB.tirageOpt || {});
    let drawn = [], rot = 0, spinning = false, raf = 0, names = [];
    el.innerHTML = `<div class="card" data-cfg>${classSelect('ts')}<label>Participants</label><textarea id="tl" placeholder="Un nom par ligne"></textarea>
        <label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="nr" ${T.nr ? 'checked' : ''} style="width:auto"> Sans remise (chacun passe une fois)</label></div>
      <div class="rw-mode"><button data-md="roue" class="${T.mode === 'roue' ? 'on' : ''}">🎡 Roue</button><button data-md="rapide" class="${T.mode !== 'roue' ? 'on' : ''}">🎲 Tirage rapide</button></div>
      <div class="card" style="margin-top:12px" id="rw-box"></div>`;
    bindClassToTextarea('ts', 'tl');
    const $ = s => el.querySelector(s);
    const all = () => namesFrom('tl'), pool = () => { const a = all(); return $('#nr').checked ? a.filter(n => !drawn.includes(n)) : a; };
    const histHTML = () => drawn.length ? `<div class="muted" style="margin-top:12px;font-size:.85rem;font-weight:700">Déjà tirés (${drawn.length})</div><div class="rw-hist">${drawn.map(n => `<span>${esc(label(n))}</span>`).join('')}</div>` : '';

    function frame() {
      cancelAnimationFrame(raf);
      if (T.mode === 'roue') {
        $('#rw-box').innerHTML = `<div class="rw-wrap"><div class="rw-ptr"></div><canvas id="rw-c" aria-label="Roue du tirage au sort"></canvas><div class="rw-hub"></div></div>
          <div class="row" style="margin-top:14px"><button class="btn btn-grad" id="go" style="font-size:1.1rem;padding:14px">🎡 Lancer la roue</button><button class="btn btn-ghost" id="rz" data-cfg="bare">↺ Recommencer</button></div>
          <p class="muted" id="rw-info" style="text-align:center;margin:8px 0 0;font-size:.85rem"></p><div id="rw-h">${histHTML()}</div>`;
        $('#rw-c').onclick = spin; $('#go').onclick = spin; draw();
      } else {
        $('#rw-box').innerHTML = `<div class="pick" id="pk">🎲</div><div class="row"><button class="btn btn-grad" id="go">🎲 Tirer au sort</button><button class="btn btn-ghost" id="rz" data-cfg="bare">↺ Recommencer</button></div><div id="rw-h">${histHTML()}</div>`;
        $('#go').onclick = quick;
      }
      $('#rz').onclick = () => { drawn = []; rot = 0; frame(); };
    }

    function draw() {
      const c = $('#rw-c'); if (!c) return;
      names = pool();
      const dpr = Math.min(3, window.devicePixelRatio || 1), W = c.clientWidth || 320; c.width = c.height = Math.round(W * dpr);
      const x = c.getContext('2d'), R = c.width / 2, n = names.length;
      x.clearRect(0, 0, c.width, c.height);
      x.save(); x.translate(R, R);
      // anneau extérieur
      x.beginPath(); x.arc(0, 0, R - 2 * dpr, 0, 2 * Math.PI); x.fillStyle = '#0B2A5B'; x.fill();
      const r = R - 9 * dpr;
      if (!n) { x.beginPath(); x.arc(0, 0, r, 0, 2 * Math.PI); x.fillStyle = '#E9EEF7'; x.fill(); x.fillStyle = '#5B6782'; x.font = `800 ${16 * dpr}px system-ui,-apple-system,sans-serif`; x.textAlign = 'center';
        x.fillText(all().length ? 'Tout le monde est passé !' : 'Choisissez une classe', 0, -r * .55); x.restore(); info(); return; }
      const a = 2 * Math.PI / n;
      x.rotate(rot);
      for (let i = 0; i < n; i++) {
        const col = COLS[(n % COLS.length === 1 && i === n - 1) ? 1 : i % COLS.length];     // évite deux couleurs identiques côte à côte
        x.beginPath(); x.moveTo(0, 0); x.arc(0, 0, r, -Math.PI / 2 + i * a, -Math.PI / 2 + (i + 1) * a); x.closePath(); x.fillStyle = col; x.fill();
        x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = Math.max(1, dpr); x.stroke();
        // texte radial
        x.save(); x.rotate(-Math.PI / 2 + (i + .5) * a); x.fillStyle = txtCol(col); x.textAlign = 'right'; x.textBaseline = 'middle';
        const fs = Math.max(9 * dpr, Math.min(26 * dpr, r * a * .55, 460 * dpr / Math.max(8, n)));
        x.font = `800 ${fs}px system-ui,-apple-system,sans-serif`;
        let t = label(names[i]); const maxW = r * .68; while (x.measureText(t).width > maxW && t.length > 3) t = t.slice(0, -2) + '…';
        x.fillText(t, r - 12 * dpr, 0); x.restore();
      }
      x.restore();
      // repères dorés
      x.save(); x.translate(R, R); x.rotate(rot); x.fillStyle = '#E6C76E';
      for (let i = 0; i < n; i++) { const t = -Math.PI / 2 + i * a; x.beginPath(); x.arc(Math.cos(t) * (R - 5.5 * dpr), Math.sin(t) * (R - 5.5 * dpr), 2.6 * dpr, 0, 2 * Math.PI); x.fill(); }
      x.restore(); info();
    }
    const info = () => { const p = $('#rw-info'); if (p) p.textContent = `${names.length} participant${names.length > 1 ? 's' : ''} sur la roue${$('#nr').checked && drawn.length ? ` · ${drawn.length} déjà tiré${drawn.length > 1 ? 's' : ''}` : ''}`; };
    const idxAt = () => { const n = names.length, a = 2 * Math.PI / n; let t = ((-rot) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI); return Math.floor(t / a) % n; };

    function spin() {
      if (spinning) return; names = pool();
      if (!names.length) return toast(all().length ? 'Tout le monde est passé ! (↺ Recommencer)' : 'Ajoutez des noms');
      spinning = true; window.unlockAudio && window.unlockAudio();
      const n = names.length, a = 2 * Math.PI / n, win = Math.floor(Math.random() * n);
      // angle final : le centre (± aléatoire) du secteur gagnant sous le pointeur, après 5 à 7 tours
      const target = -(win + .5 + (Math.random() - .5) * .7) * a, start = rot, base = start + (5 + Math.floor(Math.random() * 3)) * 2 * Math.PI;
      const final = target + 2 * Math.PI * Math.ceil((base - target) / (2 * Math.PI));
      const dur = 4200 + Math.random() * 1400, t0 = performance.now(); let last = idxAt();
      const ease = t => 1 - Math.pow(1 - t, 4);
      const step = now => { const t = Math.min(1, (now - t0) / dur); rot = start + (final - start) * ease(t); draw();
        const i = idxAt(); if (i !== last) { last = i; beep(900 + (i % 2) * 140, .015, .12); }
        if (t < 1) raf = requestAnimationFrame(step); else { spinning = false; done(names[idxAt()]); } };
      raf = requestAnimationFrame(step);
    }
    function quick() {
      const p = pool(); if (!p.length) return toast(all().length ? 'Tout le monde est passé !' : 'Ajoutez des noms');
      let k = 0; const iv = setInterval(() => { $('#pk').textContent = label(p[Math.floor(Math.random() * p.length)]); beep(400 + k * 30, .03, .15);
        if (++k > 18) { clearInterval(iv); done(p[Math.floor(Math.random() * p.length)], true); } }, 70);
    }
    function done(w, q) {
      drawn.push(w); beep(1200, .3); setTimeout(() => beep(1600, .25), 160);
      if (q) { const pk = $('#pk'); if (pk) pk.textContent = label(w); $('#rw-h').innerHTML = histHTML(); return; }
      const o = document.createElement('div'); o.className = 'rw-res';
      o.innerHTML = `<div class="b"><div style="font-size:2.4rem">🎉</div><div class="muted" style="font-weight:800;letter-spacing:.12em;text-transform:uppercase;font-size:.8rem">Tiré au sort</div>
        <div class="n">${esc(label(w))}</div><div class="muted">${esc(w)}</div><button class="btn btn-grad btn-block" style="margin-top:16px">OK</button></div>`;
      o.onclick = () => { o.remove(); frame(); };
      document.body.appendChild(o);
      for (let i = 0; i < 40; i++) { const c = document.createElement('i'); c.className = 'rw-cf'; c.style.left = Math.random() * 100 + 'vw'; c.style.background = COLS[i % COLS.length];
        c.style.animationDuration = 1.6 + Math.random() * 1.6 + 's'; c.style.animationDelay = Math.random() * .4 + 's'; document.body.appendChild(c); setTimeout(() => c.remove(), 3800); }
    }

    el.querySelectorAll('[data-md]').forEach(b => b.onclick = () => { T.mode = b.dataset.md; save(); el.querySelectorAll('[data-md]').forEach(x => x.classList.toggle('on', x === b)); frame(); });
    $('#nr').onchange = () => { T.nr = $('#nr').checked; save(); if (T.mode === 'roue') draw(); };
    $('#tl').oninput = () => { if (T.mode === 'roue' && !spinning) draw(); };
    $('#ts').addEventListener('change', () => { drawn = []; setTimeout(() => { if (T.mode === 'roue') draw(); }, 0); });
    // classe par défaut : la dernière utilisée
    const ci = DB.classes.findIndex(c => c.name === DB.lastClass); if (ci >= 0) { $('#ts').value = ci; $('#tl').value = DB.classes[ci].students.join('\n'); }
    const onR = () => { if (T.mode === 'roue' && !spinning) draw(); }; window.addEventListener('resize', onR);
    frame();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onR); document.querySelectorAll('.rw-res,.rw-cf').forEach(x => x.remove()); };
  };
})();
