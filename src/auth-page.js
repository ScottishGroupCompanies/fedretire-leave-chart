import { SIGN_IN_URL, SIGN_UP_URL, startClerk } from './clerk-client.js';

const page = document.body.dataset.clerkPage;
const root = document.getElementById('clerk-mount');

function showMessage(text) {
  if (!root) return;
  root.innerHTML = `<p class="auth-message">${text}</p>`;
}

async function main() {
  let clerk = null;
  try {
    clerk = await startClerk();
  } catch (error) {
    console.error(error);
    showMessage('Sign-in could not be loaded. Refresh the page and try again.');
    return;
  }
  if (!clerk) {
    showMessage(page === 'sign-up' ? 'Sign-up is not configured yet.' : 'Sign-in is not configured yet.');
    return;
  }
  if (clerk.isSignedIn) {
    location.replace('/');
    return;
  }
  if (!root) return;
  root.innerHTML = '';
  if (page === 'sign-up') {
    clerk.mountSignUp(root, {
      signInUrl: SIGN_IN_URL,
      fallbackRedirectUrl: '/',
    });
    return;
  }
  clerk.mountSignIn(root, {
    signUpUrl: SIGN_UP_URL,
    fallbackRedirectUrl: '/',
    withSignUp: false,
  });
}

main();
