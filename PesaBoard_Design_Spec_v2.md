**PESABOARD**

Mobile App Design Specification

***Version 2.0 --- Aligned to Revised Business Model***

Nairobi, Kenya \| May 2026

  -----------------------------------------------------------------------
  **What Changed in V2**

  **Navigation reduced from 5 tabs to 3 tabs (Phase 1 only).**

  **Expenses tab removed from Phase 1 --- deferred to Phase 2 Business
  tier.**

  **Net Profit removed from home summary grid --- no reliable expense
  data in Phase 1.**

  **Hero card: solid deep green only. No gradient illustration. No
  decorative background chart.**

  **Expense summary card corrected to orange theme, not green.**

  **Subscription price corrected to KES 299/mo (Starter).**

  **Onboarding screens fully specified --- including the SMS permission
  screen.**

  **Sync status indicator added as persistent dashboard element.**

  **Free trial counter UI specified.**

  **Business Income Report screen added as Phase 2 stub.**

  **Transaction Detail screen fully specified.**

  **Dark mode policy documented: not supported in Phase 1.**
  -----------------------------------------------------------------------

**PART 1 --- PURPOSE & PRODUCT CONTEXT**

**1.1 Purpose of This Document**

This document defines the complete visual and interaction design system
for the PesaBoard mobile Android app. It covers every screen, every
component, every state, and every piece of copy that needs to be built
in Phase 1.

This version replaces all previous design specs. It is fully aligned to
the revised business model: PesaBoard serves Pochi la Biashara and P2P
users first, with Till and Paybill as secondary markets. Daraja API,
expenses, and profit tracking are deferred to Phase 2 and Phase 3.

**1.2 Product Context**

PesaBoard is a lightweight Android app distributed as a direct APK
download. It reads M-Pesa SMS messages automatically and shows the
business owner a clean dashboard of their income.

The app serves four M-Pesa transaction types, in order of priority:

  -------------- --------------- ------------------ ------------------------------
  **Priority**   **Transaction   **Market**         **Why We Serve Them**
                 Type**                             

  **1 ---        Pochi la        1.15M active       Zero existing dashboard.
  Primary**      Biashara        wallets, 81.7% YoY Completely unserved. This is
                                 growth             our core user.

  **2 ---        P2P (Personal   Millions of        Boda boda, freelancers, casual
  Primary**      M-Pesa          informal traders   traders. No tracking tool
                 received)                          exists.

  **3 ---        Till / BuyGoods Registered         Partially served by M-PESA
  Secondary**                    merchants          Business App but that app has
                                                    reliability issues and no
                                                    WhatsApp summary.

  **4 ---        Paybill         Registered         Included for completeness.
  Secondary**                    businesses         Daraja integration deferred to
                                                    Phase 3.
  -------------- --------------- ------------------ ------------------------------

**1.3 The One Question This App Answers**

+-----------------------------------------------------------------------+
| **Primary Question**                                                  |
|                                                                       |
| How much money did my business make today? Every design decision ---  |
| layout, hierarchy, color, copy --- must serve this question first. If |
| a design element does not help answer this question, it should be     |
| removed or deprioritized.                                             |
+-----------------------------------------------------------------------+

Secondary questions the app also answers (Phase 1):

-   Where did the money come from? (Pochi, P2P, Till, Paybill)

-   Who paid me today? (customer name, time, amount)

-   How does this week compare to last week?

-   Is the app actually reading my M-Pesa messages? (sync status)

Questions deferred to Phase 2 (not answered in Phase 1):

-   How much did I spend? --- requires expense tracking, deferred

-   What is my net profit? --- requires expenses, deferred

-   Can I share a financial report with my accountant? --- Phase 2
    Business Income Report

**PART 2 --- DESIGN PRINCIPLES**

**2.1 Clarity First**

The user should understand the screen within 3 seconds. The largest
number on the dashboard must always be today\'s income. Nothing else
competes with it visually.

Avoid dense tables, complicated charts, and accounting jargon. Use
simple labels:

  ----------------------------------- -----------------------------------
  **Never Use**                       **Use Instead**

  **Gross Revenue**                   Total Income

  **Net Operating Result**            Net Profit (Phase 2 only)

  **Transaction Aggregation**         Payments Received

  **Fiscal Statement**                Monthly Report

  **Data Synchronization**            Sync

  **Authentication**                  Log in
  ----------------------------------- -----------------------------------

**2.2 Mobile-First, Low-End Android**

Most users will be on mid-range to low-end Android phones (KES
3,000--8,000 range). Design for these constraints:

-   Minimum touch target 44px height and width

-   Preferred tap row height 64--72px --- these users have big thumbs
    and small screens

-   Important actions in the thumb-friendly lower 60% of the screen

-   No animations heavier than 200ms --- these phones have slow GPUs

-   No images or heavy assets --- APK must stay under 20MB for easy
    WhatsApp sharing

-   Test every screen on a 360px wide display before considering it done

**2.3 Trust Through Simplicity**

The app handles financial data. Trust is the product. The design must
never feel like a gimmick.

  ----------------------------------- -----------------------------------
  **Do**                              **Do Not**

  **White backgrounds and clean       Heavy gradients or decorative
  cards**                             illustrations on cards

  **Solid deep green for the hero     Gradient + background chart
  card**                              illustration on the hero card

  **Subtle shadows (8% opacity max)** Drop shadows that look like 2018
                                      fintech apps

  **Large bold readable numbers**     Small numbers surrounded by
                                      decorative elements

  **Orange for expense states**       Green for the expense summary card

  **Minimal iconography**             Icons on every element regardless
                                      of meaning
  ----------------------------------- -----------------------------------

**2.4 Local and Friendly**

This product is for Kenyan small business owners, many of whom have
never used a financial app. The copy must feel like a helpful friend,
not a bank.

-   Write in plain English with occasional Swahili where natural

-   Use first person: \'Your income today\' not \'Business income for
    today\'

-   Never use accounting terminology

-   Permission screens must be warm and reassuring, not legal and formal

**2.5 Progressive Detail --- Show Summary, Reveal Depth**

Phase 1 has 3 screens. Each screen adds depth. The user is never
overwhelmed on first open.

  ------------------ -------------------------- ------------------------------
  **Screen**         **What the User Sees**     **What They Get on Tap**

  **Home**           Today\'s total, this week, Full transaction list, or
                     last 5 transactions, sync  transaction detail
                     status                     

  **Transactions**   Complete filtered          Transaction detail screen
                     searchable list grouped by 
                     date                       

  **Settings**       Profile, sync controls,    Individual setting detail or
                     payment type toggles,      edit screens
                     subscription, support      
  ------------------ -------------------------- ------------------------------

**PART 3 --- BRAND DIRECTION**

**3.1 Brand Personality**

  ----------------------------------- -----------------------------------
  **PesaBoard feels like**            **PesaBoard does NOT feel like**

  **A reliable assistant**            A bank app with too many formal
                                      steps

  **A smart business notebook**       A corporate accounting system

  **A friendly accountant in the      A crypto trading dashboard
  user\'s pocket**                    

  **A clean automatic M-Pesa income   A generic SaaS template
  record**                            
  ----------------------------------- -----------------------------------

