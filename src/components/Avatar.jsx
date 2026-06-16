function Avatar({ alt, className = "", src, title }) {
  const classes = ["avatar", className].filter(Boolean).join(" ");

  return (
    <div className={classes} title={title}>
      <img src={src} alt={alt} />
    </div>
  );
}

export default Avatar;
