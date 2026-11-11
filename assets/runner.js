/* "▶ Run" button: executes the scratchpad's Lean code on the runner backend
 * (POST {code} with the access code as X-Access-Code header) and shows output. */
(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("run");
    const out = document.getElementById("run-output");
    const editor = document.getElementById("scratch");
    if (!btn || !out || !editor) return;

    function accessCode() {
      let code = null;
      try { code = sessionStorage.getItem("lean-course-code"); } catch (e) {}
      if (!code) {
        code = window.prompt("Enter the site access code once (to run Lean on the server):");
        if (code) { try { sessionStorage.setItem("lean-course-code", code); } catch (e) {} }
      }
      return code;
    }

    btn.addEventListener("click", async () => {
      if (!window.RUNNER_URL) {
        out.textContent = "Runner not configured yet (window.RUNNER_URL is null).";
        out.className = "run-output err";
        return;
      }
      const code = accessCode();
      if (!code) { out.textContent = "No access code — run cancelled."; out.className = "run-output err"; return; }
      btn.disabled = true;
      out.textContent = "running…";
      out.className = "run-output";
      try {
        const resp = await fetch(window.RUNNER_URL + "/run", {
          method: "POST",
          headers: { "content-type": "application/json", "x-access-code": code },
          body: JSON.stringify({ code: editor.value }),
        });
        const data = await resp.json().catch(() => ({}));
        if (resp.status === 401) {
          out.textContent = "Runner rejected the access code (401).";
        } else {
          out.textContent = (data.output || "(no output)") + (data.rc !== 0 ? `\n[exit code ${data.rc}]` : "\n[ok — no errors]");
        }
        out.className = "run-output" + (data.rc ? " err" : " ok");
      } catch (e) {
        out.textContent = "Runner unreachable: " + e.message;
        out.className = "run-output err";
      }
      btn.disabled = false;
    });
  });
})();
