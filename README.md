# 2027 Federal Employee's Leave Record (fedretire.net)
This is an interactive web version of the FederalRetirement.net/fedretire.net leave chart. It uses the same calculations as the 2026 Excel sheet.
- `npm i && npm run dev` to develop. `npm run build` outputs to `dist/`, and Vercel auto-detects the Vite setup.
- Entries are saved in the browser's localStorage (key `fedretire-leave-2027`).
- 2027 pay periods and holidays are embedded in index.html. They come from public/calendar2027.json (NFC 1217n_27 and the GSA 2027 payroll calendar).