**3.2 Brand Name Note**

+-----------------------------------------------------------------------+
| **⚠️ Brand Name Pending**                                             |
|                                                                       |
| The name \'PesaBoard\' is already in use by another company. A new    |
| name is being selected. This spec uses \'PesaBoard\' as a placeholder |
| throughout. When the final name is confirmed, do a find-and-replace   |
| across all copy, the app header, onboarding screens, and the APK      |
| manifest before building.                                             |
+-----------------------------------------------------------------------+

**3.3 Brand Voice**

The writing style must be: friendly, direct, local, practical, honest,
and non-technical.

  ------------------ ----------------------------------------------------
  **Context**        **Example Copy**

  **Dashboard        Good morning, Mary. Here\'s how your business is
  greeting**         doing today.

  **Payment          New Pochi payment: KES 500 from Peter Kamau.
  notification**     

  **Daily WhatsApp   Habari Mary! Leo umepata KES 12,450 kutoka kwa
  summary**          wateja 23.

  **Empty state (no  No payments yet today. New M-Pesa payments will
  transactions)**    appear here automatically.

  **Sync success**   M-Pesa payments synced just now.

  **SMS permission   PesaBoard reads only M-Pesa messages. We never read
  request**          your personal messages.

  **Free trial       Your free trial ends in 2 days. Upgrade to keep your
  ending**           daily reports.

  **Upgrade prompt** Upgrade to Starter --- KES 299/mo. Less than a
                     weekly data bundle.
  ------------------ ----------------------------------------------------

**PART 4 --- COLOR SYSTEM**

**4.1 Primary Palette**

  ------------------------- ---------- ------------------------------------------
  **Token**                 **Hex**    **Usage**

  **primary.green**         #16A34A    Main CTAs, income amounts, active nav,
                                       success states, save buttons

  **primary.green.dark**    #0F8A3B    Hero card background (solid, no gradient),
                                       pressed states

  **primary.green.light**   #DCFCE7    Positive badge backgrounds, icon circle
                                       backgrounds

  **trust.blue**            #1E5A8A    Reports screen, Phase 2 income report,
                                       accountant/pro features

  **navy.text**             #0F172A    All primary text, titles, key labels

  **gray.text**             #64748B    Secondary text, captions, inactive tabs

  **gray.border**           #E2E8F0    Card outlines, dividers, input borders

  **surface.white**         #FFFFFF    All card surfaces

  **surface.background**    #F8FAFC    App background behind cards
  ------------------------- ---------- ------------------------------------------

**4.2 Supporting Colors**

  -------------------- ---------- ------------------------------------------
  **Token**            **Hex**    **Usage**

  **expense.orange**   #EA580C    Expenses, outgoing states --- Phase 2 only

  **warning.amber**    #F59E0B    Free trial prompts, upgrade CTAs, warnings

  **error.red**        #DC2626    Error states, failed sync, logout action

  **paybill.blue**     #2563EB    Paybill transaction badges only

  **pochi.purple**     #7C3AED    Pochi la Biashara transaction badges only

  **p2p.teal**         #0891B2    P2P transaction badges only

  **sync.green**       #16A34A    Sync status dot when active

  **sync.gray**        #94A3B8    Sync status dot when idle or offline
  -------------------- ---------- ------------------------------------------

**4.3 Transaction Badge Colors**

  ----------------- ----------------- ----------------- -----------------
  **Payment Type**  **Text Color**    **Background**    **Border**

  **Till**          #15803D           #DCFCE7           #86EFAC

  **Paybill**       #2563EB           #DBEAFE           #93C5FD

  **Pochi**         #7C3AED           #EDE9FE           #C4B5FD

  **P2P**           #0891B2           #ECFEFF           #67E8F9

  **Other /         #475569           #F1F5F9           #CBD5E1
  Unknown**                                             
  ----------------- ----------------- ----------------- -----------------

+-----------------------------------------------------------------------+
| **Critical Color Rule**                                               |
|                                                                       |
| Expenses are never green. Green = income only. The expense summary    |
| card (Phase 2) must use an orange hero card background. If any screen |
| shows expenses with a green card, that is a design bug.               |
+-----------------------------------------------------------------------+

**4.4 Dark Mode Policy**

+-----------------------------------------------------------------------+
| **Dark Mode: Not Supported in Phase 1**                               |
|                                                                       |
| PesaBoard Phase 1 is light mode only. This is an explicit decision,   |
| not an oversight. Reasons: (1) our target users are in bright outdoor |
| environments --- markets, roadside stalls, boda boda stages --- where |
| light mode is more readable; (2) dark mode doubles the design and QA  |
| effort; (3) low-end Android phones often have poor AMOLED contrast.   |
| Document this decision in the codebase. Add dark mode to the Phase 2  |
| roadmap.                                                              |
+-----------------------------------------------------------------------+

**PART 5 --- TYPOGRAPHY**

**5.1 Font**

Use Inter as the primary font. It is modern, highly readable on Android,
and available via Google Fonts with no licensing cost.

> font-family: Inter, Roboto, system-ui, -apple-system, sans-serif;

**5.2 Type Scale**

  --------------- ---------- ------------ -------------------------------------
  **Style**       **Size**   **Weight**   **Usage**

  **Display XL**  44--52px   800          Hero income number on dashboard only

  **Display L**   32--40px   800          Major totals on reports screen

  **Heading 1**   28--32px   800          Screen titles

  **Heading 2**   22--24px   700          Section titles within screens

  **Heading 3**   18--20px   700          Card titles, group labels

  **Body L**      16--18px   500          Important descriptions, primary copy

  **Body M**      14--16px   400--500     Standard body text, list items

  **Body S**      12--14px   400--500     Captions, timestamps, badge text

  **Badge**       12--13px   600          Transaction type badge labels
  --------------- ---------- ------------ -------------------------------------

**5.3 Typography Rules**

-   All currency values must be bold.

-   The amount is always more visually dominant than its label. The
    label is secondary.

-   Use KES 12,450 format throughout. Never Ksh. or KSh. for in-app
    consistency.

-   Use commas in all values above 999. Never write 12450.

-   No decimal places in dashboard summaries. KES 12,450 not KES
    12,450.00.

-   Labels use sentence case, not ALLCAPS or Title Case For Every Word.

-   Minimum text size 12px. Never go below this for any element.

-   Support Android font scaling up to 130% without breaking layout ---
    test this.

**PART 6 --- LAYOUT & SPACING SYSTEM**

**6.1 Spacing Tokens**

  --------------- ----------- ----------------------------------------------
  **Token**       **Value**   **Usage**

  **space.4**     4px         Micro gaps --- icon to text, badge internal

  **space.8**     8px         Icon-label gaps, tight stacking

  **space.12**    12px        Small card internal padding

  **space.16**    16px        Default padding, row internal

  **space.20**    20px        Card padding, screen horizontal padding
                              default

  **space.24**    24px        Section spacing between cards

  **space.32**    32px        Major section dividers
  --------------- ----------- ----------------------------------------------

**6.2 Page Padding**

