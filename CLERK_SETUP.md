# Clerk Authentication Setup

## 1. Create a Clerk Account

1. Go to [clerk.com](https://clerk.com) and sign up for a free account
2. Create a new application in your Clerk dashboard
3. Choose "Next.js" as your framework

## 2. Get Your API Keys

In your Clerk dashboard:
1. Go to "API Keys" in the sidebar
2. Copy your "Publishable Key" and "Secret Key"

## 3. Create Environment Variables

Create a `.env.local` file in the `sales-frontend` directory with the following content:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# Sign-in and sign-up URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/app
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/app
```

**Important:** Replace `your_publishable_key_here` and `your_secret_key_here` with your actual Clerk API keys.

## 4. Configure Allowed Domains (Optional)

In your Clerk dashboard:
1. Go to "Domains"
2. Add your development domain (e.g., `localhost:3000`)
3. Add your production domain when you deploy

## 5. Test the Implementation

1. Start your development server: `npm run dev`
2. Visit `http://localhost:3000`
3. Click "Sign In" in the top right corner
4. Create a new account or sign in
5. You should be redirected to the `/app` page after authentication

## Features Implemented

✅ **User Authentication**: Sign-in/sign-up with email and social providers
✅ **Protected Routes**: `/app` route requires authentication
✅ **User Profile**: Clickable user avatar in top-right corner of navbar
✅ **Custom Styling**: Dark theme that matches your SalesDoc branding
✅ **Responsive Design**: Works on desktop and mobile devices

## Components Added

- **UserButton**: Displays user avatar with dropdown menu (sign out, manage account)
- **SignInButton**: Styled button for unauthenticated users
- **SignedIn/SignedOut**: Conditional rendering based on auth state
- **Protected App Page**: Dashboard with user information and mock data
- **Middleware**: Located at `src/middleware.ts` to protect routes

## Customization

The authentication components are styled to match your dark theme with:
- Gray-900 backgrounds for auth forms
- Blue accent colors for buttons and links
- White text on dark backgrounds
- Consistent border styling with your existing design

You can further customize the appearance by modifying the `appearance` prop in the Clerk components. 