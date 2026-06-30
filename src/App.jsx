import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { getPostById, getPostByPath, getPublishedPostNeighbors } from "./data/posts.js";
import DayPostPage from "./pages/DayPostPage.jsx";
import DevSocialPage from "./pages/DevSocialPage.jsx";
import DevWordsPage from "./pages/DevWordsPage.jsx";
import FeedPage from "./pages/FeedPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import MarianaPage from "./pages/MarianaPage.jsx";
import StaticPostPage from "./pages/StaticPostPage.jsx";
import TripMapPage from "./pages/TripMapPage.jsx";
import { clearActiveAudio, setActiveAudio, stopActiveAudio } from "./utils/audioController.js";

function StoryRoute({ initialPlayback }) {
  const { dayNumber } = useParams();
  const post = getPostByPath(`/day/${dayNumber}`);

  if (!post) return <NotFoundPage />;

  const { previousPost, nextPost } = getPublishedPostNeighbors(post.id);
  const postPlayback = initialPlayback?.postId === post.id ? initialPlayback : null;

  return (
    <DayPostPage
      initialPlayback={postPlayback}
      nextPost={nextPost}
      post={post}
      previousPost={previousPost}
      key={post.id}
    />
  );
}

function StaticStoryRoute() {
  const { dayNumber } = useParams();
  const post = getPostByPath(`/day/${dayNumber}`);

  if (!post) return <NotFoundPage />;

  const { previousPost, nextPost } = getPublishedPostNeighbors(post.id);

  return (
    <StaticPostPage
      nextPost={nextPost}
      post={post}
      previousPost={previousPost}
      key={`static-${post.id}`}
    />
  );
}

function App() {
  const [initialPlayback, setInitialPlayback] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!initialPlayback) return;

    const playbackPost = getPostById(initialPlayback.postId);
    if (location.pathname.startsWith("/day/") && playbackPost?.href !== location.pathname) {
      setInitialPlayback(null);
    }
  }, [initialPlayback, location.pathname]);

  function navigateToPost(postId, event) {
    event?.preventDefault();

    const post = getPostById(postId);
    if (!post) {
      stopActiveAudio();
      setInitialPlayback(null);
      navigate(`/day/${postId}`);
      return;
    }

    const firstMessage = post.story.conversation[0];
    const audioPath = post.story.getAudioPath(firstMessage, 0);
    const audio = new Audio(audioPath);

    setActiveAudio(audio);
    audio.addEventListener("ended", () => clearActiveAudio(audio), { once: true });
    audio.addEventListener("error", () => clearActiveAudio(audio), { once: true });
    audio.play().catch(() => clearActiveAudio(audio));
    setInitialPlayback({ postId, audio, audioPath });
    navigate(post.href);
  }

  return (
    <Routes>
      <Route path="/" element={<FeedPage onOpenPost={navigateToPost} />} />
      <Route path="/day/:dayNumber" element={<StoryRoute initialPlayback={initialPlayback} />} />
      <Route path="/day/:dayNumber/static" element={<StaticStoryRoute />} />
      <Route path="/mariana" element={<MarianaPage />} />
      <Route path="/day1.html" element={<Navigate to="/day/1" replace />} />
      <Route path="/trip-map" element={<TripMapPage onOpenPost={navigateToPost} />} />
      <Route path="/dev/social" element={<DevSocialPage />} />
      <Route path="/dev/words" element={<DevWordsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
