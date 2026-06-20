function Avatar({ alt, className = "", src, title }) {
  const classes = ["avatar", className].filter(Boolean).join(" ");

  return (
    <div className={classes} title={title}>
      <img src={src} alt={alt} width="384" height="384" decoding="async" />
    </div>
  );
}

export default Avatar;
