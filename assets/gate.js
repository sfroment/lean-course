/* Access gate — soft protection for this static site.
 * Every page loads this in <head>: unless localStorage holds the SHA-256 of the
 * access code, the page redirects to gate.html before anything renders.
 * gate.html sets window.__LEAN_GATE_PAGE__ = true before loading this file.
 *
 * Change the code with:  python3 scripts/set-gate-code.py "new code"
 * (run without arguments to generate a random one)
 *
 * Note: this is client-side gating — determined visitors can read the static
 * files. For hard protection see README.md (private repo + paid Pages, or a
 * basic-auth host like Koyeb / Cloudflare Access with a custom domain).
 */
(function () {
  var KEY = "lean-course-auth";
  var SALT = "lean-course-gate-v1";
  var EXPECTED = "197039a5fdbc07b074f622a84727ada814406b7f99fc4ca053f13401695e550d"; // replaced by scripts/set-gate-code.py

  var base = ((document.currentScript && document.currentScript.src) || "")
    .replace(/assets\/gate\.js(\?.*)?$/, "");
  var gateUrl = base + "gate.html";

  function authed() {
    try { return localStorage.getItem(KEY) === EXPECTED; } catch (e) { return false; }
  }

  function sha256hex(s) {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)).then(function (b) {
      return Array.prototype.map.call(new Uint8Array(b), function (x) {
        return x.toString(16).padStart(2, "0");
      }).join("");
    });
  }

  if (window.__LEAN_GATE_PAGE__) {
    // On the gate page: already-unlocked visitors go straight to the course.
    if (authed()) location.replace(base + "index.html");
    document.addEventListener("DOMContentLoaded", function () {
      var form = document.getElementById("gate-form");
      var input = document.getElementById("gate-code");
      var err = document.getElementById("gate-error");
      input.focus();
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!window.crypto || !crypto.subtle) {
          err.textContent = "Needs HTTPS — open the site over https://";
          return;
        }
        sha256hex(SALT + input.value).then(function (h) {
          if (h === EXPECTED) {
            try { localStorage.setItem(KEY, h); } catch (ignore) {}
            // keep the raw code in sessionStorage only (per-tab, gone on close) so the
            // page can call the Lean runner with it as the shared secret
            try { sessionStorage.setItem("lean-course-code", input.value); } catch (ignore2) {}
            location.href = base + "index.html";
          } else {
            err.textContent = "Wrong access code.";
            input.value = "";
            input.focus();
          }
        });
      });
    });
    return;
  }

  // Guard on every other page: redirect before first paint if not unlocked.
  if (!authed()) location.replace(gateUrl);
})();
