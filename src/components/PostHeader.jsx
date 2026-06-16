import Avatar from "./Avatar.jsx";

function PostHeader({ avatar, avatarAlt, subtitle, title }) {
  return (
    <header className="post-head">
      <Avatar src={avatar} alt={avatarAlt} />
      <div className="post-meta">
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
    </header>
  );
}

export default PostHeader;
