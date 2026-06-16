import { useEffect, useState } from "react";
import { conversation } from "./data/day1Content.js";
import Day1Page from "./pages/Day1Page.jsx";
import FeedPage from "./pages/FeedPage.jsx";
import { getDay1AudioPath } from "./utils/day1Audio.js";

function App() {
  const [route, setRoute] = useState(window.location.pathname);
  const [initialDay1Playback, setInitialDay1Playback] = useState(null);

  useEffect(() => {
    function handlePopState() {
      setRoute(window.location.pathname);
      setInitialDay1Playback(null);
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function navigateToFeed(event) {
    event?.preventDefault();
    window.history.pushState(null, "", "/");
    setRoute("/");
    setInitialDay1Playback(null);
  }

  function navigateToDay1(event) {
    event?.preventDefault();

    const firstMessage = conversation[0];
    const audioPath = getDay1AudioPath(firstMessage, 0);
    const audio = new Audio(audioPath);

    audio.play().catch(() => {});
    window.history.pushState(null, "", "/day/1");
    setInitialDay1Playback({ audio, audioPath });
    setRoute("/day/1");
  }

  if (route === "/day/1" || route === "/day1.html") {
    return <Day1Page initialPlayback={initialDay1Playback} onBack={navigateToFeed} />;
  }

  return <FeedPage onOpenDay1={navigateToDay1} />;
}

export default App;
