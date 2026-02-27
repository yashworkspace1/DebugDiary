import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'

const resend = new Resend(process.env.RESEND_API_KEY)

type DigestType = 'morning' | 'evening'

export async function sendDigest(userId: string, type: DigestType) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, emailAlerts: true, timezone: true }
  })

  if (!user?.email || !user?.emailAlerts) return

  // Single daily digest covers full 24 hours
  const hoursBack = 24
  const windowStart = new Date(Date.now() - hoursBack * 60 * 60 * 1000)

  const entries = await prisma.entry.findMany({
    where: { userId, createdAt: { gte: windowStart } },
    orderBy: [{ occurrences: 'desc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      errorText: true,
      errorType: true,
      occurrences: true,
      source: true,
      createdAt: true,
      aiEnriched: true,
      summary: true,
      fixText: true
    },
    take: 20
  })

  const totalErrors = entries.length
  const newErrors = entries.filter((e: any) => e.occurrences === 1).length
  const recurringErrors = entries.filter((e: any) => e.occurrences > 1).length
  const isAllClear = totalErrors === 0
  const appUrl = process.env.NEXTAUTH_URL || 'https://debugdiary.vercel.app'
  const isMorning = type === 'morning'
  const emoji = isMorning ? '☕' : '🌙'
  const timeLabel = isMorning ? 'in the last 24 hours' : 'today'

  const subject = isAllClear
    ? `${emoji} DebugDiary — All clear ${timeLabel}! ✅`
    : `${emoji} DebugDiary — ${totalErrors} error${totalErrors > 1 ? 's' : ''} ${timeLabel}`

  const errorItemsHtml = entries.slice(0, 5).map((entry: any) => `
    <div style="background:#0f0f0f;border:1px solid #222;border-left:3px solid ${entry.occurrences > 1 ? '#ff8800' : '#ff4444'};border-radius:8px;padding:14px;margin-bottom:10px;">
      <div style="font-family:monospace;font-size:12px;color:#ff6666;margin-bottom:8px;word-break:break-all;">
        ${entry.errorText.substring(0, 120)}${entry.errorText.length > 120 ? '...' : ''}
      </div>
      ${entry.summary || entry.fixText ? `<div style="font-size:12px;color:#00cc66;margin-bottom:8px;">💡 ${(entry.summary || entry.fixText).substring(0, 100)}</div>` : ''}
      <div style="font-size:11px;color:#555;">
        <span style="display:inline-block;padding:2px 8px;border-radius:20px;font-size:11px;${entry.occurrences > 1
      ? 'background:#ff880015;color:#ff9933;border:1px solid #ff880030;'
      : 'background:#ff444415;color:#ff6666;border:1px solid #ff444430;'
    }">
          ${entry.occurrences > 1 ? '🔁 ' + entry.occurrences + 'x' : '🆕 New'}
        </span>
        ${entry.source === 'sdk' ? '<span style="display:inline-block;padding:2px 8px;border-radius:20px;font-size:11px;background:#4488ff15;color:#6699ff;border:1px solid #4488ff30;margin-left:4px;">⚡ SDK</span>' : ''}
        <span style="margin-left:4px;">${entry.errorType || 'Error'}</span>
        <a href="${appUrl}/entries/${entry.id}" style="color:#555;text-decoration:none;float:right;">View fix →</a>
      </div>
    </div>
    `).join('')

  const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,sans-serif;background:#0a0a0a;color:#ffffff;margin:0;padding:20px;">
<div style="max-width:600px;margin:0 auto;background:#111;border:1px solid #222;border-radius:16px;overflow:hidden;">

  <div style="background:#0a0a0a;padding:24px;border-bottom:1px solid #222;">
    <span style="float:right;font-size:12px;color:#666;background:#1a1a1a;padding:4px 10px;border-radius:20px;border:1px solid #333;">
      ${isMorning ? 'Morning Report' : 'Evening Report'} · ${new Date().toLocaleDateString()}
    </span>
    <span style="font-size:18px;font-weight:700;color:#00ff88;">${emoji} DebugDiary</span>
  </div>

  <div style="padding:24px;">
    ${isAllClear ? `
    <div style="text-align:center;padding:40px 20px;">
      <div style="font-size:48px;">✅</div>
      <div style="font-size:20px;font-weight:700;color:#00ff88;margin:12px 0 8px;">All clear ${timeLabel}!</div>
      <p style="color:#666;font-size:14px;">No errors captured ${isMorning ? 'while you were sleeping' : 'during the day'}. Keep shipping! 🚀</p>
    </div>
    ` : `
    <h2 style="margin:0 0 6px;font-size:18px;color:#fff">${isMorning ? 'Good morning 👋' : 'Evening recap 👀'}</h2>
    <p style="color:#666;font-size:14px;margin:0 0 20px">Here's what happened ${timeLabel} on your apps.</p>

    <div style="display:flex;gap:12px;margin:20px 0;">
      <div style="flex:1;background:#0f0f0f;border:1px solid #222;border-radius:10px;padding:14px;text-align:center;">
        <div style="font-size:24px;font-weight:700;color:#fff;">${totalErrors}</div>
        <div style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.5px;margin-top:4px;">Total</div>
      </div>
      <div style="flex:1;background:#0f0f0f;border:1px solid #222;border-radius:10px;padding:14px;text-align:center;">
        <div style="font-size:24px;font-weight:700;color:#ff6666;">${newErrors}</div>
        <div style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.5px;margin-top:4px;">New</div>
      </div>
      <div style="flex:1;background:#0f0f0f;border:1px solid #222;border-radius:10px;padding:14px;text-align:center;">
        <div style="font-size:24px;font-weight:700;color:#ff9933;">${recurringErrors}</div>
        <div style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.5px;margin-top:4px;">Recurring</div>
      </div>
    </div>

    <p style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#555;margin:24px 0 12px;">Errors ${timeLabel}</p>
    ${errorItemsHtml}
    `}

    <a href="${appUrl}/dashboard" style="display:block;background:#00ff88;color:#000;text-decoration:none;text-align:center;padding:14px 24px;border-radius:10px;font-weight:700;font-size:15px;margin:24px 0 8px;">Open DebugDiary Dashboard →</a>
  </div>

  <div style="padding:16px 24px;border-top:1px solid #1a1a1a;font-size:12px;color:#444;text-align:center;">
    ${isMorning ? 'Have a bug-free day! 🚀' : "Sleep tight — we're watching. 🌙"}<br/><br/>
    <a href="${appUrl}/settings" style="color:#444">Manage digest settings</a> · DebugDiary Error Journal
  </div>

</div>
</body>
</html>`

  await resend.emails.send({
    from: 'DebugDiary <onboarding@resend.dev>',
    to: user.email,
    subject,
    html: emailHtml
  })

  // Update last digest timestamp
  await prisma.user.update({
    where: { id: userId },
    data: type === 'morning'
      ? { lastMorningDigest: new Date() }
      : { lastEveningDigest: new Date() }
  })
}
