
(function () {
  const KEYS = {
    users: 'fashion_users_v2',
    session: 'fashion_current_user_v2',
    items: 'fashion_items_v2',
    outfits: 'fashion_outfits_v2',
    boards: 'fashion_boards_v2',
    follows: 'fashion_follows_v2',
    profiles: 'fashion_profiles_v2',
    audit: 'fashion_audit_v2',
    reports: 'fashion_reports_v2'
  };

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    return value;
  }

  function uid(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function formatDate(value) {
    return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function getIconForCategory(category) {
    return {
      tops: '👕', bottoms: '👖', shoes: '👟', outerwear: '🧥', accessories: '👜'
    }[category] || '👕';
  }

  function defaultUsers() {
    return [
      { id: 'u_admin', username: 'admin', password: 'admin123', role: 'admin', displayName: 'Admin', status: 'active', reports: 0, createdAt: '2026-03-01T09:00:00Z' },
      { id: 'u_creator', username: 'creator', password: 'pass123', role: 'creator', displayName: 'Creator User', status: 'active', reports: 0, createdAt: '2026-03-01T09:05:00Z' },
      { id: 'u_styleking99', username: 'styleking99', password: 'pass123', role: 'creator', displayName: 'Style King', status: 'active', reports: 2, createdAt: '2026-03-01T09:10:00Z' },
      { id: 'u_user_trendy', username: 'user_trendy', password: 'pass123', role: 'creator', displayName: 'Trendy User', status: 'suspended', reports: 5, createdAt: '2026-03-01T09:15:00Z' },
      { id: 'u_jess_fits', username: 'jess_fits', password: 'pass123', role: 'creator', displayName: 'Jessica F.', status: 'active', reports: 0, createdAt: '2026-03-01T09:20:00Z' },
      { id: 'u_nova_drip', username: 'nova_drip', password: 'pass123', role: 'creator', displayName: 'Nova Drip', status: 'active', reports: 1, createdAt: '2026-03-01T09:25:00Z' },
      { id: 'u_closet_queen', username: 'closet_queen', password: 'pass123', role: 'creator', displayName: 'Closet Queen', status: 'active', reports: 0, createdAt: '2026-03-01T09:30:00Z' },
      { id: 'u_fit_check_99', username: 'fit_check_99', password: 'pass123', role: 'creator', displayName: 'Fit Check', status: 'suspended', reports: 8, createdAt: '2026-03-01T09:35:00Z' },
      { id: 'u_minimal_looks', username: 'minimal_looks', password: 'pass123', role: 'creator', displayName: 'Min Looks', status: 'active', reports: 0, createdAt: '2026-03-01T09:40:00Z' },
      { id: 'u_aden', username: 'aden', password: 'pass123', role: 'creator', displayName: 'Aden', status: 'active', reports: 0, createdAt: '2026-03-01T09:45:00Z' },
      { id: 'u_jaeger', username: 'jaeger', password: 'pass123', role: 'creator', displayName: 'Jaeger', status: 'active', reports: 0, createdAt: '2026-03-01T09:50:00Z' },
      { id: 'u_abdur', username: 'abdur', password: 'pass123', role: 'creator', displayName: 'Abdur', status: 'active', reports: 0, createdAt: '2026-03-01T09:55:00Z' },
      { id: 'u_lein', username: 'lein', password: 'pass123', role: 'creator', displayName: 'Lein', status: 'active', reports: 0, createdAt: '2026-03-01T10:00:00Z' }
    ];
  }

  function defaultProfiles() {
    return {
      admin: { username: 'admin', displayName: 'Admin', bio: 'Platform administrator.', email: 'admin@489fashion.app' },
      creator: { username: 'creator', displayName: 'Creator User', bio: 'Building everyday looks from a smart wardrobe.', email: 'creator@example.com' },
      styleking99: { username: 'styleking99', displayName: 'Style King', bio: 'Color theory outfits daily.' },
      user_trendy: { username: 'user_trendy', displayName: 'Trendy User', bio: 'Luxury streetwear and trend reports.' },
      jess_fits: { username: 'jess_fits', displayName: 'Jessica F.', bio: 'Soft casual fits and clean neutrals.' },
      nova_drip: { username: 'nova_drip', displayName: 'Nova Drip', bio: 'Streetwear and oversized silhouettes.' },
      closet_queen: { username: 'closet_queen', displayName: 'Closet Queen', bio: 'Closet planning and capsule boards.' },
      fit_check_99: { username: 'fit_check_99', displayName: 'Fit Check', bio: 'Fast outfit ideas and daily posts.' },
      minimal_looks: { username: 'minimal_looks', displayName: 'Min Looks', bio: 'Minimal fits + layering.' },
      aden: { username: 'aden', displayName: 'Aden', bio: 'Color theory outfits daily.' },
      jaeger: { username: 'jaeger', displayName: 'Jaeger', bio: 'Minimal fits + streetwear.' },
      abdur: { username: 'abdur', displayName: 'Abdur', bio: 'Capsule wardrobe builder.' },
      lein: { username: 'lein', displayName: 'Lein', bio: 'Seasonal mood boards.' }
    };
  }

  function defaultItems() {
    return [
      { id: 'item_white_tee', owner: 'creator', name: 'White Tee', category: 'tops', color: 'white', icon: '👕', tags: ['basic','casual','layering'], notes: 'Relaxed fit staple.', addedAt: '2026-03-01T10:00:00Z' },
      { id: 'item_black_jeans', owner: 'creator', name: 'Black Jeans', category: 'bottoms', color: 'black', icon: '👖', tags: ['denim','night','streetwear'], notes: '', addedAt: '2026-03-02T10:00:00Z' },
      { id: 'item_gray_hoodie', owner: 'creator', name: 'Gray Hoodie', category: 'outerwear', color: 'gray', icon: '🧥', tags: ['cozy','casual'], notes: '', addedAt: '2026-03-03T10:00:00Z' },
      { id: 'item_white_sneakers', owner: 'creator', name: 'White Sneakers', category: 'shoes', color: 'white', icon: '👟', tags: ['clean','daily'], notes: '', addedAt: '2026-03-04T10:00:00Z' },
      { id: 'item_olive_cargos', owner: 'creator', name: 'Olive Cargo Pants', category: 'bottoms', color: 'green', icon: '👖', tags: ['utility','streetwear'], notes: '', addedAt: '2026-03-05T10:00:00Z' },
      { id: 'item_brown_tote', owner: 'creator', name: 'Brown Tote Bag', category: 'accessories', color: 'brown', icon: '👜', tags: ['minimal','campus'], notes: '', addedAt: '2026-03-06T10:00:00Z' },
      { id: 'item_blue_oxford', owner: 'aden', name: 'Blue Oxford Shirt', category: 'tops', color: 'blue', icon: '👕', tags: ['smart','office'], notes: '', addedAt: '2026-03-04T12:00:00Z' },
      { id: 'item_tan_chinos', owner: 'aden', name: 'Tan Chinos', category: 'bottoms', color: 'brown', icon: '👖', tags: ['clean'], notes: '', addedAt: '2026-03-04T12:05:00Z' },
      { id: 'item_loafers', owner: 'aden', name: 'Brown Loafers', category: 'shoes', color: 'brown', icon: '👟', tags: ['dressy'], notes: '', addedAt: '2026-03-04T12:10:00Z' }
    ];
  }

  function defaultOutfits() {
    return [
      { id: 'outfit_creator_1', owner: 'creator', name: 'Casual Friday', occasion: 'Everyday', caption: 'Clean neutrals for an easy day.', items: ['item_white_tee','item_black_jeans','item_white_sneakers'], createdAt: '2026-03-07T10:00:00Z', boardIds: ['board_creator_1'], posted: true, likes: 18 },
      { id: 'outfit_aden_1', owner: 'aden', name: 'Spring Neutrals', occasion: 'Office', caption: 'Cream + olive + denim.', items: ['item_blue_oxford','item_tan_chinos','item_loafers'], createdAt: '2026-03-07T11:00:00Z', boardIds: ['board_aden_1'], posted: true, likes: 24 },
      { id: 'outfit_jaeger_1', owner: 'jaeger', name: 'Monochrome Night', occasion: 'Streetwear', caption: 'Black layers + boots.', items: [], itemIcons: ['🧥','👖','👟'], createdAt: '2026-03-07T11:10:00Z', boardIds: [], posted: true, likes: 12 },
      { id: 'outfit_abdur_1', owner: 'abdur', name: 'Campus Casual', occasion: 'School', caption: 'Hoodie + cargos + sneakers.', items: [], itemIcons: ['🧥','👖','👟'], createdAt: '2026-03-07T11:20:00Z', boardIds: [], posted: true, likes: 16 },
      { id: 'outfit_lein_1', owner: 'lein', name: 'Soft Pastels', occasion: 'Everyday', caption: 'Lavender + white + gray.', items: [], itemIcons: ['👕','👖','👟'], createdAt: '2026-03-07T11:30:00Z', boardIds: [], posted: true, likes: 9 }
    ];
  }

  function defaultBoards() {
    return [
      { id: 'board_creator_1', owner: 'creator', name: 'Weekend Fits', description: 'Saved looks for weekends and coffee runs.', visibility: 'private', outfitIds: ['outfit_creator_1'], createdAt: '2026-03-08T10:00:00Z' },
      { id: 'board_aden_1', owner: 'aden', name: 'Aden Inspo', description: 'Workwear and clean spring layers.', visibility: 'public', outfitIds: ['outfit_aden_1'], createdAt: '2026-03-08T11:00:00Z' },
      { id: 'board_jess_1', owner: 'jess_fits', name: 'Neutral Mornings', description: 'Soft looks for daily wear.', visibility: 'public', outfitIds: [], createdAt: '2026-03-08T12:00:00Z' }
    ];
  }

  function defaultReports() {
    return [
      { id: 'r001', type: 'board', status: 'pending', contentId: 'board_aden_1', contentLabel: 'Board #304', poster: 'styleking99', reason: 'Spam / repeated promotion', caption: 'Designer drops daily', createdAt: '2026-03-04T10:42:00Z' },
      { id: 'r002', type: 'post', status: 'pending', contentId: 'outfit_jaeger_1', contentLabel: 'Post #1082', poster: 'user_trendy', reason: 'Inappropriate caption', caption: 'Too edgy for community rules', createdAt: '2026-03-03T09:15:00Z' },
      { id: 'r003', type: 'post', status: 'pending', contentId: 'outfit_abdur_1', contentLabel: 'Post #1107', poster: 'fit_check_99', reason: 'Hate speech', caption: 'drip or drown', createdAt: '2026-03-03T17:30:00Z' },
      { id: 'r004', type: 'post', status: 'pending', contentId: 'outfit_lein_1', contentLabel: 'Post #1091', poster: 'user_trendy', reason: 'Copyright infringement', caption: 'Brand new fits #luxury', createdAt: '2026-03-02T11:20:00Z' }
    ];
  }

  function defaultAudit() {
    return [
      { id: uid('audit'), adminId: 'admin', action: 'Content Hidden', target: 'Board #304', timestamp: '2026-03-03T11:20:00Z' },
      { id: uid('audit'), adminId: 'admin', action: 'User Reactivated', target: '@jess_fits', timestamp: '2026-03-03T14:05:00Z' },
      { id: uid('audit'), adminId: 'admin', action: 'User Warned', target: '@styleking99', timestamp: '2026-03-03T17:30:00Z' },
      { id: uid('audit'), adminId: 'admin', action: 'User Suspended', target: '@user_trendy', timestamp: '2026-03-04T09:15:00Z' },
      { id: uid('audit'), adminId: 'admin', action: 'Content Removed', target: 'Post #1082', timestamp: '2026-03-04T10:42:00Z' }
    ];
  }

  function ensureSeeded() {
    if (!localStorage.getItem(KEYS.users)) write(KEYS.users, defaultUsers());
    if (!localStorage.getItem(KEYS.profiles)) write(KEYS.profiles, defaultProfiles());
    if (!localStorage.getItem(KEYS.items)) write(KEYS.items, defaultItems());
    if (!localStorage.getItem(KEYS.outfits)) write(KEYS.outfits, defaultOutfits());
    if (!localStorage.getItem(KEYS.boards)) write(KEYS.boards, defaultBoards());
    if (!localStorage.getItem(KEYS.reports)) write(KEYS.reports, defaultReports());
    if (!localStorage.getItem(KEYS.audit)) write(KEYS.audit, defaultAudit());
    if (!localStorage.getItem(KEYS.follows)) write(KEYS.follows, {});
  }

  function getUsers() { ensureSeeded(); return read(KEYS.users, []); }
  function saveUsers(users) { return write(KEYS.users, users); }
  function getSession() { ensureSeeded(); return read(KEYS.session, null); }
  function setSession(user) { return write(KEYS.session, user ? { username: user.username, role: user.role, displayName: user.displayName || user.username, status: user.status || 'active' } : null); }
  function clearSession() { localStorage.removeItem(KEYS.session); }
  function findUser(username) { return getUsers().find(u => u.username.toLowerCase() === String(username || '').toLowerCase()) || null; }
  function registerUser(data) {
    const users = getUsers();
    users.push({ id: uid('user'), status: 'active', reports: 0, createdAt: new Date().toISOString(), ...data });
    saveUsers(users);
    const profiles = getProfiles();
    profiles[data.username] = { username: data.username, displayName: data.displayName || data.username, bio: '', email: `${data.username}@example.com` };
    saveProfiles(profiles);
  }

  function updateUser(username, patch) {
    const users = getUsers().map(u => u.username === username ? { ...u, ...patch } : u);
    saveUsers(users);
    const current = getSession();
    if (current && current.username === username) setSession({ ...current, ...patch });
  }

  function getItems() { ensureSeeded(); return read(KEYS.items, []); }
  function saveItems(items) { return write(KEYS.items, items); }
  function getUserItems(username) { return getItems().filter(item => item.owner === username); }
  function getItem(id) { return getItems().find(item => item.id === id) || null; }
  function upsertItem(item) {
    const items = getItems();
    const idx = items.findIndex(x => x.id === item.id);
    if (idx >= 0) items[idx] = item; else items.push(item);
    saveItems(items);
    return item;
  }
  function deleteItem(id) {
    saveItems(getItems().filter(item => item.id !== id));
    const outfits = getOutfits().map(outfit => ({ ...outfit, items: (outfit.items || []).filter(itemId => itemId !== id) }));
    saveOutfits(outfits);
  }

  function getOutfits() { ensureSeeded(); return read(KEYS.outfits, []); }
  function saveOutfits(outfits) { return write(KEYS.outfits, outfits); }
  function getUserOutfits(username) { return getOutfits().filter(o => o.owner === username); }
  function getOutfit(id) { return getOutfits().find(o => o.id === id) || null; }
  function upsertOutfit(outfit) {
    const outfits = getOutfits();
    const idx = outfits.findIndex(x => x.id === outfit.id);
    if (idx >= 0) outfits[idx] = outfit; else outfits.push(outfit);
    saveOutfits(outfits);
    return outfit;
  }

  function getBoards() { ensureSeeded(); return read(KEYS.boards, []); }
  function saveBoards(boards) { return write(KEYS.boards, boards); }
  function getBoard(id) { return getBoards().find(b => b.id === id) || null; }
  function getUserBoards(username) { return getBoards().filter(b => b.owner === username); }
  function getPublicBoards() { return getBoards().filter(b => b.visibility === 'public'); }
  function upsertBoard(board) {
    const boards = getBoards();
    const idx = boards.findIndex(x => x.id === board.id);
    if (idx >= 0) boards[idx] = board; else boards.push(board);
    saveBoards(boards);
    return board;
  }

  function getProfiles() { ensureSeeded(); return read(KEYS.profiles, {}); }
  function saveProfiles(profiles) { return write(KEYS.profiles, profiles); }
  function getProfile(username) { return getProfiles()[username] || { username, displayName: username, bio: '' }; }
  function updateProfile(username, patch) {
    const profiles = getProfiles();
    profiles[username] = { ...getProfile(username), ...patch };
    saveProfiles(profiles);
  }

  function getFollows() { ensureSeeded(); return read(KEYS.follows, {}); }
  function saveFollows(value) { return write(KEYS.follows, value); }
  function getUserFollows(username) { return getFollows()[username] || []; }
  function toggleFollow(follower, target) {
    const map = getFollows();
    const current = new Set(map[follower] || []);
    if (current.has(target)) current.delete(target); else current.add(target);
    map[follower] = [...current];
    saveFollows(map);
    return map[follower];
  }
  function getFollowerCount(target) {
    return Object.values(getFollows()).filter(list => Array.isArray(list) && list.includes(target)).length;
  }

  function getReports() { ensureSeeded(); return read(KEYS.reports, []); }
  function saveReports(reports) { return write(KEYS.reports, reports); }
  function updateReport(id, patch) {
    const reports = getReports().map(r => r.id === id ? { ...r, ...patch } : r);
    saveReports(reports);
  }

  function getAuditLog() { ensureSeeded(); return read(KEYS.audit, []).sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp)); }
  function addAudit(action, target, adminId='admin') {
    const audit = getAuditLog();
    audit.unshift({ id: uid('audit'), adminId, action, target, timestamp: new Date().toISOString() });
    write(KEYS.audit, audit.slice(0, 50));
  }

  function getOutfitIcons(outfit) {
    if (outfit.itemIcons && outfit.itemIcons.length) return outfit.itemIcons;
    return (outfit.items || []).map(id => getItem(id)).filter(Boolean).map(item => item.icon || getIconForCategory(item.category));
  }

  function getFeedPosts() {
    const removed = new Set(getReports().filter(r => r.status === 'removed').map(r => r.contentId));
    return getOutfits().filter(o => o.posted && !removed.has(o.id)).map(o => ({
      id: o.id,
      title: o.name,
      creator: o.owner,
      caption: o.caption || '',
      tags: [o.occasion || 'Everyday'],
      likes: o.likes || 0,
      createdAt: o.createdAt,
      items: getOutfitIcons(o)
    })).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  }

  function boardOutfits(board) {
    return (board.outfitIds || []).map(id => getOutfit(id)).filter(Boolean);
  }

  ensureSeeded();
  window.FashionApp = {
    KEYS, uid, formatDate, getIconForCategory,
    getUsers, saveUsers, findUser, registerUser, updateUser,
    getSession, setSession, clearSession,
    getItems, saveItems, getUserItems, getItem, upsertItem, deleteItem,
    getOutfits, saveOutfits, getUserOutfits, getOutfit, upsertOutfit, getOutfitIcons,
    getBoards, saveBoards, getBoard, getUserBoards, getPublicBoards, upsertBoard, boardOutfits,
    getProfiles, getProfile, updateProfile,
    getFollows, getUserFollows, toggleFollow, getFollowerCount,
    getReports, updateReport, getAuditLog, addAudit,
    getFeedPosts
  };
})();
