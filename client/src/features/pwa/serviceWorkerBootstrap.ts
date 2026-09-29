export const SERVICE_WORKER_RESET_FLAG = "jala-sw-reset";

export const SERVICE_WORKER_BOOTSTRAP = `(function () {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", function () {
    navigator.serviceWorker.register("/sw.js").catch(function () {});
  });

  function alreadyReset() {
    try {
      return sessionStorage.getItem("${SERVICE_WORKER_RESET_FLAG}") === "1";
    } catch (error) {
      return true;
    }
  }

  function markReset() {
    try {
      sessionStorage.setItem("${SERVICE_WORKER_RESET_FLAG}", "1");
    } catch (error) {}
  }

  function resetAndReload() {
    markReset();
    var unregister = navigator.serviceWorker
      .getRegistrations()
      .then(function (registrations) {
        return Promise.all(registrations.map(function (registration) { return registration.unregister(); }));
      })
      .catch(function () {});
    var clear = typeof caches === "undefined"
      ? Promise.resolve()
      : caches
          .keys()
          .then(function (names) {
            return Promise.all(
              names
                .filter(function (name) { return name.indexOf("jala-gpa-") === 0; })
                .map(function (name) { return caches.delete(name); }),
            );
          })
          .catch(function () {});
    Promise.all([unregister, clear]).then(function () { location.reload(); });
  }

  window.addEventListener(
    "error",
    function (event) {
      var target = event.target;
      if (!target || (target.tagName !== "SCRIPT" && target.tagName !== "LINK")) return;
      var source = target.src || target.href || "";
      if (source.indexOf("/_next/static/") === -1) return;
      if (!navigator.onLine || !navigator.serviceWorker.controller || alreadyReset()) return;
      resetAndReload();
    },
    true,
  );
})();`;
