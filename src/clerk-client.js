import { Clerk } from '@clerk/clerk-js';

export const SIGN_IN_URL = '/sign-in';
export const SIGN_UP_URL = '/sign-up';

export const appearance = {
  variables: {
    colorPrimary: '#003f71',
    colorDanger: '#cf2e2e',
    colorText: '#313131',
    colorBackground: '#ffffff',
    colorInputBackground: '#ffffff',
    colorInputText: '#313131',
    fontFamily: 'Lato, Arial, sans-serif',
    borderRadius: '8px',
  },
};

function loadClerkUi(publishableKey) {
  if (window.__internal_ClerkUICtor) return Promise.resolve();
  const clerkDomain = atob(publishableKey.split('_')[2]).slice(0, -1);
  if (!/^[a-z0-9.-]+$/i.test(clerkDomain)) throw new Error('Clerk publishable key is not valid');
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://${clerkDomain}/npm/@clerk/ui@1/dist/ui.browser.js`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      if (!window.__internal_ClerkUICtor) reject(new Error('Failed to load Clerk UI'));
      else resolve();
    };
    script.onerror = () => reject(new Error('Failed to load Clerk UI'));
    document.head.appendChild(script);
  });
}

export async function startClerk() {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) return null;
  await loadClerkUi(publishableKey);
  const clerk = new Clerk(publishableKey);
  await clerk.load({
    appearance,
    signInUrl: SIGN_IN_URL,
    signUpUrl: SIGN_UP_URL,
    signInFallbackRedirectUrl: '/',
    signUpFallbackRedirectUrl: '/',
    afterSignOutUrl: '/',
    ui: { ClerkUI: window.__internal_ClerkUICtor },
  });
  return clerk;
}

export function primaryEmail(user) {
  const fromPrimary = user?.primaryEmailAddress?.emailAddress;
  if (fromPrimary) return fromPrimary.toLowerCase();
  const match = (user?.emailAddresses || []).find((entry) => entry.id === user.primaryEmailAddressId);
  return (match?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || '').toLowerCase();
}
