# PropFlow Tax Category Rules
# Load when working on Finances page, Schedule E, receipt engine, or tax features.

## Schedule E Income (all Taxable — blue badge)
Rent collected → Line 3 | Security deposit kept (damages) → Line 3
Late fee income → Line 3 | Other rental income → Line 3

## Schedule E Expenses (all Deductible — green badge)
Advertising / listing fees → Line 5
Auto & travel (property-related) → Line 6
Commissions → Line 7
Insurance (property + liability) → Line 9
Legal & professional fees → Line 10
Management fees → Line 11 (e.g. Joseph Neff payments)
Mortgage interest → Line 12 (interest only, NOT principal)
Other interest (HELOC, loans) → Line 13
Repairs & maintenance → Line 14
Supplies → Line 15
Property taxes → Line 16
Utilities (landlord-paid) → Line 17
Depreciation → Line 18 (special — needs CPA, 27.5-year straight line)
HOA fees → Line 19 | Pest control → Line 19 | Security → Line 19
Snow/landscaping → Line 19 | Software subscriptions → Line 19

## Non-Deductible (gray badge with X)
Mortgage principal (reduces cost basis, not deductible)
Personal expenses (anything not directly tied to the rental property)

## Needs CPA Review (amber badge with !)
Capital improvements over $2,500 (must capitalize + depreciate, not expense)
Depreciation (requires cost basis and land value to calculate correctly)

## Special Warning Rules
If expense > $2,500 and category is Repairs: show CPA warning before save.
If contractor paid > $600 cumulative in calendar year: show 1099-NEC warning.
Mortgage principal entries never get a deductible badge regardless of user input.

## Tax Badge Behavior in UI
Green (Deductible): dollar-sign icon, shows "Sch. E Line [N]" on hover
Blue (Income): up-arrow icon, shows "Taxable income"
Gray (Non-deductible): X icon, shows "Not deductible"
Amber (Review): exclamation icon, shows "Review with CPA"
Red outline (Uncategorized): question icon, pulsing — costs landlord money