-   Default horizontal screen padding: 20px

-   Small Android devices (360px wide): reduce to 16px

-   Never use zero horizontal padding --- content must not touch screen
    edges

**6.3 Card Radius**

  ----------------------------------- -----------------------------------
  **Component**                       **Radius**

  **Hero income card**                22--24px

  **Summary cards (2-column grid)**   16--20px

  **Transaction rows**                12--16px or flat within a grouped
                                      list

  **Filter chips**                    999px pill

  **Buttons (primary)**               14--16px

  **Bottom navigation bar**           0px --- flat, full width

  **Modal / bottom sheet**            24px top corners only
  ----------------------------------- -----------------------------------

**6.4 Shadows**

Use subtle shadows only. Never use heavy drop shadows.

> Card shadow: box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08);
>
> Hero card: box-shadow: 0 8px 24px rgba(15, 131, 59, 0.22);
>
> Bottom nav: box-shadow: 0 -2px 12px rgba(15, 23, 42, 0.06);

**PART 7 --- NAVIGATION**

**7.1 Phase 1 Navigation --- 3 Tabs Only**

+-----------------------------------------------------------------------+
| **Why 3 Tabs, Not 5**                                                 |
|                                                                       |
| The original spec had 5 tabs: Home, Transactions, Expenses, Reports,  |
| Settings. This has been reduced to 3 for Phase 1. Expenses is         |
| deferred (nobody logs expenses daily in the informal market). Reports |
| is a single PDF export action --- it does not need a full tab. 3 tabs |
| is the correct complexity for a mama mboga using a financial app for  |
| the first time.                                                       |
+-----------------------------------------------------------------------+

  ------------------ ------------- --------------------------------- ---------------
  **Tab**            **Icon**      **What It Contains**              **Phase**

  **Home**           Wallet        Dashboard: today\'s income hero,  Phase 1
                                   weekly summary, sync status,      
                                   recent transactions               

  **Transactions**   ReceiptText   Full transaction history: search, Phase 1
                                   filters, date groups, transaction 
                                   detail                            

  **Settings**       Settings2     Profile, sync controls, payment   Phase 1
                                   type toggles, subscription,       
                                   support, logout                   

  **Reports (future  BarChart3     Monthly P&L, income report, PDF   Phase 2
  tab)**                           export, share --- added in Phase  
                                   2                                 

  **Expenses (future WalletCards   Expense logging, categories,      Phase 2
  tab)**                           breakdown chart --- added in      
                                   Phase 2                           
  ------------------ ------------- --------------------------------- ---------------

**7.2 Active Tab State**

