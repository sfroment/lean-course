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

  document.addEventListener("DOMContentLoaded", () => {
    renderIndex();
    wireMarkDone();
    registerSW();
  });
})();
