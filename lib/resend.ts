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

interface FIREReportEmailParams {
  email: string;
  fireNumber: number;
  yearsToFIRE: number | null;
  fireAge: number | null;
  monthlyContribution: number;
  annualSpending: number;
  currentAge: number;
  currentSavings: number;
  withdrawalRate: number;
  realAnnualReturnPct: number;
  progressPercent: number;
  coastFireNumber: number;
}

interface MortgageReportEmailParams {
  email: string;
  homePrice: number;
  downPayment: number;
  annualRate: number;
  termYears: number;
  totalMonthly: number;
  monthlyPI: number;
  monthlyTax: number;
  monthlyInsurance: number;
  monthlyPMI: number;
  totalInterest: number;
  totalCost: number;
  principal: number;
  requiresPMI: boolean;
}

function fmtFire(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`;
  return `$${n.toLocaleString()}`;
}

function fmtMortgage(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

function yearsLabel(yrs: number | null): string {
  if (yrs === null) return '—';
  if (yrs <= 0) return 'Now!';
  const y = Math.floor(yrs);
  const m = Math.round((yrs - y) * 12);
  if (y === 0) return `${m} months`;
  if (m === 0) return `${y} year${y !== 1 ? 's' : ''}`;
  return `${y} yr ${m} mo`;
}

export async function sendFIREReportEmail({
  email,
  fireNumber,
  yearsToFIRE,
  fireAge,
  monthlyContribution,
  annualSpending,
  currentAge,
  currentSavings,
  withdrawalRate,
  realAnnualReturnPct,
  progressPercent,
  coastFireNumber,
}: FIREReportEmailParams): Promise<void> {
  const resend = getResendClient();

  const fireFormatted = fireNumber > 0 ? fmtFire(fireNumber) : '—';
  const fireAgeStr = fireAge !== null ? `Age ${Math.ceil(fireAge)}` : '—';
  const yearsStr = yearsLabel(yearsToFIRE);
  const progressCapped = Math.min(Math.round(progressPercent), 100);
  const needMore = fireNumber > 0 && currentSavings < fireNumber ? fireNumber - currentSavings : 0;

  const subject = fireAge !== null && yearsToFIRE !== null
    ? `Your FIRE report — ${fireFormatted}, retire in ${yearsStr}`
    : `Your FIRE report — ${fireFormatted} target`;

  await resend.emails.send({
    from: 'hello@startinvesting.ai',
    to: email,
    subject,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f0f0f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f0f0;">
  <tr><td align="center" style="padding:32px 16px;">
    <table width="540" cellpadding="0" cellspacing="0" style="max-width:540px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;">

      <!-- Header -->
      <tr><td style="background-color:#111111;padding:20px 32px;">
        <span style="font-size:12px;font-weight:700;color:#00C896;letter-spacing:0.14em;text-transform:uppercase;">startinvesting.ai</span>
      </td></tr>

      <!-- Hero -->
      <tr><td style="padding:36px 32px 28px 32px;border-bottom:1px solid #f3f3f3;">
        <p style="margin:0 0 4px 0;font-size:12px;font-weight:600;color:#00C896;letter-spacing:0.1em;text-transform:uppercase;">Your FIRE Number</p>
        <p style="margin:0 0 6px 0;font-size:48px;font-weight:700;color:#111111;letter-spacing:-2px;line-height:1;">${fireFormatted}</p>
        <p style="margin:0;font-size:15px;color:#888888;">the exact amount you need to never work again</p>
      </td></tr>

      <!-- Key stats -->
      <tr><td style="padding:28px 32px;border-bottom:1px solid #f3f3f3;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="50%" style="padding-right:8px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#111111;border-radius:10px;">
                <tr><td style="padding:16px 18px;">
                  <p style="margin:0 0 4px 0;font-size:10px;font-weight:600;color:#888888;text-transform:uppercase;letter-spacing:0.08em;">Time to FIRE</p>
                  <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.2;">${yearsStr}</p>
                </td></tr>
              </table>
            </td>
            <td width="50%" style="padding-left:8px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#111111;border-radius:10px;">
                <tr><td style="padding:16px 18px;">
                  <p style="margin:0 0 4px 0;font-size:10px;font-weight:600;color:#888888;text-transform:uppercase;letter-spacing:0.08em;">FIRE Age</p>
                  <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.2;">${fireAgeStr}</p>
                </td></tr>
              </table>
            </td>
          </tr>
        </table>
      </td></tr>

      <!-- Progress -->
      <tr><td style="padding:24px 32px;border-bottom:1px solid #f3f3f3;">
        <p style="margin:0 0 10px 0;font-size:13px;font-weight:600;color:#111111;">Progress toward FIRE: ${progressCapped}%</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;border-radius:99px;overflow:hidden;">
          <tr>
            <td width="${progressCapped}%" style="background-color:#00C896;height:10px;border-radius:99px;"></td>
            ${progressCapped < 100 ? `<td width="${100 - progressCapped}%" style="height:10px;"></td>` : ''}
          </tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px;">
          <tr>
            <td style="font-size:11px;color:#aaaaaa;">${fmtFire(currentSavings)} saved</td>
            ${needMore > 0 ? `<td align="center" style="font-size:11px;color:#aaaaaa;">${fmtFire(needMore)} to go</td>` : ''}
            <td align="right" style="font-size:11px;color:#aaaaaa;">${fireFormatted} target</td>
          </tr>
        </table>
      </td></tr>

      <!-- Your plan -->
      <tr><td style="padding:24px 32px;border-bottom:1px solid #f3f3f3;">
        <p style="margin:0 0 14px 0;font-size:13px;font-weight:700;color:#111111;text-transform:uppercase;letter-spacing:0.05em;">Your plan</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${[
            ['Current Age', `${currentAge} years old`],
            ['Monthly Contribution', `${fmtFire(monthlyContribution)}/mo`],
            ['Annual Spending Target', `${fmtFire(annualSpending)}/yr (${fmtFire(annualSpending / 12)}/mo)`],
            ['Withdrawal Rate', `${withdrawalRate}% (${(100 / withdrawalRate).toFixed(1)}× multiplier)`],
            ['Real Return (inflation-adj)', `${realAnnualReturnPct.toFixed(2)}%/yr`],
            ['Coast FIRE Number', fmtFire(coastFireNumber)],
          ].map(([label, value]) => `
          <tr style="border-bottom:1px solid #f3f4f6;">
            <td style="padding:8px 0;font-size:13px;color:#666666;">${label}</td>
            <td style="padding:8px 0;font-size:13px;color:#111111;text-align:right;">${value}</td>
          </tr>`).join('')}
        </table>
      </td></tr>

      <!-- Next step -->
      <tr><td style="padding:24px 32px;border-bottom:1px solid #f3f3f3;">
        <p style="margin:0 0 12px 0;font-size:15px;font-weight:600;color:#111111;">Start building toward this today:</p>
        <table cellpadding="0" cellspacing="0">
          <tr><td style="background-color:#00C896;border-radius:8px;">
            <a href="https://join.robinhood.com/griffea5" style="display:inline-block;padding:12px 22px;font-size:13px;font-weight:600;color:#ffffff;text-decoration:none;">Open Robinhood — get a free stock &#8594;</a>
          </td></tr>
        </table>
        <p style="margin:6px 0 0 0;font-size:11px;color:#cccccc;font-style:italic;">Affiliate link — we may earn a commission at no cost to you.</p>
      </td></tr>

      <!-- Footer -->
      <tr><td style="padding:20px 32px 28px 32px;">
        <p style="margin:0;font-size:11px;color:#cccccc;line-height:1.6;">
          You requested this from startinvesting.ai/fire &middot; Educational purposes only &middot; Not financial advice &middot; All projections in today&apos;s dollars.
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`.trim(),
  });
}

