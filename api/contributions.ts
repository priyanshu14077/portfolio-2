// GET /api/contributions: the last year of GitHub contributions as { total, days }.
// With GITHUB_TOKEN set it uses the GraphQL API; without one it reads the public
// contributions page, which needs no token. Vercel's CDN caches the answer.
const LOGIN = process.env.GITHUB_LOGIN ?? 'priyanshu14077'

export type Day = { date: string; count: number }
export type Contributions = { total: number; days: Day[] }

async function fromGraphQL(token: string): Promise<Contributions> {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { authorization: `bearer ${token}`, 'content-type': 'application/json', 'user-agent': 'portfolio-contributions' },
    body: JSON.stringify({
      query: `query($login: String!) { user(login: $login) { contributionsCollection { contributionCalendar {
        totalContributions weeks { contributionDays { date contributionCount } } } } } }`,
      variables: { login: LOGIN },
    }),
  })
  if (!res.ok) throw new Error(`GitHub GraphQL ${res.status}`)
  const json = await res.json()
  const cal = json?.data?.user?.contributionsCollection?.contributionCalendar
  if (!cal) throw new Error('GitHub GraphQL: no calendar')
  const days: Day[] = cal.weeks.flatMap((w: { contributionDays: { date: string; contributionCount: number }[] }) =>
    w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount })),
  )
  return { total: cal.totalContributions, days }
}

// Each day is a <td data-date id="contribution-day-component-…">, and its count is in the
// <tool-tip for="that id">, e.g. "3 contributions on May 2nd." or "No contributions on …".
async function fromPage(): Promise<Contributions> {
  const res = await fetch(`https://github.com/users/${LOGIN}/contributions`, { headers: { 'user-agent': 'portfolio-contributions' } })
  if (!res.ok) throw new Error(`GitHub page ${res.status}`)
  const html = await res.text()
  const dateById = new Map<string, string>()
  for (const m of html.matchAll(/<td\b[^>]*>/g)) {
    const date = /data-date="([\d-]+)"/.exec(m[0])?.[1]
    const id = /\bid="([^"]+)"/.exec(m[0])?.[1]
    if (date && id) dateById.set(id, date)
  }
  const countById = new Map<string, number>()
  for (const m of html.matchAll(/<tool-tip\b[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
    const n = /^([\d,]+) contributions? on/.exec(m[2].trim())
    countById.set(m[1], n ? Number(n[1].replace(/,/g, '')) : 0)
  }
  const days = [...dateById].map(([id, date]) => ({ date, count: countById.get(id) ?? 0 })).sort((a, b) => a.date.localeCompare(b.date))
  if (days.length < 300) throw new Error(`GitHub page: only ${days.length} days parsed`)
  return { total: days.reduce((s, d) => s + d.count, 0), days }
}

export async function GET(): Promise<Response> {
  try {
    const token = process.env.GITHUB_TOKEN
    const data = token ? await fromGraphQL(token).catch(fromPage) : await fromPage()
    return Response.json(data, {
      headers: { 'cache-control': 'public, max-age=600, s-maxage=3600, stale-while-revalidate=600' },
    })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 502, headers: { 'cache-control': 'no-store' } })
  }
}
