const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_FILE = path.join(__dirname, '../../data.json');

let store = {
  apps: [],
  reviews: [],
  users: [],
  payments: [],
  events: [],
  eventSubmissions: [],
  launchpadApps: [],
  developerWebsites: [],
  categories: [
    { id: 'games', name: 'Games', emoji: '🎮', gradient: ['#1a1a2e', '#16213e'], appCount: 0 },
    { id: 'productivity', name: 'Productivity', emoji: '⚡', gradient: ['#0f3460', '#533483'], appCount: 0 },
    { id: 'social', name: 'Social', emoji: '💬', gradient: ['#e94560', '#0f3460'], appCount: 0 },
    { id: 'health', name: 'Health & Fitness', emoji: '❤️', gradient: ['#30d158', '#0f3460'], appCount: 0 },
    { id: 'education', name: 'Education', emoji: '📚', gradient: ['#ff9f0a', '#ff453a'], appCount: 0 },
    { id: 'finance', name: 'Finance', emoji: '💰', gradient: ['#30d158', '#1a1a2e'], appCount: 0 },
    { id: 'entertainment', name: 'Entertainment', emoji: '🎬', gradient: ['#ff453a', '#1a1a2e'], appCount: 0 },
    { id: 'photography', name: 'Photo & Video', emoji: '📸', gradient: ['#bf5af2', '#1a1a2e'], appCount: 0 },
  ],
  featured: {
    heroCards: [],
    topFree: [],
    topPaid: [],
    editorsChoice: []
  },
  searchHistory: [], // Array of { query: string, count: number, lastSearched: date }
  settings: {
    storeName: 'Apple App Store',
    supportEmail: 'support.loga@gmail.com',
    twoFactorAuth: false,
    strictIpWhitelist: false
  },
};

const saveStore = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch (error) {
    console.error("Failed to save data.json", error);
  }
};

// Load existing data if available to prevent wiping on restart
if (fs.existsSync(DATA_FILE)) {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    store = JSON.parse(raw);
    console.log(`✅ Loaded ${store.apps?.length} apps from persistent data.json`);
  } catch (e) {
    console.error('Failed to parse data.json, starting fresh', e);
  }
}

// Seed demo apps
const seedApps = () => {
  if (store.apps.length > 0) return;
  const demos = [
    {
      name: 'Loga FM Radio',
      developer: 'Loga Apps',
      category: 'entertainment',
      price: 0,
      shortDescription: 'Listen to live FM radio from everywhere',
      description: 'Loga FM Radio brings you the best live radio stations directly to your device. Enjoy high-quality streaming, zero buffering, and an elegant interface designed for true music lovers.',
      version: '1.0.0',
      minOS: 'Android / iOS',
      ageRating: '4+',
      installCount: 52000,
      averageRating: 4.8,
      reviewCount: 320,
      isFeatured: true,
      tags: ['radio', 'music', 'live'],
      iconUrl: 'https://i.pinimg.com/736x/6a/c4/49/6ac449c901d1fe8466ca8455639febce.jpg',
      screenshotUrls: ['https://picsum.photos/seed/fm1/390/844', 'https://picsum.photos/seed/fm2/390/844'],
      bannerUrl: 'https://picsum.photos/seed/fmbanner/1200/630',
      downloadUrl: 'http://localhost:3001/uploads/loga_fm_radio.apk'
    },
    {
      name: 'Resume Builder',
      developer: 'Loga Apps',
      category: 'productivity',
      price: 0,
      shortDescription: 'Create professional resumes in minutes',
      description: 'Build your professional resume instantly with beautiful templates, AI suggestions, and one-click PDF export. Perfect for landing your next dream job!',
      version: '2.1.0',
      minOS: 'Android / iOS',
      ageRating: '4+',
      installCount: 140000,
      averageRating: 4.9,
      reviewCount: 890,
      isFeatured: true,
      tags: ['resume', 'career', 'productivity'],
      iconUrl: 'http://localhost:3001/uploads/resume_icon.png',
      screenshotUrls: ['https://picsum.photos/seed/res1/390/844', 'https://picsum.photos/seed/res2/390/844'],
      bannerUrl: 'https://picsum.photos/seed/resbanner/1200/630',
      downloadUrl: 'http://localhost:3001/uploads/resume.apk'
    }
  ];

  store.apps = demos.map((app, i) => ({
    ...app,
    id: uuidv4(),
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - i * 3600000).toISOString(),
    status: 'approved',
  }));

  // Add a few pending apps
  store.apps.push({
    id: uuidv4(),
    name: "Crypto Tracker Pro",
    developer: "Finance Apps LLC",
    category: "finance",
    price: 4.99,
    shortDescription: "Track all your crypto assets in one place.",
    description: "The ultimate crypto tracking application with real-time alerts.",
    version: "1.0.0",
    minOS: "iOS 15.0+",
    ageRating: "12+",
    isFeatured: false,
    iconUrl: "https://picsum.photos/seed/crypto/512/512",
    screenshotUrls: ["https://picsum.photos/seed/crypto1/390/844", "https://picsum.photos/seed/crypto2/390/844"],
    tags: ["crypto", "finance", "tracker"],
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  store.apps.push({
    id: uuidv4(),
    name: "Yoga Daily",
    developer: "Wellness Studios",
    category: "health",
    price: 0,
    shortDescription: "Daily yoga routines for beginners.",
    description: "Start your morning right with a 15-minute yoga session.",
    version: "2.1.0",
    minOS: "iOS 14.0+",
    ageRating: "4+",
    isFeatured: false,
    iconUrl: "https://picsum.photos/seed/yoga/512/512",
    screenshotUrls: ["https://picsum.photos/seed/yoga1/390/844"],
    tags: ["yoga", "health", "fitness"],
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // Update category app counts
  store.categories.forEach((cat) => {
    cat.appCount = store.apps.filter((a) => a.category === cat.id).length;
  });

  console.log(`✅ Seeded ${store.apps.length} demo apps`);

  // Removed duplicate payment seeding inside seedApps
  saveStore();
};

if (!store.apps || store.apps.length === 0) {
  seedApps();
}

// Removed dummy payment seeding
store.saveStore = saveStore;
module.exports = store;
