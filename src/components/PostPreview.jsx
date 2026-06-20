import { Link } from "react-router-dom";
import PostHeader from "./PostHeader.jsx";

function PostPreview({ onOpen, post }) {
  return (
    <Link className="post-preview" to={post.href} aria-label={post.ariaLabel} onClick={onOpen}>
      <article className="post">
        <PostHeader
          avatar={post.authorAvatar}
          avatarAlt={post.authorAlt}
          title={post.authorName}
          subtitle={post.subtitle}
        />
        <p className="post-copy">{post.copy}</p>
        {post.coverImage && (
          <img
            className="post-image"
            src={post.coverImage}
            alt={post.coverAlt}
            width="960"
            height="640"
            loading="lazy"
            decoding="async"
          />
        )}
        <div className="post-open">{post.openLabel}</div>
      </article>
    </Link>
  );
}

export default PostPreview;
