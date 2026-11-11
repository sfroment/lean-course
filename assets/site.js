/* Site-wide behavior: lesson index rendering, progress (localStorage), mark-done
 * buttons, and service worker registration for offline/PWA use on iOS. */
(function () {
  const DONE_KEY = "lean-course-done";

  function getDone() {
    try { return JSON.parse(localStorage.getItem(DONE_KEY) || "[]"); }
    catch { return []; }
  }
  function setDone(arr) { localStorage.setItem(DONE_KEY, JSON.stringify(arr)); }

  async function renderIndex() {
    const list = document.getElementById("lesson-list");
    const bar = document.getElementById("progress-fill");
    const label = document.getElementById("progress-label");
    if (!list) return;
    const manifest = await (await fetch("lessons/manifest.json")).json();
    const done = getDone();
    const phases = {};
    manifest.phases.forEach((p) => (phases[p.id] = p.name));
    let html = "";
    let currentPhase = null;
    let doneCount = 0;
    manifest.lessons.forEach((l) => {
      const isDone = done.includes(l.n);
      if (isDone) doneCount += 1;
      if (l.phase !== currentPhase) {
        currentPhase = l.phase;
        html += `<h2 class="phase">${phases[currentPhase] || currentPhase}</h2>`;
      }
      html += `<a class="lesson-card${isDone ? " done" : ""}" href="lessons/${l.n}-${l.slug}.html">
        <span class="lesson-n">${l.n}</span>
        <span class="lesson-title">${l.title}</span>
        <span class="lesson-check">${isDone ? "✓" : ""}</span>
      </a>`;
    });
    list.innerHTML = html;
    const total = manifest.lessons.length;
    if (bar) bar.style.width = `${(100 * doneCount) / total}%`;
    if (label) label.textContent = `${doneCount} / ${total} lessons done`;
  }

  function wireMarkDone() {
    document.querySelectorAll("[data-mark-done]").forEach((btn) => {
      const n = btn.dataset.markDone;
      const done = getDone();
      const paint = () => {
        const isDone = getDone().includes(n);
        btn.textContent = isDone ? `✓ Lesson ${n} done — tap to undo` : `Mark lesson ${n} as done`;
        btn.classList.toggle("done", isDone);
      };
      btn.addEventListener("click", () => {
        let d = getDone();
        d = d.includes(n) ? d.filter((x) => x !== n) : [...d, n];
        setDone(d);
        paint();
      });
      paint();
    });
  }

  function registerSW() {
    if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    }
  }

  /* Export everything the learner has done on this device (quiz answers with
   * correctness, lessons marked done, pencil scratchpad) as one JSON file.
   * Drop it in chat or commit it under my-data/ — the teacher reviews errors
   * and runs the Lean code for real. */
  function collectLearnerData() {
    const out = { exportedAt: new Date().toISOString(), page: location.href };
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith("lean-course-") || k === "lean-course-auth") continue;
      const v = localStorage.getItem(k);
      try { out[k.slice("lean-course-".length)] = JSON.parse(v); }
      catch { out[k.slice("lean-course-".length)] = v; }
    }
    return out;
  }

  function wireExport() {
    document.querySelectorAll("[data-export]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const data = collectLearnerData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `lean-answers-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        btn.textContent = "⬇ Exported ✓ (check downloads)";
        setTimeout(() => (btn.textContent = "⬇ Export my answers (JSON)"), 2500);
      });
    });
  }

  function wireLock() {
    const b = document.createElement("button");
    b.type = "button";
    b.id = "lock-btn";
    b.textContent = "🔒";
    b.title = "Lock this site (clear access code)";
    b.addEventListener("click", () => {
      try { localStorage.removeItem("lean-course-auth"); } catch (e) {}
      const s = document.querySelector('script[src$="assets/site.js"]');
      const base = s ? s.src.replace(/assets\/site\.js(\?.*)?$/, "") : "./";
      location.href = base + "gate.html";
    });
    document.body.appendChild(b);
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderIndex();
    wireMarkDone();
    wireExport();
    wireLock();
    registerSW();
  });
})();
