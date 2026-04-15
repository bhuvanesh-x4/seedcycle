export default function GlassCard({ children, className = "" }) {
  return (
    <div className={"rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-5 " + className}>
      {children}
    </div>
  );
}
