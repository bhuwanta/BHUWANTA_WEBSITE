interface AnimatedCounterProps {
  value: string;
}

// Renders the real, final value directly in markup (so SSR HTML and
// no-JS/bot requests always see the true number) and applies a pure-CSS
// fade/scale-in for visual polish. No JS count-up, no IntersectionObserver —
// the previous version rendered "0" until a JS count-up animation finished,
// which is what bots and no-JS users saw.
export function AnimatedCounter({ value }: AnimatedCounterProps) {
  return <span className="inline-block animate-counter-in">{value}</span>
}
