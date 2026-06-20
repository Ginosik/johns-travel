import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { getPostById, getPostByPath, getPublishedPostNeighbors } from "./data/posts.js";
import DayPostPage from "./pages/DayPostPage.jsx";
import FeedPage from "./pages/FeedPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import TripMapPage from "./pages/TripMapPage.jsx";

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

function App() {
  const [initialPlayback, setInitialPlayback] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!initialPlayback) return;

    const playbackPost = getPostById(initialPlayback.postId);
    if (playbackPost?.href !== location.pathname) {
      setInitialPlayback(null);
    }
  }, [initialPlayback, location.pathname]);

  function navigateToPost(postId, event) {
    event?.preventDefault();

    const post = getPostById(postId);
    if (!post) {
      setInitialPlayback(null);
      navigate(`/day/${postId}`);
      return;
    }

    const firstMessage = post.story.conversation[0];
    const audioPath = post.story.getAudioPath(firstMessage, 0);
    const audio = new Audio(audioPath);

    audio.play().catch(() => {});
    setInitialPlayback({ postId, audio, audioPath });
    navigate(post.href);
  }

  return (
    <Routes>
      <Route path="/" element={<FeedPage onOpenPost={navigateToPost} />} />
      <Route path="/day/:dayNumber" element={<StoryRoute initialPlayback={initialPlayback} />} />
      <Route path="/day1.html" element={<Navigate to="/day/1" replace />} />
      <Route path="/trip-map" element={<TripMapPage onOpenPost={navigateToPost} />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
