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

export async function sendEarlyWelcomeEmail(email: string): Promise<void> {
  const resend = getResendClient();
  await resend.emails.send({
    from: 'hello@startinvesting.ai',
    to: email,
    subject: "You're in — finish your plan to see your numbers",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f0f0f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f0f0;">
  <tr><td align="center" style="padding:32px 16px;">
    <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;">
      <tr><td style="background-color:#111111;padding:18px 28px;">
        <span style="font-size:12px;font-weight:700;color:#00C896;letter-spacing:0.14em;text-transform:uppercase;">startinvesting.ai</span>
      </td></tr>
      <tr><td style="padding:32px 28px;">
        <p style="margin:0 0 16px 0;font-size:22px;font-weight:700;color:#111111;line-height:1.3;">You're in! 🎉</p>
        <p style="margin:0 0 14px 0;font-size:15px;color:#444444;line-height:1.6;">
          We've got your email. Now finish building your plan — it takes 2 more minutes and you'll see exactly how much your money could grow.
        </p>
        <p style="margin:0 0 24px 0;font-size:15px;color:#444444;line-height:1.6;">
          Once you complete the simulator, we'll send you your <strong style="color:#111;">personalized investing plan</strong> with your exact numbers and step-by-step next steps.
        </p>
        <table cellpadding="0" cellspacing="0">
          <tr><td style="background-color:#00C896;border-radius:8px;">
            <a href="https://startinvesting.ai" style="display:inline-block;padding:13px 24px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">Finish my plan &#8594;</a>
          </td></tr>
        </table>
      </td></tr>
      <tr><td style="padding:0 28px 24px 28px;">
        <p style="margin:0;font-size:11px;color:#cccccc;line-height:1.6;">
          You signed up at startinvesting.ai &middot; Educational purposes only &middot; Not financial advice.
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`.trim(),
  });
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
<body style="margin:0;padding:0;background-color:#f0f0f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111111;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f0f0;">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table width="540" cellpadding="0" cellspacing="0" style="max-width:540px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;">

        <!-- Header bar -->
        <tr>
          <td style="background-color:#111111;padding:20px 32px;">
            <span style="font-size:12px;font-weight:700;color:#00C896;letter-spacing:0.14em;text-transform:uppercase;">startinvesting.ai</span>
          </td>
        </tr>

        <!-- Hero number -->
        <tr>
          <td style="padding:36px 32px 28px 32px;border-bottom:1px solid #f3f3f3;">
            <p style="margin:0 0 4px 0;font-size:12px;font-weight:600;color:#00C896;letter-spacing:0.1em;text-transform:uppercase;">Your projection</p>
            <p style="margin:0 0 4px 0;font-size:42px;font-weight:700;color:#111111;letter-spacing:-2px;line-height:1;">${formattedProjectedValue}</p>
            <p style="margin:0;font-size:15px;color:#888888;">by age ${retirementAge} · investing ${contribFormatted}/${freqLabel} for ${years} years</p>
          </td>
        </tr>

        <!-- 3 steps -->
        <tr>
          <td style="padding:28px 32px 0 32px;">
            <p style="margin:0 0 20px 0;font-size:16px;font-weight:600;color:#111111;">Here's exactly what to do:</p>

            <!-- Step 1 -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr>
                <td style="vertical-align:top;width:32px;padding-top:1px;">
                  <span style="display:inline-block;width:24px;height:24px;background-color:#111111;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;color:#ffffff;">1</span>
                </td>
                <td style="padding-left:12px;vertical-align:top;">
                  <p style="margin:0 0 4px 0;font-size:15px;font-weight:600;color:#111111;">Open a brokerage account</p>
                  <p style="margin:0 0 10px 0;font-size:14px;color:#555555;line-height:1.5;">Takes 5 minutes. Free to open. You don't have to invest a single dollar until you're ready.</p>
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background-color:#00C896;border-radius:6px;">
                        <a href="https://join.robinhood.com/griffea5" style="display:inline-block;padding:10px 18px;font-size:13px;font-weight:600;color:#ffffff;text-decoration:none;">Open Robinhood — get a free stock &#8594;</a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin:6px 0 0 0;font-size:11px;color:#cccccc;font-style:italic;">Affiliate link — we may earn a commission at no cost to you.</p>
                </td>
              </tr>
            </table>

            <!-- Step 2 -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr>
                <td style="vertical-align:top;width:32px;padding-top:1px;">
                  <span style="display:inline-block;width:24px;height:24px;background-color:#111111;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;color:#ffffff;">2</span>
                </td>
                <td style="padding-left:12px;vertical-align:top;">
                  <p style="margin:0 0 4px 0;font-size:15px;font-weight:600;color:#111111;">Set up auto-invest</p>
                  <p style="margin:0;font-size:14px;color:#555555;line-height:1.5;">Link your bank and schedule ${contribFormatted}/${freqLabel} automatically. Start lower if needed — even $25/month beats nothing. The key is consistency.</p>
                </td>
              </tr>
            </table>

            <!-- Step 3 -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="vertical-align:top;width:32px;padding-top:1px;">
                  <span style="display:inline-block;width:24px;height:24px;background-color:#111111;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;color:#ffffff;">3</span>
                </td>
                <td style="padding-left:12px;vertical-align:top;">
                  <p style="margin:0 0 4px 0;font-size:15px;font-weight:600;color:#111111;">Buy an S&amp;P 500 index fund</p>
                  <p style="margin:0;font-size:14px;color:#555555;line-height:1.5;">Search for <strong style="color:#111;font-family:monospace;">VOO</strong>, <strong style="color:#111;font-family:monospace;">VTI</strong>, or <strong style="color:#111;font-family:monospace;">SPY</strong> in your brokerage and buy it. That's it.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- S&P 500 explainer -->
        <tr>
          <td style="padding:24px 32px 0 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f9f9;border-radius:10px;">
              <tr>
                <td style="padding:20px 20px;">
                  <p style="margin:0 0 12px 0;font-size:13px;font-weight:700;color:#111111;text-transform:uppercase;letter-spacing:0.05em;">What is the S&amp;P 500?</p>
                  <p style="margin:0 0 12px 0;font-size:14px;color:#444444;line-height:1.6;">It's a single fund that owns a tiny piece of the 500 biggest US companies — Apple, Amazon, Google, and 497 more. One purchase = instant diversification.</p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr><td style="padding:5px 0;font-size:13px;color:#444444;">&#128200;&nbsp; <strong style="color:#111;">~10% avg annual return</strong> since 1957</td></tr>
                    <tr><td style="padding:5px 0;font-size:13px;color:#444444;">&#128176;&nbsp; <strong style="color:#111;">Near-zero fees</strong> (VOO charges 0.03%/yr)</td></tr>
                    <tr><td style="padding:5px 0;font-size:13px;color:#444444;">&#127942;&nbsp; <strong style="color:#111;">Beats 90% of professional fund managers</strong> over 15 years</td></tr>
                    <tr><td style="padding:5px 0;font-size:13px;color:#444444;">&#129309;&nbsp; <strong style="color:#111;">Warren Buffett's recommendation</strong> for everyday investors</td></tr>
                  </table>
                  <p style="margin:12px 0 0 0;font-size:11px;color:#aaaaaa;font-style:italic;">Not financial advice — but widely considered the best starting point for new investors.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- What's next -->
        <tr>
          <td style="padding:24px 32px 0 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#111111;border-radius:10px;">
              <tr>
                <td style="padding:20px 22px;">
                  <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;color:#00C896;letter-spacing:0.1em;text-transform:uppercase;">What's next</p>
                  <p style="margin:0;font-size:14px;color:#dddddd;line-height:1.6;">Every week we'll send a short email — market updates, simple concepts, and tips to help your money grow. No fluff, no spam.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px 28px 32px;">
            <p style="margin:0;font-size:11px;color:#cccccc;line-height:1.6;">
              You signed up at startinvesting.ai &middot; Educational purposes only &middot; Not financial advice &middot; Past performance does not guarantee future results.
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
