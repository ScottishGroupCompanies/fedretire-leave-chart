import { primaryEmail, startClerk } from './clerk-client.js';

function showUserButton(clerk) {
  const controls = document.getElementById('auth-controls');
  if (!controls) return;
  controls.innerHTML = '<div id="user-button"></div>';
  const node = document.getElementById('user-button');
  if (node) clerk.mountUserButton(node);
}

async function main() {
  let clerk = null;
  try {
    clerk = await startClerk();
  } catch (error) {
    console.error(error);
    return;
  }
  if (!clerk) return;

  window.fedretireGetToken = async () => {
    if (!clerk.session) return '';
    return (await clerk.session.getToken()) || '';
  };
  window.fedretireUserId = clerk.user?.id || '';
  window.fedretireEmail = primaryEmail(clerk.user);

  if (clerk.isSignedIn) {
    document.body.classList.add('signed-in');
    showUserButton(clerk);
    if (window.fedretireBoot) await window.fedretireBoot();
  }

  clerk.addListener(({ user }) => {
    const signedIn = !!user;
    const showing = document.body.classList.contains('signed-in');
    if (signedIn === showing) return;
    if (!signedIn && clerk.isSignedIn) return;
    location.reload();
  });
}

main();
