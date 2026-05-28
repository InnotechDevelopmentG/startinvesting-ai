import { Resend } from 'resend';

function getResendClient(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('Missing RESEND_API_KEY environment variable.');
  return new Resend(key);
}

interface WelcomeEmailParams {
  email: string;
  age: number;
  startingAmount: number;
  contributionAmount: number;
  frequency: string;
  years: number;
  riskProfile: string;
  projectedValue: number;
  retirementAge: number;
  formattedProjectedValue: string;
}

function formatDollar(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n.toLocaleString()}`;
}

function frequencyLabel(freq: string): string {
  const map: Record<string, string> = {
    weekly: 'week',
    biweekly: 'two weeks',
    monthly: 'month',
    quarterly: 'quarter',
    annually: 'year',
  };
  return map[freq] ?? freq;
}

function riskLabel(profile: string): string {
  const map: Record<string, string> = {
    conservative: 'Conservative (~6%/yr)',
    moderate: 'Moderate (~8%/yr)',
    aggressive: 'Aggressive (~10%/yr)',
  };
  return map[profile] ?? profile;
}

export async function sendWelcomeEmail({
  email,
  age,
  startingAmount,
  contributionAmount,
  frequency,
  years,
  riskProfile,
  projectedValue,
  retirementAge,
  formattedProjectedValue,
}: WelcomeEmailParams): Promise<void> {
  const resend = getResendClient();

  const freqLabel = frequencyLabel(frequency);
  const contribFormatted = formatDollar(contributionAmount);
  const startFormatted = startingAmount > 0 ? formatDollar(startingAmount) : null;
  const riskFormatted = riskLabel(riskProfile);

  void projectedValue;

  await resend.emails.send({
    from: 'hello@startinvesting.ai',
    to: email,
    subject: `Your investing plan — ${formattedProjectedValue} by age ${retirementAge}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your investing plan</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111111;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;">
  <tr>
    <td align="center" style="padding:40px 16px;">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background-color:#111111;padding:28px 36px;">
            <span style="font-size:13px;font-weight:600;color:#00C896;letter-spacing:0.12em;text-transform:uppercase;">startinvesting.ai</span>
          </td>
        </tr>

        <!-- Hero -->
        <tr>
          <td style="padding:36px 36px 0 36px;">
            <p style="margin:0 0 6px 0;font-size:12px;font-weight:600;color:#00C896;letter-spacing:0.12em;text-transform:uppercase;">Your projection is ready</p>
            <h1 style="margin:0 0 8px 0;font-size:36px;font-weight:600;color:#111111;letter-spacing:-1.5px;line-height:1.1;">${formattedProjectedValue}</h1>
            <p style="margin:0;font-size:16px;color:#888888;">by age ${retirementAge} — based on your exact numbers.</p>
          </td>
        </tr>

        <!-- Projection recap -->
        <tr>
          <td style="padding:24px 36px 0 36px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f9f9;border-radius:10px;overflow:hidden;">
              <tr>
                <td style="padding:20px 24px 4px 24px;">
                  <p style="margin:0;font-size:11px;font-weight:600;color:#aaaaaa;letter-spacing:0.1em;text-transform:uppercase;">Your plan summary</p>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    ${startFormatted ? `
                    <tr>
                      <td style="padding:6px 0;font-size:14px;color:#888888;width:50%;">Starting amount</td>
                      <td style="padding:6px 0;font-size:14px;color:#111111;font-weight:500;text-align:right;">${startFormatted}</td>
                    </tr>` : ''}
                    <tr>
                      <td style="padding:6px 0;font-size:14px;color:#888888;width:50%;">Contribution</td>
                      <td style="padding:6px 0;font-size:14px;color:#111111;font-weight:500;text-align:right;">${contribFormatted} / ${freqLabel}</td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;font-size:14px;color:#888888;">Time horizon</td>
                      <td style="padding:6px 0;font-size:14px;color:#111111;font-weight:500;text-align:right;">${years} years${age > 0 ? ` (age ${age} → ${retirementAge})` : ''}</td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;font-size:14px;color:#888888;">Risk profile</td>
                      <td style="padding:6px 0;font-size:14px;color:#111111;font-weight:500;text-align:right;">${riskFormatted}</td>
                    </tr>
                    <tr>
                      <td colspan="2" style="padding:12px 0 6px 0;border-top:1px solid #eeeeee;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="font-size:14px;color:#888888;">Projected value</td>
                            <td style="font-size:18px;font-weight:600;color:#00C896;text-align:right;">${formattedProjectedValue}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Step 1: Open a brokerage -->
        <tr>
          <td style="padding:32px 36px 0 36px;">
            <p style="margin:0 0 4px 0;font-size:11px;font-weight:600;color:#00C896;letter-spacing:0.1em;text-transform:uppercase;">Step 1</p>
            <h2 style="margin:0 0 12px 0;font-size:20px;font-weight:600;color:#111111;">Open a brokerage account</h2>
            <p style="margin:0 0 16px 0;font-size:15px;color:#444444;line-height:1.6;">
              The first move is simply opening an account. It takes about 5 minutes, costs nothing, and you don't need to invest a dollar until you're ready. We recommend Robinhood for beginners — it's clean, commission-free, and you'll get a free stock just for signing up.
            </p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background-color:#00C896;border-radius:8px;">
                  <a href="https://join.robinhood.com/griffea5" style="display:inline-block;padding:13px 24px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">Open Robinhood — get a free stock →</a>
                </td>
              </tr>
            </table>
            <p style="margin:10px 0 0 0;font-size:11px;color:#bbbbbb;">Fidelity and Vanguard are also excellent options. Any of the three will serve you well.</p>
            <p style="margin:8px 0 0 0;font-size:11px;color:#cccccc;font-style:italic;">Affiliate link — we may earn a commission if you open an account, at no extra cost to you.</p>
          </td>
        </tr>

        <!-- Step 2: Start investing -->
        <tr>
          <td style="padding:28px 36px 0 36px;">
            <p style="margin:0 0 4px 0;font-size:11px;font-weight:600;color:#00C896;letter-spacing:0.1em;text-transform:uppercase;">Step 2</p>
            <h2 style="margin:0 0 12px 0;font-size:20px;font-weight:600;color:#111111;">Start with what feels comfortable</h2>
            <p style="margin:0 0 12px 0;font-size:15px;color:#444444;line-height:1.6;">
              You entered <strong style="color:#111111;">${contribFormatted} per ${freqLabel}</strong> — that's a solid target. But the most important thing is simply starting. If that number feels like a stretch right now, start smaller. Even $25 or $50 per month, invested consistently and automatically, puts you ahead of the majority of people.
            </p>
            <p style="margin:0;font-size:15px;color:#444444;line-height:1.6;">
              Once your account is open, set up <strong style="color:#111111;">automatic recurring deposits</strong> from your bank. Automation removes the temptation to skip a month and is the single most effective habit in personal investing.
            </p>
          </td>
        </tr>

        <!-- Step 3: S&P 500 -->
        <tr>
          <td style="padding:28px 36px 0 36px;">
            <p style="margin:0 0 4px 0;font-size:11px;font-weight:600;color:#00C896;letter-spacing:0.1em;text-transform:uppercase;">Step 3</p>
            <h2 style="margin:0 0 12px 0;font-size:20px;font-weight:600;color:#111111;">Buy an S&amp;P 500 index fund</h2>
            <p style="margin:0 0 16px 0;font-size:15px;color:#444444;line-height:1.6;">
              <em>This is not financial advice</em> — but when it comes to where beginners should start, the S&amp;P 500 is the most widely recommended entry point in the world of investing, and for good reason.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf8;border-left:3px solid #00C896;border-radius:0 8px 8px 0;margin-bottom:16px;">
              <tr>
                <td style="padding:20px 20px;">
                  <p style="margin:0 0 10px 0;font-size:14px;font-weight:600;color:#111111;">What is the S&amp;P 500?</p>
                  <p style="margin:0;font-size:14px;color:#444444;line-height:1.6;">
                    The S&amp;P 500 is an index of the 500 largest publicly traded US companies — Apple, Microsoft, Amazon, Google, and 496 others. When you invest in an S&amp;P 500 index fund, you own a tiny piece of all of them at once.
                  </p>
                </td>
              </tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:10px 0;vertical-align:top;width:28px;">
                  <span style="display:inline-block;width:20px;height:20px;background-color:#00C896;border-radius:50%;text-align:center;line-height:20px;font-size:11px;font-weight:700;color:#ffffff;">✓</span>
                </td>
                <td style="padding:10px 0 10px 8px;font-size:14px;color:#333333;line-height:1.5;">
                  <strong style="color:#111111;">~10% average annual return since 1957.</strong> No single stock has matched the index's long-term consistency. Past performance doesn't guarantee future results, but this track record is unmatched.
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;vertical-align:top;width:28px;">
                  <span style="display:inline-block;width:20px;height:20px;background-color:#00C896;border-radius:50%;text-align:center;line-height:20px;font-size:11px;font-weight:700;color:#ffffff;">✓</span>
                </td>
                <td style="padding:10px 0 10px 8px;font-size:14px;color:#333333;line-height:1.5;">
                  <strong style="color:#111111;">Instant diversification.</strong> Instead of betting on one company, you own 500. If one fails, the other 499 carry you.
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;vertical-align:top;width:28px;">
                  <span style="display:inline-block;width:20px;height:20px;background-color:#00C896;border-radius:50%;text-align:center;line-height:20px;font-size:11px;font-weight:700;color:#ffffff;">✓</span>
                </td>
                <td style="padding:10px 0 10px 8px;font-size:14px;color:#333333;line-height:1.5;">
                  <strong style="color:#111111;">Extremely low fees.</strong> Index funds like VOO, VTI, and FZROX charge as little as 0.00%–0.03% per year — versus 1–2% for actively managed funds that rarely beat the index anyway.
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;vertical-align:top;width:28px;">
                  <span style="display:inline-block;width:20px;height:20px;background-color:#00C896;border-radius:50%;text-align:center;line-height:20px;font-size:11px;font-weight:700;color:#ffffff;">✓</span>
                </td>
                <td style="padding:10px 0 10px 8px;font-size:14px;color:#333333;line-height:1.5;">
                  <strong style="color:#111111;">Warren Buffett recommends it.</strong> In his 2013 letter to Berkshire Hathaway shareholders, he wrote that his instructions for his estate are to put 90% into "a very low-cost S&amp;P 500 index fund." If it's good enough for Buffett's family, it's a reasonable starting point for anyone.
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;vertical-align:top;width:28px;">
                  <span style="display:inline-block;width:20px;height:20px;background-color:#00C896;border-radius:50%;text-align:center;line-height:20px;font-size:11px;font-weight:700;color:#ffffff;">✓</span>
                </td>
                <td style="padding:10px 0 10px 8px;font-size:14px;color:#333333;line-height:1.5;">
                  <strong style="color:#111111;">Beats ~90% of professional fund managers.</strong> Over any 15-year period, the S&amp;P 500 has outperformed the vast majority of actively managed funds. Less stress, better results.
                </td>
              </tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f9f9;border-radius:8px;margin-top:16px;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0 0 10px 0;font-size:13px;font-weight:600;color:#111111;">Funds to look for in your brokerage:</p>
                  <table cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="padding:4px 0;font-size:13px;color:#555555;"><strong style="color:#111111;font-family:monospace;">VOO</strong> &nbsp;—&nbsp; Vanguard S&amp;P 500 ETF (0.03% fee)</td>
                    </tr>
                    <tr>
                      <td style="padding:4px 0;font-size:13px;color:#555555;"><strong style="color:#111111;font-family:monospace;">VTI</strong> &nbsp;—&nbsp; Vanguard Total Market ETF (0.03% fee)</td>
                    </tr>
                    <tr>
                      <td style="padding:4px 0;font-size:13px;color:#555555;"><strong style="color:#111111;font-family:monospace;">FZROX</strong> &nbsp;—&nbsp; Fidelity Zero Total Market (0.00% fee)</td>
                    </tr>
                    <tr>
                      <td style="padding:4px 0;font-size:13px;color:#555555;"><strong style="color:#111111;font-family:monospace;">SPY</strong> &nbsp;—&nbsp; SPDR S&amp;P 500 ETF (0.09% fee)</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CTA button -->
        <tr>
          <td style="padding:32px 36px 0 36px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background-color:#111111;border-radius:8px;">
                  <a href="https://startinvesting.ai" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">Run my projection again →</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Closing / weekly emails -->
        <tr>
          <td style="padding:32px 36px 0 36px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#111111;border-radius:10px;">
              <tr>
                <td style="padding:24px 24px;">
                  <p style="margin:0 0 6px 0;font-size:12px;font-weight:600;color:#00C896;letter-spacing:0.1em;text-transform:uppercase;">What's next</p>
                  <p style="margin:0;font-size:15px;color:#dddddd;line-height:1.7;">
                    Every week you'll get a short email from us with market data summaries, simple investing concepts, and updates relevant to your plan. No noise — just the things that actually matter for building long-term wealth.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:28px 36px 36px 36px;border-top:1px solid #eeeeee;margin-top:32px;">
            <p style="margin:0 0 6px 0;font-size:12px;color:#aaaaaa;line-height:1.6;">
              You're receiving this because you signed up at startinvesting.ai. No spam, ever.
            </p>
            <p style="margin:0;font-size:11px;color:#cccccc;line-height:1.6;">
              This email is for educational purposes only and does not constitute financial advice. Returns referenced are based on historical S&amp;P 500 data. Past performance does not guarantee future results. Always consider your personal financial situation before investing.
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>
    `.trim(),
  });
}
