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
