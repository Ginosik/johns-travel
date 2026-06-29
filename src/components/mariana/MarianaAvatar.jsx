import { useState } from "react";

const MARIANA_AVATAR_SRC = "/images/mariana-avatar.png";

function MarianaAvatar({ className = "mariana-avatar" }) {
  const [hasImageError, setHasImageError] = useState(false);

  return (
    <div className={className} aria-hidden="true">
      {!hasImageError ? (
        <img src={MARIANA_AVATAR_SRC} alt="" onError={() => setHasImageError(true)} />
      ) : (
        <span>M</span>
      )}
    </div>
  );
}

export default MarianaAvatar;
