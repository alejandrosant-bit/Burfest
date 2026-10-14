/* ==========================================================
   BURFEST — lógica de la web/app
   Sin dependencias ni build. El estado del usuario (favoritas,
   votos, boletas) se guarda en el dispositivo; en producción se
   sincroniza con el backend.
   ========================================================== */
(() => {
  const { config, events, burgers, tickets, categories, faq, schedule, sponsors, giveaway } = window.BURFEST;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const cop = (n) => "$" + n.toLocaleString("es-CO");
  const priceLabel = (n) => (n === 0 ? "GRATIS" : cop(n));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- Almacenamiento local seguro ---------- */
  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem("burfest:" + key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
    },
    set(key, val) { try { localStorage.setItem("burfest:" + key, JSON.stringify(val)); } catch {} },
  };
  const state = {
    favs: new Set(store.get("favs", [])),
    ratings: store.get("ratings", {}),
    myTickets: store.get("tickets", []),
    event: config.nextEventId,
    tag: "todas",
    q: "",
  };
  const save = () => {
    store.set("favs", [...state.favs]);
    store.set("ratings", state.ratings);
    store.set("tickets", state.myTickets);
  };

  /* ---------- Ilustración SVG de hamburguesa ---------- */
  function burgerSVG(p, id) {
    const seeds = [[78, 50], [104, 38], [132, 46], [160, 40], [92, 66], [120, 60], [150, 64], [176, 56], [64, 70]]
      .map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="4.5" ry="2.4" fill="#FFF9EC" stroke="none" transform="rotate(-20 ${x} ${y})"/>`).join("");
    return `<svg viewBox="0 0 240 200" role="img" aria-label="Ilustración de hamburguesa" stroke="#1B1B1F" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
      <path d="M26 166 h188 c0 16 -18 26 -42 26 h-104 c-24 0 -42 -10 -42 -26z" fill="${p.bun}"/>
      <path d="M22 148 q14 16 30 2 q16 16 32 2 q16 16 32 2 q16 16 32 2 q16 16 32 2 q16 16 30 0 v18 h-188z" fill="${p.sauce}"/>
      <rect x="18" y="120" width="204" height="34" rx="17" fill="${p.patty}"/>
      <path d="M34 130 h40 M92 132 h30 M140 130 h50" stroke="rgba(255,255,255,.35)" stroke-width="3"/>
      <path d="M22 114 h196 l-8 12 l-12 20 l-10 -16 l-22 8 l-14 -10 l-26 22 l-14 -20 l-20 10 l-16 -14 l-14 16 l-10 -14 l-24 -8z" fill="${p.cheese}"/>
      <path d="M14 112 q13 -14 26 0 t26 0 t26 0 t26 0 t26 0 t26 0 t26 0 t26 0 v8 h-208z" fill="${p.veg}"/>
      <path d="M18 104 c0 -62 46 -92 102 -92 s102 30 102 92 a6 6 0 0 1 -6 6 h-192 a6 6 0 0 1 -6 -6z" fill="${p.bun}"/>
      <path d="M50 50 c16 -18 40 -28 64 -30" stroke="rgba(255,255,255,.55)" stroke-width="7" fill="none"/>
      ${seeds}
    </svg>`;
  }

  /* ---------- Votos: combinación de base simulada + votos del usuario ---------- */
  const baseVotes = (b) => {
    let h = 0; for (const c of b.id + b.name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return 180 + (h % 820);
  };
  const votesOf = (b) => baseVotes(b) + (state.ratings[b.id] ? 1 : 0);
  const scoreOf = (b) => {
    const base = 3.6 + (baseVotes(b) % 13) / 10; // 3.6 – 4.8
    const mine = state.ratings[b.id];
    const n = baseVotes(b);
    return mine ? (base * n + mine) / (n + 1) : base;
  };

  /* ---------- Hero ---------- */
  const heroBurger = $("#heroBurger");
  heroBurger.innerHTML = burgerSVG({ bun: "#F4B54A", patty: "#6B3A22", cheese: "#FFDC4E", veg: "#7BC46A", sauce: "#EC8DB8" }, "hero");
  const nextEvent = events.find((e) => e.id === config.nextEventId);
  if (nextEvent) {
    $("#heroDates").textContent = nextEvent.dates;
    $("#venueName").textContent = nextEvent.venue;
    $("#venueDates").textContent = nextEvent.dates;
    $("#mapsLink").href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(nextEvent.venue + ", " + nextEvent.city);
  }
  if (config.demo) $("#demoRibbon").hidden = false;

  /* ---------- Countdown ---------- */
  const target = new Date(config.nextEventDate).getTime();
  const cd = Object.fromEntries($$("[data-cd]").map((el) => [el.dataset.cd, el]));
  const pad = (n) => String(n).padStart(2, "0");
  function tick() {
    let diff = Math.max(0, target - Date.now());
    const d = Math.floor(diff / 864e5); diff -= d * 864e5;
    const h = Math.floor(diff / 36e5); diff -= h * 36e5;
    const m = Math.floor(diff / 6e4); diff -= m * 6e4;
    const s = Math.floor(diff / 1e3);
    cd.d.textContent = pad(d); cd.h.textContent = pad(h); cd.m.textContent = pad(m); cd.s.textContent = pad(s);
  }
  tick(); setInterval(tick, 1000);

  /* ---------- Eventos ---------- */
  const badge = { proximo: "Próximo evento", realizado: "Edición realizada", pronto: "Próximamente" };
  $("#eventsList").innerHTML = events.map((e) => {
    const featured = e.status === "proximo";
    return `<article class="event ${featured ? "featured" : ""} ${e.status === "realizado" ? "past" : ""} reveal">
      <span class="event-badge">${badge[e.status] || ""}</span>
      <h3>${esc(e.city)}</h3>
      <span class="date-tag">📅 ${esc(e.dates)}</span>
      <span class="venue-tag">${esc(e.venue)}</span>
      <p>${esc(e.tagline)}</p>
      <div class="event-actions">
        ${featured
          ? `<a class="btn btn-yellow btn-sm" href="#boletas">Saca tu boleta</a><a class="btn btn-white btn-sm" href="#marcas" data-goto-event="${e.id}">Ver marcas</a>`
          : e.status === "realizado"
            ? `<a class="btn btn-white btn-sm" href="#marcas" data-goto-event="${e.id}">Ver marcas</a>`
            : `<button class="btn btn-white btn-sm" data-notify="${esc(e.city)}">Avísame</button>`}
      </div>
    </article>`;
  }).join("");
  $("#eventsList").addEventListener("click", (ev) => {
    const n = ev.target.closest("[data-notify]");
    if (n) { toast(`Listo, te avisaremos cuando abra BŪR FEST ${n.dataset.notify} 🔔`); requestNotify(); }
    const g = ev.target.closest("[data-goto-event]");
    if (g) { state.event = g.dataset.gotoEvent; $("#eventFilter").value = state.event; renderBurgers(); }
  });

  /* ---------- Filtros de hamburguesas ---------- */
  const evSelect = $("#eventFilter");
  evSelect.innerHTML = events.map((e) => `<option value="${e.id}">${esc(e.name)}</option>`).join("");
  evSelect.value = state.event;
  evSelect.addEventListener("change", () => { state.event = evSelect.value; renderBurgers(); });

  const allTags = ["todas", "favoritas", ...new Set(burgers.flatMap((b) => b.tags))];
  const tagBox = $("#tagFilters");
  tagBox.innerHTML = allTags.map((t) => `<button class="chip" data-tag="${t}" aria-pressed="${t === "todas"}">${t === "favoritas" ? "♥ favoritas" : t}</button>`).join("");
  tagBox.addEventListener("click", (e) => {
    const b = e.target.closest("[data-tag]"); if (!b) return;
    state.tag = b.dataset.tag;
    $$(".chip", tagBox).forEach((c) => c.setAttribute("aria-pressed", c === b));
    renderBurgers();
  });
  let qTimer;
  $("#burgerSearch").addEventListener("input", (e) => {
    clearTimeout(qTimer);
    qTimer = setTimeout(() => { state.q = e.target.value.trim().toLowerCase(); renderBurgers(); }, 120);
  });

  const heart = `<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-10-9.3C.3 8.4 2.3 4 6.3 4c2.2 0 3.7 1.3 4.7 2.7C12 5.3 13.5 4 15.7 4c4 0 6 4.4 4.3 7.7C19.5 16.4 12 21 12 21z"/></svg>`;
  const tagHTML = (t) => `<span class="tag ${t}">${t}</span>`;
  const bgs = ["#A8DCEC", "#F6BED7", "#FFE98E", "#D3EEF6"];
  const artBg = (p, i = 0) => `background:${bgs[i % bgs.length]} radial-gradient(circle at 50% 55%, #ffffff88 0 30%, transparent 62%);`;

  function filteredBurgers() {
    return burgers.filter((b) => {
      if (b.event !== state.event) return false;
      if (state.tag === "favoritas" && !state.favs.has(b.id)) return false;
      if (state.tag !== "todas" && state.tag !== "favoritas" && !b.tags.includes(state.tag)) return false;
      if (state.q && !(b.name + " " + b.restaurant + " " + b.description + " " + b.zone).toLowerCase().includes(state.q)) return false;
      return true;
    });
  }

  function renderBurgers() {
    const list = filteredBurgers();
    const grid = $("#burgerGrid");
    const empty = $("#burgerEmpty");
    const evHasBurgers = burgers.some((b) => b.event === state.event);
    empty.hidden = list.length > 0;
    empty.textContent = evHasBurgers ? "No encontramos hamburguesas con esos filtros." : "Las marcas de esta edición se anunciarán pronto. 👀";
    grid.innerHTML = list.map((b) => `
      <article class="burger-card">
        <button class="fav-btn" data-fav="${b.id}" aria-pressed="${state.favs.has(b.id)}" aria-label="Guardar ${esc(b.name)} en mi ruta">${heart}</button>
        <div class="burger-art" style="${artBg(b.palette, burgers.indexOf(b))}">${b.img ? `<img src="${esc(b.img)}" alt="${esc(b.name)}" loading="lazy">` : burgerSVG(b.palette, b.id)}</div>
        <div class="burger-body">
          <h3>${esc(b.name)}</h3>
          <div class="burger-rest">${esc(b.restaurant)} · ${esc(b.zone)}</div>
          <div class="tags">${b.tags.map(tagHTML).join("")}</div>
          <div class="burger-foot">
            <span class="price">${cop(b.price)}</span>
            <button class="btn btn-pink btn-sm" data-open="${b.id}">Ver y votar</button>
          </div>
        </div>
      </article>`).join("");
    renderRanking();
  }

  $("#burgerGrid").addEventListener("click", (e) => {
    const f = e.target.closest("[data-fav]");
    if (f) { toggleFav(f.dataset.fav); f.setAttribute("aria-pressed", state.favs.has(f.dataset.fav)); return; }
    const o = e.target.closest("[data-open]") || e.target.closest(".burger-art");
    if (o) {
      const id = o.dataset.open || o.closest(".burger-card").querySelector("[data-open]").dataset.open;
      openBurger(id);
    }
  });

  function toggleFav(id) {
    const b = burgers.find((x) => x.id === id);
    if (state.favs.has(id)) { state.favs.delete(id); toast(`${b.name} salió de tu ruta`); }
    else { state.favs.add(id); toast(`♥ ${b.name} agregada a tu ruta`); }
    save(); renderRoute();
    if (state.tag === "favoritas") renderBurgers();
  }

  /* ---------- Ranking ---------- */
  function renderRanking() {
    const list = burgers.filter((b) => b.event === state.event)
      .map((b) => ({ b, score: scoreOf(b), votes: votesOf(b) }))
      .sort((a, z) => z.score - a.score).slice(0, 5);
    $("#ranking").hidden = list.length === 0;
    const max = 5;
    $("#rankingList").innerHTML = list.map(({ b, score, votes }, i) => `
      <li class="rank-row">
        <span class="rank-pos">${i + 1}</span>
        <span class="rank-name">${esc(b.name)}<small>${esc(b.restaurant)}</small></span>
        <span class="rank-votes">★ ${score.toFixed(2)} <small>(${votes.toLocaleString("es-CO")})</small></span>
        <span class="rank-bar"><i style="width:${(score / max) * 100}%"></i></span>
      </li>`).join("");
  }

  /* ---------- Modal de hamburguesa + votación ---------- */
  const bModal = $("#burgerModal");
  function openBurger(id) {
    const b = burgers.find((x) => x.id === id);
    const mine = state.ratings[id] || 0;
    $("#burgerModalBody").innerHTML = `
      <div class="bm-art" style="${artBg(b.palette, burgers.indexOf(b))}">${b.img ? `<img src="${esc(b.img)}" alt="${esc(b.name)}">` : burgerSVG(b.palette, "m" + b.id)}</div>
      <div class="bm-body">
        <div class="tags">${b.tags.map(tagHTML).join("")}</div>
        <h3>${esc(b.name)}</h3>
        <div class="burger-rest">${esc(b.restaurant)} · ${esc(b.zone)}</div>
        <p>${esc(b.description)}</p>
        <div class="burger-foot" style="padding-top:4px">
          <span class="price">${cop(b.price)}</span>
          <span class="votes">★ ${scoreOf(b).toFixed(2)} · ${votesOf(b).toLocaleString("es-CO")} votos</span>
        </div>
        <div>
          <p style="font-weight:900;margin-top:6px">${mine ? "Tu calificación" : "¿Ya la probaste? Califícala"}</p>
          <div class="rate" role="radiogroup" aria-label="Calificación">
            ${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-rate="${n}" class="${n <= mine ? "on" : ""}" role="radio" aria-checked="${n === mine}" aria-label="${n} estrellas">★</button>`).join("")}
          </div>
        </div>
        <div class="bm-actions">
          <button class="btn btn-yellow" data-fav-modal="${b.id}">${state.favs.has(b.id) ? "♥ En mi ruta" : "♡ Agregar a mi ruta"}</button>
          <button class="btn btn-white" data-share="${b.id}">Compartir</button>
        </div>
      </div>`;
    bModal.showModal();
  }
  bModal.addEventListener("click", async (e) => {
    const r = e.target.closest("[data-rate]");
    const id = $("[data-fav-modal]", bModal)?.dataset.favModal;
    if (r) {
      const n = +r.dataset.rate;
      state.ratings[id] = n; save();
      $$(".rate button", bModal).forEach((btn) => {
        btn.classList.toggle("on", +btn.dataset.rate <= n);
        btn.setAttribute("aria-checked", +btn.dataset.rate === n);
      });
      toast(`¡Voto registrado! ${"★".repeat(n)}`);
      renderBurgers(); renderRoute();
    }
    const f = e.target.closest("[data-fav-modal]");
    if (f) { toggleFav(id); f.textContent = state.favs.has(id) ? "♥ En mi ruta" : "♡ Agregar a mi ruta"; renderBurgers(); }
    const s = e.target.closest("[data-share]");
    if (s) {
      const b = burgers.find((x) => x.id === id);
      const data = { title: `${b.name} · BŪR FEST`, text: `Mira esta hamburguesa en BŪR FEST ¡El Parche!: ${b.name} de ${b.restaurant} 🍔`, url: location.href.split("#")[0] + "#marcas" };
      try {
        if (navigator.share) await navigator.share(data);
        else { await navigator.clipboard.writeText(`${data.text} ${data.url}`); toast("Link copiado 📋"); }
      } catch {}
    }
  });

  /* ---------- Boletas ---------- */
  $("#ticketsList").innerHTML = tickets.map((t) => `
    <article class="ticket ${t.featured ? "featured" : ""} reveal">
      ${t.featured ? `<span class="ticket-flag">Recomendado</span>` : ""}
      <h3>${esc(t.name)}</h3>
      <div class="t-price">${priceLabel(t.price)}${t.price ? "<small>COP</small>" : ""}</div>
      <ul>${t.perks.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
      <button class="btn ${t.featured ? "btn-yellow" : "btn-pink"} btn-lg btn-block" data-buy="${t.id}">${esc(t.cta || "Comprar")}</button>
    </article>`).join("");

  const coModal = $("#checkoutModal");
  const coForm = $("#checkoutForm");
  const coDay = $("#coDay");
  coDay.innerHTML = (nextEvent?.days || []).map((d) => `<option>${esc(d)}</option>`).join("");
  let co = { t: null, qty: 1 };
  function updateCo() {
    const free = co.t.price === 0;
    $("#coQty").textContent = co.qty;
    $("#coTitle").textContent = free ? "Regístrate gratis" : "Finalizar compra";
    $("#coSummary").innerHTML = `<span>${esc(co.t.name)} × ${co.qty}</span><span>${free ? "Gratis" : cop(co.t.price) + " c/u"}</span>`;
    $("#coTotal").textContent = free ? "GRATIS" : cop(co.t.price * co.qty);
    $("#coPay").hidden = free;
    $("#coNote").hidden = free;
    $("#coSubmit").textContent = free ? "Generar mi boleta" : "Pagar " + cop(co.t.price * co.qty);
  }
  $("#ticketsList").addEventListener("click", (e) => {
    const b = e.target.closest("[data-buy]"); if (!b) return;
    co = { t: tickets.find((t) => t.id === b.dataset.buy), qty: 1 };
    coForm.hidden = false; $("#checkoutDone").hidden = true;
    updateCo(); coModal.showModal();
  });
  coForm.addEventListener("click", (e) => {
    const q = e.target.closest("[data-qty]"); if (!q) return;
    co.qty = Math.min(co.t.price === 0 ? 4 : 10, Math.max(1, co.qty + +q.dataset.qty)); updateCo();
  });
  coForm.addEventListener("input", (e) => e.target.closest(".field")?.classList.remove("invalid"));
  coForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate(coForm)) return;
    const fd = new FormData(coForm);
    const free = co.t.price === 0;
    const btn = $("#coSubmit");
    btn.disabled = true; btn.textContent = free ? "Generando boleta…" : "Procesando pago…";
    setTimeout(() => {
      const code = "BF-" + Math.random().toString(36).slice(2, 8).toUpperCase();
      const ticket = {
        code, type: co.t.name, qty: co.qty, day: fd.get("dia"), name: fd.get("nombre"),
        total: co.t.price * co.qty, pay: free ? "Registro" : fd.get("pago"), at: Date.now(),
      };
      state.myTickets.unshift(ticket); save(); renderMyTickets();
      coForm.hidden = true;
      const done = $("#checkoutDone");
      done.hidden = false;
      done.innerHTML = `
        <h3>¡Nos vemos en el parche!</h3>
        <div class="qr" id="doneQR"></div>
        <p><b>${esc(ticket.type)} × ${ticket.qty}</b><br>${esc(ticket.day)} · Código <code>${code}</code></p>
        <p class="fineprint" style="margin:0">Te enviamos la boleta al correo. También queda en Mi BŪR FEST, incluso sin señal.</p>
        <a class="btn btn-yellow" href="#mi-burfest" data-close>Ver mis boletas</a>`;
      drawQR($("#doneQR"), code);
      btn.disabled = false;
      coForm.reset();
    }, free ? 700 : 1200);
  });

  /* ---------- Sorteo ---------- */
  if (giveaway) {
    $("#gwSteps").innerHTML = giveaway.steps.map((s) => `<li>${esc(s)}</li>`).join("");
  }
  $("#gwLink").href = config.instagram;

  /* ---------- Horarios, aliados y calendario ---------- */
  $("#scheduleList").innerHTML = schedule.map((h, i) => `
    <li><b>${esc(h.day)} ${esc((nextEvent?.days[i] || "").replace(/^\S+\s/, ""))}</b><span>${esc(h.hours)}</span><small>${esc(h.note)}</small></li>`).join("");
  $("#sponsorsList").innerHTML = sponsors.map((s) => `<div class="sponsor">${esc(s)}</div>`).join("");
  $("#sponsorLink").href = `mailto:${config.email}?subject=${encodeURIComponent("Quiero ser aliado de BŪR FEST")}`;

  $("#calBtn").addEventListener("click", () => {
    const start = new Date(config.nextEventDate);
    const end = new Date(start.getTime() + 3 * 864e5);
    const f = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//BURFEST//ES", "BEGIN:VEVENT",
      `UID:${config.nextEventId}@burfest`, `DTSTAMP:${f(new Date())}`, `DTSTART:${f(start)}`, `DTEND:${f(end)}`,
      `SUMMARY:${nextEvent.name}`, `LOCATION:${nextEvent.venue}, ${nextEvent.city}`,
      "DESCRIPTION:Festival de hamburguesas. Ingreso gratuito con registro.", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = "burfest.ics"; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast("📅 Evento agregado a tu calendario");
  });

  function drawQR(el, text) {
    if (!window.qrcode) { el.innerHTML = `<code>${esc(text)}</code>`; return; }
    const qr = window.qrcode(0, "M");
    qr.addData(`BURFEST|${text}`); qr.make();
    el.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
  }

  /* ---------- Mi Burfest ---------- */
  function renderMyTickets() {
    const box = $("#myTickets");
    if (!state.myTickets.length) {
      box.innerHTML = `<p class="placeholder">Aún no tienes boletas. <a href="#boletas">Saca la tuya gratis →</a></p>`;
      return;
    }
    box.innerHTML = state.myTickets.map((t, i) => `
      <div class="my-ticket">
        <div class="qr" data-qr="${i}"></div>
        <div>
          <h4>${esc(t.type)} × ${t.qty}</h4>
          <p>${esc(t.day)} · ${esc(t.name)}</p>
          <p>Código <code>${esc(t.code)}</code></p>
        </div>
      </div>`).join("");
    $$("[data-qr]", box).forEach((el) => drawQR(el, state.myTickets[+el.dataset.qr].code));
  }

  function renderRoute() {
    const ul = $("#myRoute");
    const favs = burgers.filter((b) => state.favs.has(b.id));
    if (!favs.length) {
      ul.innerHTML = `<li style="display:block;background:none;padding:0"><p class="placeholder">Toca el ♥ en las hamburguesas para armar tu ruta. <a href="#marcas">Explorar →</a></p></li>`;
      return;
    }
    ul.innerHTML = favs.map((b) => `
      <li>
        <div class="mini">${burgerSVG(b.palette, "r" + b.id)}</div>
        <div><b>${esc(b.name)}</b><small>${esc(b.restaurant)}</small></div>
        ${state.ratings[b.id] ? `<span class="done">✓ ${"★".repeat(state.ratings[b.id])}</span>` : `<button class="btn btn-pink btn-sm" data-open-route="${b.id}">Votar</button>`}
      </li>`).join("");
  }
  $("#myRoute").addEventListener("click", (e) => {
    const b = e.target.closest("[data-open-route]"); if (b) openBurger(b.dataset.openRoute);
  });

  /* ---------- Preinscripción ---------- */
  const preForm = $("#preForm");
  $("#formEvent").innerHTML = events.map((e) => `<option value="${e.id}">${esc(e.name)} (${esc(e.dates)})</option>`).join("");
  $("#formCategory").innerHTML = `<option value="">Selecciona…</option>` + categories.map((c) => `<option>${esc(c)}</option>`).join("");

  function validate(form) {
    let ok = true;
    $$("input, select, textarea", form).forEach((el) => {
      const wrap = el.closest(".field, .check");
      const valid = el.checkValidity();
      wrap?.classList.toggle("invalid", !valid);
      if (!valid && ok) { el.focus(); ok = false; }
    });
    return ok;
  }
  preForm.addEventListener("input", (e) => e.target.closest(".field, .check")?.classList.remove("invalid"));
  preForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = $("#formMsg");
    if (!validate(preForm)) { msg.className = "form-msg err"; msg.textContent = "Revisa los campos marcados."; return; }
    const data = Object.fromEntries(new FormData(preForm));
    data.fecha = new Date().toISOString();
    const btn = $("button[type=submit]", preForm);
    btn.disabled = true; btn.textContent = "Enviando…";
    try {
      if (config.formEndpoint) {
        const res = await fetch(config.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
        if (!res.ok) throw new Error(res.status);
      } else {
        const all = store.get("preinscripciones", []); all.push(data); store.set("preinscripciones", all);
        await new Promise((r) => setTimeout(r, 700));
      }
      msg.className = "form-msg ok";
      msg.textContent = `¡Gracias, ${data.restaurante}! Recibimos tu preinscripción. Te contactaremos por WhatsApp en los próximos días.`;
      preForm.reset();
      toast("Preinscripción enviada 🍔");
    } catch {
      msg.className = "form-msg err";
      msg.textContent = "No pudimos enviar el formulario. Intenta de nuevo en un momento.";
    } finally {
      btn.disabled = false; btn.textContent = "Enviar preinscripción";
    }
  });

  /* ---------- FAQ y footer ---------- */
  $("#faqList").innerHTML = faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("");
  $("#igLink").href = config.instagram;
  $("#mailLink").href = "mailto:" + config.email;

  /* ---------- Modales: cerrar ---------- */
  $$("dialog").forEach((d) => {
    d.addEventListener("click", (e) => {
      if (e.target === d || e.target.closest("[data-close]")) d.close();
    });
  });

  /* ---------- Toast ---------- */
  let toastT;
  function toast(text) {
    const t = $("#toast"); t.textContent = text; t.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2400);
  }

  /* ---------- Notificaciones (opt-in) ---------- */
  function requestNotify() {
    if ("Notification" in window && Notification.permission === "default") Notification.requestPermission().catch(() => {});
  }

  /* ---------- Header, nav activa, reveal, contadores ---------- */
  const topbar = $("#topbar");
  addEventListener("scroll", () => topbar.classList.toggle("scrolled", scrollY > 10), { passive: true });

  const navLinks = $$(".topnav a, .bottomnav a");
  const sections = $$("main section[id]");
  const navObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const id = en.target.id;
      if (!id) return;
      navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => navObs.observe(s));

  $$(".step, .stat, .h2, .lead, .panel, .ranking, .form, .giveaway, .map-card, .schedule, .sponsor").forEach((el) => el.classList.add("reveal"));
  const revObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); revObs.unobserve(en.target); } });
  }, { threshold: .12 });
  $$(".reveal").forEach((el) => revObs.observe(el));

  const countObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target, end = +el.dataset.count, t0 = performance.now();
      const step = (t) => {
        const k = Math.min(1, (t - t0) / 1400), v = Math.round(end * (1 - Math.pow(1 - k, 3)));
        el.textContent = v.toLocaleString("es-CO");
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step); countObs.unobserve(el);
    });
  }, { threshold: .6 });
  $$("[data-count]").forEach((el) => countObs.observe(el));

  /* ---------- PWA: instalar como app ---------- */
  let deferredPrompt;
  const installBtn = $("#installBtn");
  addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferredPrompt = e; installBtn.hidden = false; });
  installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; installBtn.hidden = true;
  });
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }

  /* ---------- Init ---------- */
  renderBurgers();
  renderMyTickets();
  renderRoute();
})();
