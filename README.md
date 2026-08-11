# FitPulse AI Hub

Build a responsive, Progressive Web App (PWA) for "FitPulse AI" gym management SaaS with a dark slate (#0B0F17) background, glassmorphic cards, and Emerald Green (#10B981) accents.



Key Roles, Flows & Pages:



1. Unified Login Page (`/login`):

   - Glassmorphic card with Email, Password, and "Sign In" button.

   - Links below Sign In: "Register New Gym" and "Join as Member with Gym Code".

   - Include Quick Demo Credential Buttons (Super Admin, Gym Owner, Gym Trainer, Member, Front-Desk Created Member).



2. Registration & Account Creation Logic:

   - Gym Owner Signup: Gym Name, Slug, Owner Name, Email, Password.

   - Self Member Signup: Gym Code, Member Name, Email, Phone, Password (No password reset needed on first login).

   - Gym Owner/Desk Creation: Add member modal generates default password `Member@123`.



3. First-Time Password Reset Security:

   - ONLY trigger the mandatory "Set New Password" modal if a member logs in for the first time with the default owner-assigned password (`Member@123`). Self-registered members skip this.



4. Gym Owner Dashboard (`/gym-owner`):

   - Focus on Finances & Business Growth: Earnings Summary Cards (MRR, Total Revenue, Active Members count).

   - "Add Member" and "Add Trainer" buttons.

   - Active Members List & Subscription Status.

   - (NOTE: Financial metrics must strictly remain visible to Gym Owner ONLY).



5. Gym Trainer Dashboard (`/trainer-portal`):

   - NO Financial or Profit data visible here.

   - Assigned Members List & Daily Attendance Verification.

   - "Pending Plan Approvals Queue":

     * Displays member AI workout/diet requests.

     * "View Plan Details" button opening a modal with full AI workout exercises and diet meal breakdowns.

     * Actions inside modal: "Approve & Send to Member" and "Reject / Re-generate".



6. Member Portal (`/member-portal`):

   - Attendance Badge (e.g., "18 Days Streak 🔥").

   - Today's Workout & Diet Routine Checklists with progress bars.

   - "Request New Plan from Trainer" button (routes directly to Gym Trainer's pending queue).

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://fitly-gym.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/51c84a55-3f9c-432e-9d5a-9d651a3da41d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
