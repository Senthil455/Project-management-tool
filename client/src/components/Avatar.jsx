export default function Avatar({ user, size = 32, showName = false, className = '' }) {
  if (!user) {
    return (
      <span className={`avatar avatar-empty ${className}`} style={{ width: size, height: size, fontSize: size * 0.4 }}>
        ?
      </span>
    );
  }
  const initials = user.name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <span className={`avatar-wrap ${className}`} title={user.name}>
      <span
        className="avatar"
        style={{ width: size, height: size, fontSize: size * 0.38, background: user.avatarColor || '#0052CC' }}
      >
        {initials}
      </span>
      {showName && <span className="avatar-name">{user.name}</span>}
    </span>
  );
}