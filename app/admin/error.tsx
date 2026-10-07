"use client";
export default function AdminError({ reset }: { reset: () => void }) {
  return <main id="main" className="admin-empty"><h1>Something went wrong</h1><p>Please try loading the dashboard again.</p><button className="admin-button" onClick={reset}>Try again</button></main>;
}