-   Icon color: primary.green (#16A34A)

-   Label color: primary.green (#16A34A)

-   Font weight: 600

-   Top indicator: 3px green line above icon (32--40px wide, centered)

Inactive tab: icon and label both gray.text (#64748B), font weight 400.

**7.3 Iconography**

Use Lucide React Native icons throughout. Consistent stroke width,
rounded style.

  --------------------- ------------------- ------------------------------
  **Feature**           **Icon Name**       **Size**

  **Home / dashboard**  Wallet              24px nav, 20px cards

  **Transactions**      ReceiptText         24px nav, 20px cards

  **Settings**          Settings2           24px nav

  **Income / money in** TrendingUp or       20px
                        ArrowDownLeft       

  **Sync status**       RefreshCw           16px in status indicator

  **Notification bell** Bell                22px in header

  **Search**            Search              20px in transaction header

  **Filter**            SlidersHorizontal   20px in transaction header

  **WhatsApp summary**  MessageCircle       20px

  **Business profile**  Store               20px

  **Logout**            LogOut              20px --- red color

  **Chevron /           ChevronRight        16px in list rows
  navigate**                                

  **Check / success**   CheckCircle2        20px --- green

  **Warning**           AlertCircle         20px --- amber

  **Error**             XCircle             20px --- red
  --------------------- ------------------- ------------------------------

**PART 8 --- ONBOARDING SCREENS**

+-----------------------------------------------------------------------+
| **Why Onboarding is Critical**                                        |
|                                                                       |
| The onboarding flow --- especially the SMS permission screen --- is   |
| the single highest-risk moment in the entire product. If a user taps  |
| \'Deny\' on the READ_SMS permission, the app is completely            |
| non-functional for them. The permission screen must be warm, clear,   |
| reassuring, and trust-building. Design it with more care than any     |
| other screen.                                                         |
+-----------------------------------------------------------------------+

**8.1 Screen O1 --- Welcome**

  -----------------------------------------------------------------------
  **\[ Logo + App Name \]**

  Your M-Pesa income,

  **tracked automatically.**

  Know exactly how much your business

  made today --- without doing anything.

  \[ Get Started \] ← green button, full width

  Already have an account? Log in
  -----------------------------------------------------------------------

Notes: Full screen green background in top 60%, white bottom sheet.
Single CTA only. No feature list --- the headline copy does the work.

**8.2 Screen O2 --- Create Account**

  -----------------------------------------------------------------------
  **Create your account**

  \[ Phone number input e.g. 0712 345 678 \]

  \[ Full name input \]

  \[ Business name input \]

  \[ Create Account \] ← green button

  We will send you a verification code via SMS.
  -----------------------------------------------------------------------

Notes: Phone number is the primary identifier. Name and business name
collected here. No email required. No password required in Phase 1 ---
phone OTP only reduces friction.

**8.3 Screen O3 --- Payment Type Selection**

  -----------------------------------------------------------------------
  **What M-Pesa payments does your business receive?**

  Select all that apply. You can change this later.

  ☑ Pochi la Biashara ← selected by default

  ☑ Personal M-Pesa received (P2P) ← selected by default

  ☐ Till / BuyGoods (Lipa Na M-Pesa)

  ☐ Paybill

  \[ Continue \] ← green button
  -----------------------------------------------------------------------

Notes: Pochi and P2P are pre-selected because they are our primary
market. This also immediately communicates to the user that we
understand their business. Users with Till or Paybill can select those
additionally.

**8.4 Screen O4 --- SMS Permission (Most Critical Screen)**

  -----------------------------------------------------------------------
  **One important permission**

  \[ Large shield icon in green circle \]

  **PesaBoard reads your M-Pesa messages**

  to track your income automatically.

  ✓ We ONLY read messages from MPESA.

  ✓ We NEVER read messages from contacts.

  ✓ We NEVER share your SMS data.

  ✓ You can turn this off anytime in Settings.

  \[ Allow M-Pesa message access \] ← green button

  \[ Not now \] ← ghost text, smaller

  Tapping Allow opens Android\'s standard permission dialog.
  -----------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **If User Taps \'Not Now\'**                                          |
|                                                                       |
| Show a non-dismissible banner on the home screen: \'PesaBoard needs   |
| to read M-Pesa messages to track your income. Tap here to enable.\'   |
| The app should still open and show an empty dashboard rather than     |
| blocking the user entirely. Give them a path back to the permission.  |
+-----------------------------------------------------------------------+

**8.5 Screen O5 --- First Sync**

  -----------------------------------------------------------------------
  **Importing your M-Pesa history\...**

  \[ Animated progress bar --- green \]

  Found 247 M-Pesa messages.

  Importing your income history\...

  This only takes a few seconds.
  -----------------------------------------------------------------------

Notes: This screen runs the initial SMS inbox scan. Show real progress
if possible (x of y messages processed). This is also the moment that
creates the first \'wow\' --- when they see how many M-Pesa messages
were found. Do not skip this screen or make it instant.

**PART 9 --- SCREEN 1: HOME DASHBOARD**

**9.1 Purpose**

The home screen answers one question immediately: How much money did my
business make today? Everything on this screen serves that question.

**9.2 Full Screen Layout**

  -----------------------------------------------------------------------
  ─────── STATUS BAR ───────

  **\[ Logo \] Good morning, Mary \[ 🔔 \]**

  ──────────────────────────────────────────────

  ┌─────────────────────────────────────┐

  **│ Today\'s Income \[ → \] │**

  │ │

  **│ KES 12,450 │**

  │ │

  │ 23 payments received today │

  │ ● Synced 3 minutes ago │

  └─────────────────────────────────────┘

  ┌──────────────┐ ┌──────────────────┐

  │ This Week │ │ This Month │

  **│ KES 48,900 │ │ KES 187,200 │**

  │ ↑ 12% vs LW │ │ ↑ 8% vs last │

  └──────────────┘ └──────────────────┘

  **7-Day Income Trend**

  \[ Bar chart --- Mon to Sun --- green bars \]

  **Recent Payments View all →**

  ▼ KES 500 John Kamau \[Pochi\] 2:14 PM \>

  ▼ KES 200 Jane Njeri \[P2P\] 1:45 PM \>

  ▼ KES 1,200 Peter M. \[Till\] 12:30 PM \>

  ▼ KES 350 Wanjiku \[Pochi\] 11:55 AM \>

  ──────────────────────────────────────────────

  **\[ Home \] \[ Transactions \] \[ Settings \]**
  -----------------------------------------------------------------------

**9.3 Header**

Elements: app logo (left), personalised greeting (center), notification
bell with badge (right).

Greeting format: \'Good morning, \[first name\]\' --- uses time of day.
Morning before 12PM, Afternoon 12--5PM, Evening after 5PM. First name
pulled from the business profile set during onboarding.

**9.4 Hero Income Card**

+-----------------------------------------------------------------------+
| **Hero Card Rules**                                                   |
|                                                                       |
| 1\. Background: solid primary.green.dark (#0F8A3B). No gradient. No   |
| background illustration. No chart watermark. 2. All text white. 3.    |
| The income number (Display XL, 44--52px, weight 800) is the single    |
| dominant element. 4. Sync status dot is displayed inside the hero     |
| card --- this is the user\'s primary trust signal. 5. Tapping the     |
| card navigates to Transactions filtered to Today.                     |
+-----------------------------------------------------------------------+

Hero card contents:

-   Label: \'Today\'s Income\' --- Body M, white, 60% opacity

-   Value: \'KES 12,450\' --- Display XL, white, weight 800

-   Subtitle: \'23 payments received today\' --- Body M, white, 80%
    opacity

-   Sync indicator: green dot + \'Synced 3 minutes ago\' --- Body S,
    white, 70% opacity

-   Arrow button (top right): navigates to today\'s transactions

**9.5 Sync Status Indicator**

+-----------------------------------------------------------------------+
| **Why Sync Status is on the Hero Card**                               |
|                                                                       |
| The most common user anxiety is: \'Is this app actually reading my    |
| M-Pesa messages?\' They need to see confirmation of this every time   |
| they open the app. Putting the sync status inside the hero card ---   |
| their primary focal point --- answers this anxiety immediately        |
| without them having to look for it.                                   |
+-----------------------------------------------------------------------+

  ---------------- ------------- --------------------- -------------------
  **State**        **Dot Color** **Text**              **When**

  **Active /       Green         Synced X minutes ago  Last sync within 30
  recent sync**    (#16A34A)                           minutes

  **Idle (no new   Gray          Up to date            No new M-Pesa
  messages)**      (#94A3B8)                           messages in inbox

  **Syncing now**  Amber         Syncing\...           Active SMS scan in
                   (pulsing)                           progress

  **Error / no     Red (#DC2626) SMS access needed --- Permission denied
  permission**                   tap to fix            or revoked

  **Offline**      Gray          No internet --- data  No data connection
                   (#94A3B8)     saved on phone        
  ---------------- ------------- --------------------- -------------------

**9.6 Summary Cards (2-Column Grid)**

Two cards below the hero: This Week and This Month.

Each card contains: icon in colored circle (top left), label (gray, Body
S), value (bold, Body L or Heading 3), optional trend comparison vs
previous period.

Trend comparison format:

-   ↑ 12% vs last week --- green text

-   ↓ 6% vs last month --- red text

-   = Same as last week --- gray text

+-----------------------------------------------------------------------+
| **No Net Profit Card in Phase 1**                                     |
|                                                                       |
| The original spec had a Net Profit card in the summary grid. This has |
| been removed. Net Profit requires reliable expense data. In Phase 1,  |
| expenses are not tracked. Showing Net Profit = Total Income is        |
| misleading and confusing. It returns in Phase 2 when the expense      |
| tracker is added.                                                     |
+-----------------------------------------------------------------------+

**9.7 7-Day Income Trend Chart**

Chart type: simple bar chart. Data: Mon--Sun daily income totals.
Design: green bars, light gray dashed gridlines, day labels below.
Highlight today\'s bar in primary.green.dark. Other bars in
primary.green.light.

Keep the chart simple. No tooltips in Phase 1. No interactive selection.
Just a clean visual showing the week\'s shape.

**9.8 Recent Payments**

Show last 5 transactions. Section header: \'Recent Payments\' with a
\'View all →\' link to the Transactions tab.

Each row: incoming arrow icon (green circle, 40px), amount (bold, Body
L), customer name (gray, Body M), type badge, time (right-aligned, Body
S), chevron. Minimum row height 68px. Alternating white and
surface.background row colors.

Empty state:

-   Icon: inbox with dotted border

-   Heading: \'No payments yet today\'

-   Body: \'New M-Pesa payments will appear here automatically.\'

-   CTA: \'Check sync settings\' --- navigates to Settings \> SMS Sync

**PART 10 --- SCREEN 2: TRANSACTIONS**

**10.1 Full Screen Layout**

  -----------------------------------------------------------------------
  ─────── STATUS BAR ───────

  **\[ Logo \] Transactions \[ 🔍 \] \[ ⚡ \]**

  ──────────────────────────────────────────────

  \[ All \] \[ Till \] \[ Pochi \] \[ P2P \] \[ Paybill \]

  ┌────────────────────────────────────────┐

  │ 96 transactions KES 582,400 total │

  └────────────────────────────────────────┘

  **Today**

  ▼ KES 500 John Kamau \[Pochi\] 2:14 PM \>

  ▼ KES 200 Jane Njeri \[P2P\] 1:45 PM \>

  ▼ KES 1,200 Peter M. \[Till\] 12:30 PM \>

  **Yesterday**

  ▼ KES 800 Wanjiku \[Pochi\] 5:12 PM \>

  ▼ KES 350 James K. \[P2P\] 3:44 PM \>

  ──────────────────────────────────────────────

  **\[ Home \] \[ Transactions \] \[ Settings \]**
  -----------------------------------------------------------------------

**10.2 Filter Chips**

Horizontal scrolling row of filter chips: All, Pochi, P2P, Till,
Paybill, Date Range.

Active chip: primary.green background, white text, pill shape. Inactive
chips: light type-specific background with type color text. Date Range
chip opens a bottom sheet date picker.

**10.3 Summary Strip**

Fixed card above the list showing totals for the current filter:
transaction count and total amount. Updates instantly when filter
changes. Format: \'96 transactions \| KES 582,400 total\'

**10.4 Transaction List**

Grouped by date with sticky group headers: Today, Yesterday, \[date e.g.
May 10\], This Week, Older.

Each row minimum height 68px. Elements: incoming arrow in colored circle
(40px, color matches payment type), amount (bold, 16--18px), customer
name (gray, 14px), type badge, time (right), chevron (far right).
Tapping any row opens Transaction Detail screen.

**10.5 Search Behavior**

Search bar appears when the search icon is tapped. Searches across:
customer name, amount (partial match), M-Pesa code, phone number,
account reference (Paybill).

**10.6 Empty State**

-   \'No payments found\'

-   \'Try a different filter or date range.\'

-   CTA: \'Clear filters\'

**PART 11 --- SCREEN 3: TRANSACTION DETAIL**

**11.1 Purpose**

The transaction detail screen shows everything about a single M-Pesa
payment. This screen is also the foundation for Phase 2\'s Business
Income Report --- clean, complete transaction records build the verified
income history.

**11.2 Screen Layout**

  -----------------------------------------------------------------------
  **← Back Payment Detail**

  ──────────────────────────────────────────────

  \[ Green circle + Pochi icon --- 60px \]

  **KES 500**

  Pochi la Biashara

  ┌──────────────────────────────────────┐

  │ From John Kamau │

  │ Phone +254 712 \*\*\* \*\*\* │

  │ Date May 12, 2026 │

  │ Time 2:14 PM │

  │ M-Pesa Code OEI2AK4Q16 │

  │ Source SMS (auto-detected) │

  │ Balance KES 12,450 after │

  └──────────────────────────────────────┘

  Add a note (optional)\...

  \[ Share via WhatsApp \] ← outline button
  -----------------------------------------------------------------------

**11.3 Field Specifications**

  --------------- --------------------- ----------------------------------
  **Field**       **Data Source**       **Display Rule**

  **From          Parsed from SMS or    Show full name. If unknown show
  (customer       Daraja                \'Unknown sender\'.
  name)**         FirstName+LastName    

  **Phone         Parsed from SMS       Show masked: +254 712 \*\*\*
  number**        (MSISDN from Daraja   \*\*\*. Never show full number.
                  is hashed)            

  **Date**        Parsed timestamp      May 12, 2026 format

  **Time**        Parsed timestamp      2:14 PM format

  **M-Pesa Code** Parsed from SMS or    Show as-is: OEI2AK4Q16. Monospace
                  Daraja TransID        font.

  **Source**      Set during sync       \'SMS (auto-detected)\' or
                                        \'Daraja API (real-time)\' in
                                        Phase 3

  **Balance       Parsed from SMS       Running M-Pesa balance after this
  after**                               transaction.

  **Note**        User-entered          Optional free text. Saved to
                                        Supabase. Useful for labelling
                                        context.
  --------------- --------------------- ----------------------------------

**11.4 Share via WhatsApp**

Tapping Share via WhatsApp opens the native Android share sheet with a
pre-formatted message:

> Payment received: KES 500 from John Kamau via Pochi la Biashara
>
> Time: 2:14 PM, May 12, 2026
>
> M-Pesa Code: OEI2AK4Q16
>
> Tracked by \[App Name\]

**PART 12 --- SCREEN 4: SETTINGS**

**12.1 Full Screen Layout**

  -----------------------------------------------------------------------
  ─────── STATUS BAR ───────

  **\[ Logo \] Settings**

  ──────────────────────────────────────────────

  ┌──────────────────────────────────────┐

  │ \[ Store icon \] Mary\'s Salon │

  │ Mary Wanjiku │

  │ +254 722 123 456 ✎ │

  └──────────────────────────────────────┘

  **▸ NOTIFICATIONS**

  WhatsApp daily summary \[ ON \]

  Payment alerts \[ OFF \]

  **▸ SYNC & DATA**

  SMS sync \[ ON \]

  Last synced: 3 minutes ago

  **▸ PAYMENT TYPES TRACKED**

  \[✓ Pochi\] \[✓ P2P\] \[ Till\] \[ Paybill\]

  **▸ SUBSCRIPTION**

  **Free Trial --- 5 days remaining**

  \[ Upgrade to Starter --- KES 299/mo \]

  Help & Support / Privacy / Log Out

  ──────────────────────────────────────────────

  **\[ Home \] \[ Transactions \] \[ Settings \]**
  -----------------------------------------------------------------------

**12.2 Business Profile Card**

Shows: store icon avatar (40px circle, green background), business name
(bold, Heading 3), owner name and phone (gray, Body M), pencil/edit icon
on right. Tapping the card opens a Business Profile edit screen.

**12.3 Notifications Section**

Two toggle rows: WhatsApp daily summary and Payment alerts.

WhatsApp daily summary row: when toggled ON shows a WhatsApp preview
button --- \'Preview tonight\'s summary\' --- which shows the user
exactly what the 8PM message will look like with their real data. This
builds trust and excitement.

**12.4 Sync & Data Section**

SMS sync toggle --- when toggled OFF shows a warning: \'Turning off SMS
sync means new payments will not appear automatically.\' Require
confirmation before disabling.

Last synced timestamp always visible below the toggle. If sync failed,
show red error text with a \'Fix now\' link.

**12.5 Tracked Payment Types**

Four selectable chips: Pochi la Biashara, P2P, Till, Paybill. Active
chips show a checkmark and use the type\'s color scheme. Inactive chips
are gray. Changing these immediately updates what the SMS parser looks
for going forward.

**12.6 Subscription Card**

+-----------------------------------------------------------------------+
| **Free Trial Counter UI**                                             |
|                                                                       |
| The subscription card is the most important conversion surface in the |
| app. During the free trial: show days remaining prominently (amber    |
| background if 3 or fewer days left). Show what the user will lose if  |
| they do not upgrade. Keep the upgrade CTA clear but not aggressive.   |
| Free tier: \'Free --- 30-day history only\' Starter (KES 299/mo):     |
| \'Full history + WhatsApp daily summary\' Business (KES 699/mo):      |
| \'Phase 2 --- Business Income Report + 2 users\'                      |
+-----------------------------------------------------------------------+

  --------------- --------------------- ---------------------- -------------------
  **Trial State** **Card Background**   **Primary Text**       **CTA**

  **Days 1--4 of  surface.background    Free Trial --- X days  Upgrade to Starter
  trial**                               remaining              --- KES 299/mo

  **Days 5--7 of  warning.amber light   Trial ends in X days.  Upgrade Now --- KES
  trial**                               Upgrade to keep your   299/mo
                                        daily reports.         

  **Trial         error.red light       Your free trial has    Upgrade --- KES
  expired**                             ended. Upgrade to      299/mo
                                        continue.              

  **Active        primary.green.light   Starter Plan --- KES   Manage Plan
  Starter plan**                        299/mo                 

  **Active        trust.blue light      Business Plan --- KES  Manage Plan
  Business plan**                       699/mo                 
  --------------- --------------------- ---------------------- -------------------

**PART 13 --- SCREEN 5: REPORTS (PHASE 2)**

+-----------------------------------------------------------------------+
| **Phase 2 Screen --- Not Built in Phase 1**                           |
|                                                                       |
| The Reports screen is a Phase 2 feature. In Phase 1, there is no      |
| Reports tab in the bottom navigation. However, the screen is          |
| specified here so the architecture can be planned and the Phase 2     |
| build can begin from a clear starting point. In Phase 1, the only     |
| report-adjacent feature is the \'Share via WhatsApp\' button on the   |
| Transaction Detail screen.                                            |
+-----------------------------------------------------------------------+

**13.1 The Business Income Report --- Phase 2 Killer Feature**

The Business Income Report is the most important feature in Phase 2. It
is what differentiates PesaBoard from Safaricom\'s app. A user who has
30+ days of tracked income can generate a verified income record and
share it with a sacco, chama, supplier, or microfinance institution.

Report contents:

-   Business name and owner name

-   Reporting period (e.g. March 2026 --- April 2026)

-   Total income per month

-   Average daily income

-   Transaction count and consistency

-   Income breakdown by payment type (Pochi, P2P, Till)

-   Best day and peak transaction time

-   PesaBoard verification watermark and generation timestamp

**13.2 Reports Screen Layout (Phase 2)**

  -----------------------------------------------------------------------
  **\[ ← Home \] Reports \[ April 2026 ▼ \]**

  ──────────────────────────────────────────────

  ┌──────────────────────────────────────┐

  **│ Total Income KES 312,450 │**

  │ Transactions 1,248 │

  │ Avg Daily Income KES 10,415 │

  └──────────────────────────────────────┘

  \[ Weekly bar chart --- W1 W2 W3 W4 \]

  \[ Donut chart: Pochi / P2P / Till / Paybill \]

  ┌──────────────────────────────────────┐

  **│ 📄 Business Income Report │**

  │ Share your verified income record │

  │ \[ Generate Report \] ← green CTA │

  └──────────────────────────────────────┘

  \[ Share via WhatsApp \] \[ Download PDF \]
  -----------------------------------------------------------------------

**PART 14 --- COMPONENT SPECIFICATIONS**

**14.1 HeroMetricCard**

> type HeroMetricCardProps = {
>
> title: string; // \'Today\\\'s Income\'
>
> value: string; // \'KES 12,450\'
>
> subtitle?: string; // \'23 payments received today\'
>
> syncStatus: SyncStatus; // drives the sync indicator
>
> onPress?: () =\> void; // navigates to today\'s transactions
>
> };

Background: primary.green.dark solid (#0F8A3B). No gradient. No
illustration. Min height 160px. Rounded corners 24px. Padding 24px.

**14.2 SummaryCard**

> type SummaryCardProps = {
>
> label: string;
>
> value: string;
>
> trend?: string; // \'↑ 12% vs last week\'
>
> trendDirection?: \'up\' \| \'down\' \| \'neutral\';
>
> icon: ReactNode;
>
> };

**14.3 TransactionRow**

> type TransactionRowProps = {
>
> amount: number;
>
> customerName?: string;
>
> type: \'till\' \| \'paybill\' \| \'pochi\' \| \'p2p\';
>
> time: string;
>
> onPress?: () =\> void;
>
> };

Layout: left icon circle (40px, color matches type), amount (bold
16--18px), name (gray 14px), type badge (right), time (right aligned),
chevron (far right). Min height 68px.

**14.4 TypeBadge**

> type TypeBadgeProps = {
>
> type: \'till\' \| \'paybill\' \| \'pochi\' \| \'p2p\' \| \'other\';
>
> };

Pill shape, 999px radius. Font: Badge style (12--13px, weight 600).
Colors from Section 4.3. Label text: \'Till\', \'Paybill\', \'Pochi\',
\'P2P\'. Always use text label alongside color --- never color alone.

**14.5 FilterChip**

> type FilterChipProps = {
>
> label: string;
>
> active?: boolean;
>
> color?: \'green\' \| \'blue\' \| \'purple\' \| \'teal\' \| \'gray\';
>
> onPress?: () =\> void;
>
> };

Height 36--40px. Pill radius. Horizontal padding 14--18px. Active:
filled background, type color, border. Inactive: light gray background,
gray text.

**14.6 ToggleRow**

> type ToggleRowProps = {
>
> icon: ReactNode;
>
> title: string;
>
> description?: string;
>
> value: boolean;
>
> onValueChange: (value: boolean) =\> void;
>
> destructive?: boolean; // shows confirmation on toggle-off
>
> };

**14.7 SyncStatusIndicator**

> type SyncStatusIndicatorProps = {
>
> status: \'active\' \| \'idle\' \| \'syncing\' \| \'error\' \|
> \'offline\';
>
> lastSyncedAt?: Date;
>
> onPress?: () =\> void; // navigates to Settings \> Sync
>
> };

Used inside the HeroMetricCard. Small dot (8px) + text label. Pulsing
animation when status is \'syncing\'. Tapping when status is \'error\'
navigates to Settings.

**PART 15 --- INTERACTION DESIGN**

**15.1 Tap States**

-   Cards and rows: slight opacity reduction to 0.92, scale down to
    0.98, 100ms transition

-   Buttons: background darkens 10%, scale down to 0.97, 80ms transition

-   Never remove the pressed state entirely --- users on low-end phones
    need tactile feedback

**15.2 Loading States**

Use skeleton loaders instead of spinners for all dashboard cards. This
is critical for perceived performance on slow phones.

Loading sequence on app open:

1.  Header and greeting appear instantly (from cached data)

2.  Hero card skeleton pulses (1--2 seconds on average connection)

3.  Summary card skeletons appear below hero

4.  Transaction row skeletons (3 rows) below summary

5.  Real data replaces skeletons as it loads

Skeleton style: gray.border (#E2E8F0) background with a shimmer
animation moving left to right. No spinning indicators anywhere on the
dashboard.

**15.3 Empty States**

  --------------- ------------- ---------------------- -------------------
  **Screen /      **Heading**   **Body**               **CTA**
  Context**                                            

  **No payments   No payments   New M-Pesa payments    Check sync settings
  today**         yet today     will appear here       
                                automatically.         

  **No payments   No payments   Try a different filter Clear filters
  in filter**     found         or date range.         

  **No            Your M-Pesa   Make sure SMS sync is  Check sync settings
  transaction     history will  on and M-Pesa messages 
  history at      appear here   are in your inbox.     
  all**                                                

  **SMS           SMS access    PesaBoard needs to     Allow access
  permission      needed        read M-Pesa messages   
  denied**                      to track your income.  

  **Offline**     No internet   Your data is saved on  (no CTA)
                  connection    this phone. It will    
                                sync when you are back 
                                online.                
  --------------- ------------- ---------------------- -------------------

**15.4 Error States**

  --------------- -------------- --------------------- -------------------
  **Error**       **Display**    **Message**           **User Action**

  **SMS sync      Red banner in  SMS access needed --- Opens Android app
  failed / no     hero card sync tap to fix            settings
  permission**    indicator                            

  **Internet sync Subtle gray    Couldn\'t sync right  Auto-retries in
  failed**        indicator in   now. Data saved on    background
                  hero card      phone.                

  **Supabase      Toast          Sync failed. Will     No action required
  connection      notification   retry automatically.  
  error**         at bottom                            

  **Auth /        Full screen    Your session has      \'Log in\' button
  session         prompt         expired. Please log   
  expired**                      in again.             
  --------------- -------------- --------------------- -------------------

**15.5 Success States**

  --------------------- -------------------------------------------------
  **Action**            **Feedback**

  **New payment         Subtle green toast at top: \'New payment: KES 500
  detected (from SMS)** from John Kamau (Pochi)\' --- 3 seconds,
                        auto-dismiss

  **Manual sync         Sync indicator in hero card shows \'Syncing\...\'
  triggered**           then \'Synced just now\'

  **Settings saved**    Toast: \'Settings saved\'

  **Report shared via   Toast: \'Report shared\'
  WhatsApp**            
  --------------------- -------------------------------------------------

**PART 16 --- DATA FORMATTING RULES**

**16.1 Currency**

-   Format: KES 12,450 --- always, everywhere, no exceptions

-   No decimal places in summaries and lists: KES 12,450 not KES
    12,450.00

-   Show decimals only in transaction detail if the amount has cents:
    KES 12,450.50

-   Always use KES not Ksh., KSh, or KES.

-   Bold all currency values

-   Right-align currency in tables and lists

Currency formatter (TypeScript):

> export function formatKES(value: number): string {
>
> return \`KES \${Math.round(value).toLocaleString(\'en-KE\')}\`;
>
> }

**16.2 Dates and Times**

  --------------------- --------------- ----------------------------------
  **Context**           **Format**      **Example**

  **Transaction time    Time only       2:14 PM
  (same day)**                          

  **Transaction date    Day + time      Yesterday, 5:12 PM
  (yesterday)**                         

  **Transaction date    Day name + time Monday, 3:44 PM
  (this week)**                         

  **Transaction date    Short date +    May 10, 2:30 PM
  (older)**             time            

  **Section group       Contextual      Today / Yesterday / May 10 / This
  header**                              Week / Older

  **Reports month       Month + year    April 2026
  selector**                            

  **Date range**        Range format    May 1 -- May 31

  **Sync status**       Relative time   Synced 3 minutes ago / Synced just
                                        now
  --------------------- --------------- ----------------------------------

**16.3 Phone Numbers**

Display format: +254 712 345 678

In transaction detail, mask the middle digits: +254 712 \*\*\* \*\*\*

Input accepts: 0712345678 or +254712345678 or 254712345678 --- normalise
internally.

**PART 17 --- ACCESSIBILITY**

**17.1 Contrast**

-   All text must meet WCAG AA contrast ratios minimum

-   White text on primary.green.dark (#0F8A3B) hero card: passes AA at
    all sizes

-   Never use light green text on white --- fails contrast below 24px
    bold

-   Gray text (#64748B) on white background: passes AA for body sizes
    14px+

**17.2 Touch Targets**

-   Minimum touch target: 44px height × 44px width --- no exceptions

-   Transaction rows: minimum 68px height

-   Bottom nav tabs: minimum 48px height

-   Filter chips: minimum 36px height, 44px wide

**17.3 Color Independence**

Never use color as the only distinguisher. Transaction type badges must
show a text label (Till, Pochi, P2P, Paybill) in addition to the color
background. Sync status uses both a dot color AND a text label.

**17.4 Font Scaling**

The app must support Android font scaling up to 130% without layout
breakage. Test every screen at 130% font scale before shipping. Rules
for graceful degradation:

-   Wrap labels where needed --- never truncate currency amounts

-   Truncate customer names after 20 characters with ellipsis if they
    overflow

-   The hero income number must always fit on one line --- reduce font
    size before wrapping

**PART 18 --- REACT NATIVE IMPLEMENTATION NOTES**

**18.1 Recommended Libraries**

  ------------------------------------------------ --------------- ----------------------------------
  **Library**                                      **Purpose**     **Notes**

  **React Native / Expo (bare workflow)**          App framework   Bare workflow needed for READ_SMS
                                                                   native module

  **React Navigation v6**                          Navigation      Bottom tabs + stack navigator

  **Zustand**                                      State           Lightweight, no boilerplate
                                                   management      

  **\@supabase/supabase-js**                       Backend + auth  Use anon key in app, service key
                                                                   only on backend

  **react-native-get-sms-android**                 SMS reading     READ_SMS native module --- only
                                                                   works on Android

  **\@react-native-async-storage/async-storage**   Local storage   Persist last sync timestamp, user
                                                                   preferences

  **react-native-chart-kit**                       Charts          Bar chart for 7-day trend

  **lucide-react-native**                          Icons           Consistent rounded outline icons
                                                                   throughout

  **react-native-share**                           Share sheet     WhatsApp and general sharing
  ------------------------------------------------ --------------- ----------------------------------

**18.2 Folder Structure**

> src/
>
> screens/
>
> onboarding/
>
> WelcomeScreen.tsx
>
> CreateAccountScreen.tsx
>
> PaymentTypeScreen.tsx
>
> SmsPermissionScreen.tsx ← most critical screen
>
> FirstSyncScreen.tsx
>
> HomeScreen.tsx
>
> TransactionsScreen.tsx
>
> TransactionDetailScreen.tsx ← new in V2
>
> SettingsScreen.tsx
>
> ReportsScreen.tsx ← Phase 2 only
>
> components/
>
> cards/
>
> HeroMetricCard.tsx
>
> SummaryCard.tsx
>
> SubscriptionCard.tsx
>
> lists/
>
> TransactionRow.tsx
>
> TransactionGroup.tsx
>
> navigation/
>
> BottomTabs.tsx
>
> status/
>
> SyncStatusIndicator.tsx ← new in V2
>
> badges/
>
> TypeBadge.tsx
>
> shared/
>
> FilterChip.tsx
>
> ToggleRow.tsx
>
> EmptyState.tsx
>
> SkeletonCard.tsx
>
> hooks/
>
> useSmsSync.ts ← core logic
>
> useDashboard.ts
>
> useTransactions.ts
>
> lib/
>
> supabase.ts
>
> smsParser.ts ← built first
>
> formatCurrency.ts
>
> formatDate.ts
>
> store/
>
> index.ts ← Zustand
>
> theme/
>
> colors.ts
>
> spacing.ts
>
> typography.ts
>
> shadows.ts

**18.3 Theme Tokens (TypeScript)**

> export const colors = {
>
> green: \'#16A34A\',
>
> greenDark: \'#0F8A3B\',
>
> greenLight: \'#DCFCE7\',
>
> blue: \'#1E5A8A\',
>
> navy: \'#0F172A\',
>
> grayText: \'#64748B\',
>
> border: \'#E2E8F0\',
>
> background: \'#F8FAFC\',
>
> white: \'#FFFFFF\',
>
> orange: \'#EA580C\',
>
> amber: \'#F59E0B\',
>
> red: \'#DC2626\',
>
> purple: \'#7C3AED\',
>
> teal: \'#0891B2\',
>
> };
>
> export const spacing = { xs:4, sm:8, md:12, lg:16, xl:20, xxl:24,
> xxxl:32 };
>
> export const radius = { sm:8, md:12, lg:16, xl:20, xxl:24, pill:999 };

**PART 19 --- MVP SCOPE & PHASE MAP**

**19.1 Phase 1 --- Must Have (Build Now)**

  ------------------------- -------------- -------------------------------
  **Screen / Feature**      **Priority**   **Notes**

  **Onboarding: Welcome,    Must Have      Keep it simple --- phone
  Create Account**                         number + name only

  **Onboarding: Payment     Must Have      Pochi + P2P pre-selected
  Type Selection**                         

  **Onboarding: SMS         Must Have ---  Most important screen. Get copy
  Permission Screen**       Critical       exactly right.

  **Onboarding: First Sync  Must Have      Show progress and excitement
  screen**                                 during first import

  **Home dashboard with     Must Have      Solid green, no
  hero card**                              gradient/illustration

  **Sync status indicator   Must Have      Users must always know if the
  in hero card**                           app is working

  **This Week and This      Must Have      No Net Profit card in Phase 1
  Month summary cards**                    

  **7-day income bar        Must Have      Simple, green bars, no
  chart**                                  interactivity needed

  **Recent Payments list    Must Have      With \'View all\' link to
  (last 5)**                               Transactions tab

  **Full Transactions       Must Have      All, Pochi, P2P, Till, Paybill,
  screen with filters**                    Date Range

  **Transaction Detail      Must Have      New in V2 --- foundation for
  screen**                                 Phase 2 income report

  **Settings screen**       Must Have      Profile, sync, payment types,
                                           subscription, support

  **Free trial counter in   Must Have      7-day trial, amber warning at 3
  subscription card**                      days, red at 0

  **3-tab bottom            Must Have      Home, Transactions, Settings
  navigation**                             only

  **Empty states for all    Must Have      Never show a blank screen
  screens**                                

  **Loading skeletons for   Must Have      No spinners on main dashboard
  dashboard**                              

  **WhatsApp daily summary  Must Have      8PM EAT via Africa\'s Talking
  (backend)**                              --- built in Week 3
  ------------------------- -------------- -------------------------------

**19.2 Phase 2 --- Build After First 50 Users**

  --------------------------- -------------------------------------------
  **Feature**                 **Trigger to Build**

  **Expense tracking screen + After 20+ users actively using the app
  tab**                       daily

  **Business Income Report    After 30 days of user data collected for at
  PDF**                       least 10 users

  **Reports screen + tab (5th When Business Income Report is ready
  tab)**                      

  **Net Profit summary card** When expense tracking is live and reliable

  **Accountant / 2nd user     When first Business tier subscriber
  access**                    requests it

  **Month-on-month comparison When reports screen is built
  chart**                     

  **Dark mode**               After core Phase 1 is stable and tested
  --------------------------- -------------------------------------------

**19.3 Quality Checklist --- Before Shipping Each Screen**

-   The main number is visible and readable within 3 seconds of opening
    the screen

-   All touch targets are at least 44px in height and width

-   Currency formatting is KES XX,XXX throughout --- no exceptions

-   Transaction type badges show text labels, not color alone

-   The active bottom tab is clearly visible

-   Empty state exists and is helpful, not generic

-   Loading skeleton exists --- no blank flash before data loads

-   Error state exists and tells the user what to do

-   Copy is friendly, plain English, and non-technical

-   Screen works on 360px wide display

-   Screen works at 130% font scale without layout breakage

-   Hero card background is solid green --- no gradient, no background
    illustration

-   No Net Profit displayed anywhere in Phase 1

**PART 20 --- MICROCOPY LIBRARY**

**20.1 Home Dashboard**

  ---------------------- ------------------------------------------------
  **Element**            **Copy**

  **Morning greeting**   Good morning, \[name\]

  **Afternoon greeting** Good afternoon, \[name\]

  **Evening greeting**   Good evening, \[name\]

  **Hero subtitle**      \[N\] payments received today

  **Sync active**        Synced \[N\] minutes ago

  **Sync just now**      Synced just now

  **Sync idle**          Up to date

  **Sync error**         SMS access needed --- tap to fix

  **Sync offline**       No internet --- data saved on phone

  **No transactions      No payments yet today
  empty state heading**  

  **No transactions      New M-Pesa payments will appear here
  empty body**           automatically.

  **View all             View all →
  transactions link**    

  **Section heading:     Recent Payments
  recent payments**      
  ---------------------- ------------------------------------------------

**20.2 Onboarding**

  ------------------- ---------------------------------------------------
  **Screen**          **Key Copy**

  **Welcome           Your M-Pesa income, tracked automatically.
  headline**          

  **Welcome body**    Know exactly how much your business made today ---
                      without doing anything.

  **Permission screen One important permission
  heading**           

  **Permission        PesaBoard reads only M-Pesa messages. We never read
  explanation 1**     your personal messages.

  **Permission bullet We ONLY read messages from MPESA.
  1**                 

  **Permission bullet We NEVER read messages from contacts.
  2**                 

  **Permission bullet We NEVER share your SMS data.
  3**                 

  **Permission bullet You can turn this off anytime in Settings.
  4**                 

  **Permission CTA**  Allow M-Pesa message access

  **Permission        Not now
  decline**           

  **First sync        Importing your M-Pesa history\...
  heading**           

  **First sync body** This only takes a few seconds.
  ------------------- ---------------------------------------------------

**20.3 Subscription & Trial**

  ------------------- ---------------------------------------------------
  **State**           **Copy**

  **Trial active (\>3 Free Trial --- \[N\] days remaining
  days)**             

  **Trial warning     Trial ends in \[N\] days. Upgrade to keep your
  (1--3 days)**       daily reports.

  **Trial expired**   Your free trial has ended. Upgrade to continue.

  **Upgrade CTA**     Upgrade to Starter --- KES 299/mo

  **Upgrade value     Less than a weekly data bundle.
  prop**              

  **Free tier label** Free --- 30-day history only

  **Starter tier      Starter --- Full history + WhatsApp daily summary
  label**             

  **Business tier     Business --- Income Report + 2 users (Phase 2)
  label**             
  ------------------- ---------------------------------------------------

***Design is done when nothing more can be removed.***

*Build the SMS permission screen with the most care. Get the hero card
exactly right. Everything else follows.*
