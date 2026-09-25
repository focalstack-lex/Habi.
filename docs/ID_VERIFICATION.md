# Seller ID Verification: eGov / PSA eVerify Integration

Habi requires a valid government ID before a seller storefront goes live. Verification has two layers:

1. **Automated PhilSys check** (this document). The National ID number, name, and birth date are matched against the PhilSys record through the government eVerify service.
2. **Admin review**. Every application, including ones that pass the automated check, is reviewed by a Habi admin in the Control Room against the uploaded ID photo. Non-PhilSys IDs (driver's license, passport, UMID, SSS, PRC, postal, TIN, voter's, business permits) have no public verification API and rely on this review alone.

## How to get API access

There is no self-serve public API key. Access is granted per organisation:

1. **eGov API Developer Portal**: register your organisation at https://platforms.e.gov.ph. The portal exposes nine APIs including **National ID eVerify**, eGov SSO, eMessage, eGovPay, and Face Liveness. Applications need administrator approval and are intended for government agencies and accredited organisations with a legitimate integration need.
2. **PSA relying-party onboarding**: the PSA runs regulatory onboarding (document review and legal compliance), then the DICT runs technical onboarding and issues the API key. Contact `fpsucd@psa.gov.ph` or start from https://everify.gov.ph. As of 2026 the authentication service is free for onboarded relying parties.
3. Expect a data-sharing agreement and a privacy-impact review. Store only what the agreement allows; Habi keeps the eVerify reference id and a pass or fail status, never the raw response.

## Architecture

```
Browser (Habi)  --POST-->  Your proxy (holds eVerify key)  --->  eGov eVerify API
                <--JSON--                                  <---
```

The browser never sees the eVerify key. `src/services/idVerificationService.ts` calls the URL in `VITE_ID_VERIFY_ENDPOINT`; your proxy authenticates with eVerify and answers with a small, stable contract, so the eVerify request format (which you receive during technical onboarding) never leaks into the frontend.

### Proxy contract

Request from Habi:

```http
POST {VITE_ID_VERIFY_ENDPOINT}
Content-Type: application/json

{
  "idTypeId": "philsys",
  "idNumber": "1234567890123456",
  "fullName": "Maria Santos",
  "birthDate": "1995-04-12"
}
```

Response expected by Habi:

```json
{ "verified": true, "reference": "EV-2026-000123", "message": "optional human readable note" }
```

* `verified: true` stores `automatedCheck.status = "verified"` on the application and the admin sees a green "eVerify: PhilSys record matched" line.
* `verified: false` blocks sign-up with the message returned (or a default) so the applicant can correct the number, name, or birth date, or choose another ID.
* Any non-2xx status, network failure, or 15 second timeout stores `status = "error"` and the application proceeds to manual review. An outage never locks sellers out.
* When `VITE_ID_VERIFY_ENDPOINT` is empty the check reports `not_configured` and manual review applies.

### Minimal proxy example (Node, any host)

```js
// server/verify-id.js  (Express, Vercel, Netlify, or Cloud Functions all work)
import express from 'express';

const app = express();
app.use(express.json());

app.post('/api/verify-id', async (req, res) => {
  const { idTypeId, idNumber, fullName, birthDate } = req.body ?? {};
  if (idTypeId !== 'philsys') return res.json({ verified: false, message: 'Only PhilSys IDs are checked.' });

  // Replace with the endpoint and payload shape from your DICT technical onboarding pack.
  const upstream = await fetch(process.env.EVERIFY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.EVERIFY_API_KEY}`,
    },
    body: JSON.stringify({ pcn: idNumber, name: fullName, birthDate }),
  });

  if (!upstream.ok) return res.status(502).json({ verified: false, message: 'eVerify unavailable' });
  const data = await upstream.json();
  res.json({ verified: data.status === 'MATCHED', reference: data.transactionId });
});

app.listen(3000);
```

Set `VITE_ID_VERIFY_ENDPOINT="https://your-host/api/verify-id"` in `.env`, rebuild, and the sign-up form starts running the check on step 3.

## Data handled by the frontend

| Field | Where it goes | Why |
| --- | --- | --- |
| ID type, number, name on ID, birth date | `habi_accounts` in localStorage, sent to the proxy for PhilSys IDs | Format validation, duplicate detection, eVerify match |
| ID photo, permit photo | `habi_accounts` in localStorage only | Admin visual review; never sent to the proxy |
| `automatedCheck` result | `habi_accounts` | Shown to admin and, as a status label, to the applicant |

Because the prototype stores everything in the browser, a production deployment should move accounts and images to a backend with encryption at rest before onboarding real sellers.

## Sources

* eGov API Developer Portal: https://platforms.e.gov.ph
* National ID eVerify: https://everify.gov.ph
* PSA, DICT roll out National ID eVerify: https://philsys.gov.ph/psa-dict-rolls-out-digital-national-id-authentication-services-national-id-everify-national-id-check/
* PSA onboarding for private institutions: https://philsys.gov.ph/psa-gathers-financial-private-institutions-for-exchange-of-insights-experiences-on-national-id-integration/
