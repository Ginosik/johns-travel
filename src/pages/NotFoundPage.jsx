import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <main className="post-page">
      <div className="post-page-actions">
        <Link className="back-link" to="/">Back to feed</Link>
      </div>
      <article className="post detail-post">
        <h1>Story not found</h1>
        <p className="post-copy">This travel story has not been published yet.</p>
      </article>
    </main>
  );
}

export default NotFoundPage;
