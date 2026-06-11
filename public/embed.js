/**
 * Answerbase embeddable widget loader. Vanilla JS, no dependencies.
 * Usage:
 *   <script src="https://YOUR-APP/embed.js" data-bot="PUBLIC_TOKEN" async></script>
 *
 * Derives the app origin from its own <script> src, so it works on any site.
 */
(function () {
  "use strict";
  if (window.__answerbaseLoaded) return;
  window.__answerbaseLoaded = true;

  var script =
    document.currentScript ||
    document.querySelector("script[data-bot][src*='embed.js']");
  if (!script) return;

  var token = script.getAttribute("data-bot");
  if (!token) return;

  var origin = new URL(script.src).origin;
  var DEFAULT_ACCENT = "#047857";

  function init(accent) {
    var open = false;

    // --- Launcher bubble ---
    var launcher = document.createElement("button");
    launcher.setAttribute("aria-label", "Open chat");
    style(launcher, {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      width: "56px",
      height: "56px",
      borderRadius: "9999px",
      border: "none",
      cursor: "pointer",
      background: accent,
      boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: "2147483646",
      transition: "transform 150ms ease-out",
      padding: "0",
    });
    launcher.innerHTML = chatIcon();
    launcher.onmouseenter = function () {
      launcher.style.transform = "scale(1.06)";
    };
    launcher.onmouseleave = function () {
      launcher.style.transform = "scale(1)";
    };

    // --- Panel (iframe) ---
    var frame = document.createElement("iframe");
    frame.title = "Chat";
    frame.src = origin + "/w/" + encodeURIComponent(token);
    style(frame, {
      position: "fixed",
      bottom: "88px",
      right: "20px",
      width: "380px",
      height: "560px",
      maxWidth: "calc(100vw - 40px)",
      maxHeight: "calc(100vh - 108px)",
      border: "none",
      borderRadius: "12px",
      background: "#ffffff",
      boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
      zIndex: "2147483647",
      opacity: "0",
      transform: "scale(0.96)",
      transformOrigin: "bottom right",
      transition: "opacity 150ms ease-out, transform 150ms ease-out",
      pointerEvents: "none",
      display: "none",
    });

    function setOpen(next) {
      open = next;
      if (open) {
        frame.style.display = "block";
        // next frame so the transition runs
        requestAnimationFrame(function () {
          frame.style.opacity = "1";
          frame.style.transform = "scale(1)";
          frame.style.pointerEvents = "auto";
        });
        launcher.innerHTML = closeIcon();
        launcher.setAttribute("aria-label", "Close chat");
      } else {
        frame.style.opacity = "0";
        frame.style.transform = "scale(0.96)";
        frame.style.pointerEvents = "none";
        setTimeout(function () {
          if (!open) frame.style.display = "none";
        }, 160);
        launcher.innerHTML = chatIcon();
        launcher.setAttribute("aria-label", "Open chat");
      }
    }

    launcher.addEventListener("click", function () {
      setOpen(!open);
    });

    window.addEventListener("message", function (e) {
      if (e.data && e.data.type === "answerbase:close") setOpen(false);
    });

    document.body.appendChild(frame);
    document.body.appendChild(launcher);
  }

  function chatIcon() {
    return (
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" ' +
      'stroke="#ffffff" stroke-width="2" stroke-linecap="round" ' +
      'stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 ' +
      '2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
    );
  }
  function closeIcon() {
    return (
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" ' +
      'stroke="#ffffff" stroke-width="2" stroke-linecap="round" ' +
      'stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>'
    );
  }
  function style(el, props) {
    for (var k in props) el.style[k] = props[k];
  }

  // Fetch the bot's accent color, then render. Falls back to the default.
  fetch(origin + "/api/widget/" + encodeURIComponent(token) + "/config")
    .then(function (r) {
      return r.ok ? r.json() : null;
    })
    .then(function (cfg) {
      init(cfg && cfg.accentColor ? cfg.accentColor : DEFAULT_ACCENT);
    })
    .catch(function () {
      init(DEFAULT_ACCENT);
    });
})();
