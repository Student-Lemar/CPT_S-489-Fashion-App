
(function () {
  const App = window.FashionApp;
  if (!App) return;
  const session = App.getSession();
  const handle = (new URLSearchParams(window.location.search).get('u') || 'creator').replace(/^@/, '').toLowerCase();
  const profile = App.getProfile(handle);
  const posts = App.getFeedPosts().filter(post => post.creator === handle);
  document.getElementById('name').textContent = profile.displayName || handle;
  document.getElementById('handle').textContent = `@${handle}`;
  document.getElementById('bio').textContent = profile.bio || 'Public creator profile.';
  document.getElementById('avatar').textContent = (profile.displayName || handle).slice(0,1).toUpperCase();
  const postsEl = document.getElementById('posts');
  postsEl.innerHTML = posts.length ? posts.map(post => `<div class="post"><div class="thumb">${post.items.map(icon=>`<span style="font-size:28px">${icon}</span>`).join(' ')}</div><div class="pbody"><div class="ptitle">${post.title}</div><div class="pcap">${post.caption}</div></div></div>`).join('') : '<p>No public posts yet.</p>';
  const followBtn = document.getElementById('followBtn');
  const hint = document.getElementById('hint');
  function refresh() {
    const follows = session ? App.getUserFollows(session.username) : [];
    if (session && session.username === handle) { followBtn.textContent = 'Your Profile'; followBtn.disabled = true; hint.textContent = 'You cannot follow yourself.'; return; }
    followBtn.disabled = false;
    followBtn.textContent = follows.includes(handle) ? 'Following' : 'Follow';
    hint.textContent = `${App.getFollowerCount(handle)} follower${App.getFollowerCount(handle) === 1 ? '' : 's'}`;
  }
  refresh();
  followBtn.onclick = () => {
    if (!session) { window.location.href = `login.html?next=${encodeURIComponent(`creator_profile.html?u=${handle}`)}`; return; }
    App.toggleFollow(session.username, handle);
    refresh();
  };
})();
