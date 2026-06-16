import PostHeader from "./PostHeader.jsx";

function PostPreview({ onOpen, post }) {
  return (
    <a className="post-preview" href={post.href} aria-label={post.ariaLabel} onClick={onOpen}>
      <article className="post">
        <PostHeader
          avatar={post.authorAvatar}
          avatarAlt={post.authorAlt}
          title={post.authorName}
          subtitle={post.subtitle}
        />
        <p className="post-copy">{post.copy}</p>
        <div className="post-open">{post.openLabel}</div>
      </article>
    </a>
  );
}

export default PostPreview;
