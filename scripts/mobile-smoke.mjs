const debugPort = process.env.CHROME_DEBUG_PORT ?? "9222";
const baseUrl = process.env.APP_URL ?? "http://127.0.0.1:4173";

const viewports = [
  { name: "phone-320", width: 320, height: 700, mobile: true },
  { name: "android-360", width: 360, height: 800, mobile: true },
  { name: "phone-390", width: 390, height: 844, mobile: true },
  { name: "tablet-768", width: 768, height: 1024, mobile: true },
  { name: "tablet-1024", width: 1024, height: 768, mobile: false },
  { name: "phone-landscape", width: 844, height: 390, mobile: true },
  { name: "phone-keyboard", width: 390, height: 430, mobile: true, keyboard: true }
];

const routes = ["/", "/day/1", "/day/2", "/trip-map"];

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function connectToChrome() {
  const response = await fetch(`http://127.0.0.1:${debugPort}/json`);
  const targets = await response.json();
  const target = targets.find((item) => item.type === "page");
  if (!target) throw new Error("No Chrome page target is available.");

  const socket = new WebSocket(target.webSocketDebuggerUrl);
  const pending = new Map();
  let nextId = 1;

  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  });

  function send(method, params = {}) {
    const id = nextId++;
    socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
  }

  return { send, close: () => socket.close() };
}

const chrome = await connectToChrome();
const results = [];

for (const viewport of viewports) {
  await chrome.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: viewport.mobile ? 2 : 1,
    mobile: viewport.mobile
  });
  await chrome.send("Emulation.setTouchEmulationEnabled", {
    enabled: viewport.mobile,
    maxTouchPoints: viewport.mobile ? 5 : 1
  });

  for (const route of routes) {
    await chrome.send("Page.navigate", { url: `${baseUrl}${route}` });
    await delay(700);

    let routeInteraction = null;
    if (route.startsWith("/day/")) {
      const interaction = await chrome.send("Runtime.evaluate", {
        awaitPromise: true,
        returnByValue: true,
        expression: `(async () => {
          document.querySelector('.continue-button')?.click();
          const toggle = document.querySelector('.translation-toggle');
          const beforeTop = toggle?.getBoundingClientRect().top ?? 0;
          toggle?.click();
          await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          const afterTop = toggle?.getBoundingClientRect().top ?? 0;
          return {
            translationJump: Math.round(afterTop - beforeTop),
            audioClass: document.querySelector('.message-play-button')?.className ?? null
          };
        })()`
      });
      routeInteraction = interaction.result.value;
      await delay(250);
    }

    if (viewport.keyboard && route === "/") {
      await chrome.send("Runtime.evaluate", {
        expression: `document.querySelector('input[type="search"]')?.focus()`
      });
    }

    const evaluation = await chrome.send("Runtime.evaluate", {
      returnByValue: true,
      expression: `(() => {
        const root = document.documentElement;
        const body = document.body;
        const width = window.innerWidth;
        const documentWidth = Math.max(root.scrollWidth, body.scrollWidth);
        const controls = [...document.querySelectorAll('button, a')]
          .filter((element) => {
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return !element.closest('.react-flow__attribution') && style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
          });
        const undersizedControls = controls
          .filter((element) => {
            const rect = element.getBoundingClientRect();
            return ${viewport.mobile} && (rect.width < 44 || rect.height < 44);
          })
          .map((element) => ({
            label: element.getAttribute('aria-label') || element.textContent.trim().slice(0, 40),
            width: Math.round(element.getBoundingClientRect().width),
            height: Math.round(element.getBoundingClientRect().height)
          }));
        return {
          title: document.title,
          viewportWidth: width,
          documentWidth,
          overflow: documentWidth > width + 1,
          undersizedControls
          ,focusedInputVisible: (() => {
            const input = document.activeElement?.matches?.('input') ? document.activeElement : null;
            if (!input) return null;
            const rect = input.getBoundingClientRect();
            return rect.top >= 0 && rect.bottom <= window.innerHeight;
          })()
        };
      })()`
    });

    results.push({ viewport: viewport.name, route, ...evaluation.result.value, ...routeInteraction });
  }
}

