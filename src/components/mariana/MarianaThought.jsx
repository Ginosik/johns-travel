function MarianaThought({ children, label }) {
  return (
    <aside className="mariana-thought">
      <span>{label}</span>
      <p>{children}</p>
    </aside>
  );
}

export default MarianaThought;
