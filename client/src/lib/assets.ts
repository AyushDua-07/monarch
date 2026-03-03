// CDN URLs for all generated visual assets
export const ASSETS = {
  heroBg: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663355234723/efa49xu7T2Q2E7hNdGy9jA/hero-bg_3d923c1b.jpg',
  dashboardBg: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663355234723/efa49xu7T2Q2E7hNdGy9jA/dashboard-bg_581d74db.jpg',
  rankS: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663355234723/efa49xu7T2Q2E7hNdGy9jA/rank-s-badge_81e8eb35.png',
  rankA: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663355234723/efa49xu7T2Q2E7hNdGy9jA/rank-a-badge_a15471ef.png',
  rankB: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663355234723/efa49xu7T2Q2E7hNdGy9jA/rank-b-badge_d9a81570.png',
  rankC: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663355234723/efa49xu7T2Q2E7hNdGy9jA/rank-c-badge_33232dbb.png',
  rankD: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663355234723/efa49xu7T2Q2E7hNdGy9jA/rank-d-badge_cf2c177a.png',
  rankE: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663355234723/efa49xu7T2Q2E7hNdGy9jA/rank-e-badge_f6b76f18.png',
  levelUp: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663355234723/efa49xu7T2Q2E7hNdGy9jA/level-up-effect_11b02def.png',
  questComplete: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663355234723/efa49xu7T2Q2E7hNdGy9jA/quest-complete_45a135f0.png',
} as const;

export function getRankBadge(rank: string): string {
  const map: Record<string, string> = {
    S: ASSETS.rankS,
    A: ASSETS.rankA,
    B: ASSETS.rankB,
    C: ASSETS.rankC,
    D: ASSETS.rankD,
    E: ASSETS.rankE,
  };
  return map[rank] || ASSETS.rankE;
}
