# 2027 Federal Employee's Leave Record (fedretire.net)
This is an interactive web version of the FederalRetirement.net/fedretire.net leave chart. It uses the same calculations as the 2026 Excel sheet.
- `npm i && npm run dev` to develop. `npm run build` outputs to `dist/`, and Vercel auto-detects the Vite setup.
- Entries are saved in the browser's localStorage (key `fedretire-leave-2027`).
- 2027 pay periods and holidays are embedded in index.html. They come from public/calendar2027.json (NFC 1217n_27 and the GSA 2027 payroll calendar).
- The chart starts at pay period 1, Jan 10–23, 2027, and runs 26 periods through Dec 26, 2027–Jan 8, 2028. January 1, 2027 is in the prior leave year and is not shown. New Year's Day 2028 (observed Dec 31, 2027) is marked in pay period 26.
- Annual leave earned can be filled at 4, 6, or 8 hours. Empty cells and cells still on the previous rate update; a number you changed is kept, and every cell stays editable. Sick leave earned starts at 4 hours per pay period and stays editable.
- Each day is A, S, C1 (credit), or C2 (comp) plus hours. Fractional hours are allowed. Those hours are not added into the Used columns. Running balances still use only the 2026 starting balance and the Earned and Used numbers you enter.
- 2026 Leave Balance fields sit at the top of each leave category. The paycheck-date column is not shown. Pay periods are one group with # and Dates (pay period 1 is Jan 10-23).