await chrome.send("Emulation.setDeviceMetricsOverride", {
  width: 390,
  height: 844,
  deviceScaleFactor: 2,
  mobile: true
});
await chrome.send("Page.navigate", { url: `${baseUrl}/` });
await delay(700);
const scrollCheck = await chrome.send("Runtime.evaluate", {
  awaitPromise: true,
  returnByValue: true,
  expression: `(async () => {
    const targetScroll = Math.min(420, document.documentElement.scrollHeight - window.innerHeight);
    window.scrollTo(0, targetScroll);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const before = window.scrollY;
    document.querySelectorAll('.post-preview')[1]?.click();
    await new Promise((resolve) => setTimeout(resolve, 500));
    history.back();
    await new Promise((resolve) => setTimeout(resolve, 700));
    return { before: Math.round(before), after: Math.round(window.scrollY) };
  })()`
});

await chrome.send("Page.navigate", { url: `${baseUrl}/day/1` });
await delay(700);
const progressBefore = await chrome.send("Runtime.evaluate", {
  awaitPromise: true,
  returnByValue: true,
  expression: `(async () => {
    document.querySelector('.continue-button')?.click();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    document.querySelector('.continue-button')?.click();
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    return document.querySelectorAll('.conversation-message:not(:has(.typing-dots))').length;
  })()`
});
await chrome.send("Emulation.setDeviceMetricsOverride", {
  width: 844,
  height: 390,
  deviceScaleFactor: 2,
  mobile: true
});
await delay(300);
const progressAfter = await chrome.send("Runtime.evaluate", {
  returnByValue: true,
  expression: `document.querySelectorAll('.conversation-message:not(:has(.typing-dots))').length`
});

await chrome.send("Emulation.setDeviceMetricsOverride", {
  width: 390,
  height: 844,
  deviceScaleFactor: 2,
  mobile: true
});
await chrome.send("Page.navigate", { url: `${baseUrl}/day/1` });
await delay(700);
const audioBefore = await chrome.send("Runtime.evaluate", {
  returnByValue: true,
  expression: `({
    resources: performance.getEntriesByType('resource').filter((entry) => /\\.(mp3|wav)(\\?|$)/.test(entry.name)).length,
    button: (() => { const rect = document.querySelector('.continue-button').getBoundingClientRect(); return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }; })()
  })`
});
await chrome.send("Input.dispatchMouseEvent", { type: "mousePressed", button: "left", clickCount: 1, x: audioBefore.result.value.button.x, y: audioBefore.result.value.button.y });
await chrome.send("Input.dispatchMouseEvent", { type: "mouseReleased", button: "left", clickCount: 1, x: audioBefore.result.value.button.x, y: audioBefore.result.value.button.y });
await delay(500);
const audioAfter = await chrome.send("Runtime.evaluate", {
  returnByValue: true,
  expression: `({
    resources: performance.getEntriesByType('resource').filter((entry) => /\\.(mp3|wav)(\\?|$)/.test(entry.name)).length,
    state: document.querySelector('.message-play-button')?.className ?? null
  })`
});

chrome.close();

for (const result of results) console.log(JSON.stringify(result));
console.log(JSON.stringify({ scrollRestoration: scrollCheck.result.value }));
console.log(JSON.stringify({ orientationProgress: { before: progressBefore.result.value, after: progressAfter.result.value } }));
console.log(JSON.stringify({ mobileAudio: { before: audioBefore.result.value.resources, after: audioAfter.result.value.resources, state: audioAfter.result.value.state } }));

const failures = results.filter((result) => result.overflow);
const undersized = results.flatMap((result) => result.undersizedControls.map((control) => ({ ...control, viewport: result.viewport, route: result.route })));
const scrollDelta = Math.abs(scrollCheck.result.value.before - scrollCheck.result.value.after);
const progressChanged = progressBefore.result.value !== progressAfter.result.value;
const audioDidNotStart = audioBefore.result.value.resources !== 0 || audioAfter.result.value.resources < 1 || !audioAfter.result.value.state?.includes("is-playing");
if (failures.length > 0) {
  console.error(`Mobile smoke check found ${failures.length} overflow failure(s).`);
  process.exitCode = 1;
}
if (undersized.length > 0) {
  console.error(`Mobile smoke check found ${undersized.length} undersized control(s).`);
  process.exitCode = 1;
}
if (scrollDelta > 5 || progressChanged) {
  console.error("Mobile navigation state was not preserved.");
  process.exitCode = 1;
}
if (audioDidNotStart) {
  console.error("Mobile audio did not stay lazy and enter playback after a trusted tap.");
  process.exitCode = 1;
}
