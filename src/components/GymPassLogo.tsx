export default function GymPassLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
          <rect x="3" y="10" width="3" height="8" rx="1" fill="white" />
          <rect x="8" y="6" width="3" height="12" rx="1" fill="white" />
          <rect x="13" y="2" width="3" height="16" rx="1" fill="white" />
          <rect x="18" y="8" width="3" height="10" rx="1" fill="white" />
        </svg>
      </span>
      <span className="text-lg font-bold tracking-tight text-text">Gym Pass</span>
    </span>
  );
}