export async function sendMortgageReportEmail({
  email,
  homePrice,
  downPayment,
  annualRate,
  termYears,
  totalMonthly,
  monthlyPI,
  monthlyTax,
  monthlyInsurance,
  monthlyPMI,
  totalInterest,
  totalCost,
  principal,
  requiresPMI,
}: MortgageReportEmailParams): Promise<void> {
  const resend = getResendClient();

  const interestRatio = homePrice > 0 ? ((totalInterest / homePrice) * 100).toFixed(0) : '0';

  const subject = `Your mortgage report — ${fmtMortgage(totalMonthly)}/mo, ${fmtMortgage(totalInterest)} total interest`;

  const breakdownRows = [
    { label: 'Principal &amp; Interest', value: fmtMortgage(monthlyPI), color: '#00C896' },
    { label: 'Property Tax', value: fmtMortgage(monthlyTax), color: '#6366f1' },
    { label: 'Insurance', value: fmtMortgage(monthlyInsurance), color: '#f59e0b' },
    ...(requiresPMI && monthlyPMI > 0 ? [{ label: 'PMI', value: fmtMortgage(monthlyPMI), color: '#ef4444' }] : []),
  ];

  await resend.emails.send({
    from: 'hello@startinvesting.ai',
    to: email,
    subject,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f0f0f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f0f0;">
  <tr><td align="center" style="padding:32px 16px;">
    <table width="540" cellpadding="0" cellspacing="0" style="max-width:540px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;">

      <!-- Header -->
      <tr><td style="background-color:#111111;padding:20px 32px;">
        <span style="font-size:12px;font-weight:700;color:#00C896;letter-spacing:0.14em;text-transform:uppercase;">startinvesting.ai</span>
      </td></tr>

      <!-- Hero -->
      <tr><td style="padding:36px 32px 28px 32px;border-bottom:1px solid #f3f3f3;">
        <p style="margin:0 0 4px 0;font-size:12px;font-weight:600;color:#00C896;letter-spacing:0.1em;text-transform:uppercase;">Total Monthly Payment</p>
        <p style="margin:0 0 4px 0;font-size:48px;font-weight:700;color:#111111;letter-spacing:-2px;line-height:1;">${fmtMortgage(totalMonthly)}</p>
        <p style="margin:0;font-size:14px;color:#888888;">${termYears}-year fixed &middot; ${annualRate.toFixed(3)}% APR</p>
      </td></tr>

      <!-- Payment breakdown -->
      <tr><td style="padding:24px 32px;border-bottom:1px solid #f3f3f3;">
        <p style="margin:0 0 14px 0;font-size:13px;font-weight:700;color:#111111;text-transform:uppercase;letter-spacing:0.05em;">Monthly Breakdown</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${breakdownRows.map(row => `
          <tr>
            <td style="padding:7px 0;font-size:13px;color:#555555;">
              <span style="display:inline-block;width:10px;height:10px;background-color:${row.color};border-radius:50%;margin-right:8px;vertical-align:middle;"></span>
              ${row.label}
            </td>
            <td style="padding:7px 0;font-size:14px;font-weight:600;color:#111111;text-align:right;">${row.value}/mo</td>
          </tr>`).join('')}
        </table>
      </td></tr>

      <!-- Loan summary -->
      <tr><td style="padding:24px 32px;border-bottom:1px solid #f3f3f3;">
        <p style="margin:0 0 14px 0;font-size:13px;font-weight:700;color:#111111;text-transform:uppercase;letter-spacing:0.05em;">Loan Summary</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${[
            { label: 'Home Price', value: fmtMortgage(homePrice), color: '#111111' },
            { label: `Down Payment (${homePrice > 0 ? ((downPayment / homePrice) * 100).toFixed(1) : 0}%)`, value: fmtMortgage(downPayment), color: '#111111' },
            { label: 'Loan Amount', value: fmtMortgage(principal), color: '#111111' },
            { label: 'Total Interest Paid', value: fmtMortgage(totalInterest), color: '#ef4444' },
            { label: 'Total Cost of Home', value: fmtMortgage(totalCost), color: '#111111', bold: true },
          ].map(row => `
          <tr style="border-bottom:1px solid #f3f4f6;">
            <td style="padding:8px 0;font-size:13px;color:#666666;">${row.label}</td>
            <td style="padding:8px 0;font-size:${row.bold ? '14' : '13'}px;font-weight:${row.bold ? '700' : '400'};color:${row.color};text-align:right;">${row.value}</td>
          </tr>`).join('')}
        </table>
      </td></tr>

      <!-- Eye-opener -->
      <tr><td style="padding:24px 32px;border-bottom:1px solid #f3f3f3;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fff5f5;border-radius:10px;border:1px solid #fee2e2;">
          <tr><td style="padding:18px 20px;">
            <p style="margin:0 0 6px 0;font-size:13px;font-weight:700;color:#111111;">By the time you&apos;re done paying</p>
            <p style="margin:0;font-size:14px;color:#444444;line-height:1.6;">
              Your ${fmtMortgage(homePrice)} home will have cost you <strong style="color:#ef4444;">${fmtMortgage(totalCost)}</strong> total
              — that&apos;s <strong>${interestRatio}% more</strong> than the purchase price, just in interest.
            </p>
          </td></tr>
        </table>
      </td></tr>

      <!-- Next step -->
      <tr><td style="padding:24px 32px;border-bottom:1px solid #f3f3f3;">
        <p style="margin:0 0 8px 0;font-size:15px;font-weight:600;color:#111111;">Run the full numbers again:</p>
        <table cellpadding="0" cellspacing="0">
          <tr><td style="background-color:#00C896;border-radius:8px;">
            <a href="https://startinvesting.ai/mortgage" style="display:inline-block;padding:12px 22px;font-size:13px;font-weight:600;color:#ffffff;text-decoration:none;">Open Mortgage Calculator &#8594;</a>
          </td></tr>
        </table>
      </td></tr>

      <!-- Footer -->
      <tr><td style="padding:20px 32px 28px 32px;">
        <p style="margin:0;font-size:11px;color:#cccccc;line-height:1.6;">
          You requested this from startinvesting.ai/mortgage &middot; Estimates only &middot; Not financial advice &middot; Consult a licensed mortgage professional.
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`.trim(),
  });
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
