/* ─── Analytics Event Layer ───
 * Provider-agnostic analytics utility.
 * Currently logs to console in dev mode.
 * Swap the `send` function internals to wire up any provider
 * (Google Analytics, Mixpanel, PostHog, Amplitude, etc.)
 */

export type AnalyticsEvent =
  | "homepage_view"
  | "games_page_view"
  | "gilli_panda_detail_view"
  | "gilli_panda_play_view"
  | "game_start"
  | "successful_hit"
  | "miss"
  | "game_over"
  | "leaderboard_submit"
  | "score_shared";

type EventProperties = Record<string, string | number | boolean | undefined>;

const IS_DEV = import.meta.env.DEV;

function send(event: AnalyticsEvent, properties?: EventProperties): void {
  // ── Future: replace this block with your analytics provider ──
  // e.g. posthog.capture(event, properties);
  // e.g. gtag('event', event, properties);
  // e.g. mixpanel.track(event, properties);

  if (IS_DEV) {
    console.debug(`[analytics] ${event}`, properties ?? "");
  }
}

/** Track an analytics event with optional properties */
export function trackEvent(event: AnalyticsEvent, properties?: EventProperties): void {
  try {
    send(event, properties);
  } catch {
    // Silently fail — analytics should never break the app
  }
}
