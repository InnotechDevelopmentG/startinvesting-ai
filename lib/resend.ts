import { Resend } from 'resend';

function getResendClient(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('Missing RESEND_API_KEY environment variable.');
  return new Resend(key);
}

interface WelcomeEmailParams {
  email: string;
  projectedValue: number;
  retirementAge: number;
  formattedProjectedValue: string;
}

export async function sendWelcomeEmail({
  email,
  projectedValue,
  retirementAge,
  formattedProjectedValue,
}: WelcomeEmailParams): Promise<void> {
  const resend = getResendClient();
  await resend.emails.send({
    from: 'hello@startinvesting.ai',
    to: email,
    subject: 'Your investing plan is ready — here\'s week one.',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your investing plan is ready</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111111;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:48px 24px;">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <tr>
            <td style="padding-bottom:32px;">
              <span style="font-size:13px;font-weight:500;color:#00C896;letter-spacing:0.08em;text-transform:uppercase;">startinvesting.ai</span>
            </td>
          </tr>

          <tr>
            <td style="padding-bottom:24px;">
              <p style="margin:0;font-size:18px;font-weight:400;line-height:1.6;color:#111111;">
                Based on your numbers, you could build <strong style="font-weight:500;">${formattedProjectedValue}</strong> by age ${retirementAge}. That's your projection — here's exactly what to do this week to make it real.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:24px;background-color:#f9f9f9;border-radius:8px;margin-bottom:32px;">
              <p style="margin:0 0 16px 0;font-size:15px;font-weight:500;color:#111111;">Week one action plan:</p>
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding:8px 0;vertical-align:top;">
                    <span style="color:#00C896;font-weight:500;margin-right:12px;">1.</span>
                    <span style="font-size:15px;color:#333333;line-height:1.5;">Open a brokerage account — Robinhood, Fidelity, or Vanguard all work. Takes 5 minutes.</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;vertical-align:top;">
                    <span style="color:#00C896;font-weight:500;margin-right:12px;">2.</span>
                    <span style="font-size:15px;color:#333333;line-height:1.5;">Set up auto-invest — link your bank and schedule your first automatic deposit matching the contribution you entered.</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;vertical-align:top;">
                    <span style="color:#00C896;font-weight:500;margin-right:12px;">3.</span>
                    <span style="font-size:15px;color:#333333;line-height:1.5;">Pick a total market index fund — VTI, FZROX, or SWTSX. Low fees, instant diversification, and exactly what most of the world's best investors recommend.</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 0 24px 0;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#00C896;border-radius:6px;">
                    <a href="https://startinvesting.ai" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:500;color:#ffffff;text-decoration:none;">View my projection →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding-top:32px;border-top:1px solid #eeeeee;">
              <p style="margin:0;font-size:13px;color:#999999;line-height:1.6;">
                You're getting this because you signed up at startinvesting.ai. No spam ever.<br>
                Returns based on historical S&amp;P 500 data. Past performance does not guarantee future results. This is for educational purposes only and does not constitute financial advice.
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

  void projectedValue;
}
