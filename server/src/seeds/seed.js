/**
 * Seed Script - Populates database with demo data including photos
 * Run: node src/seeds/seed.js
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../../.env") });

import User from "../models/User.js";
import SeedListing from "../models/SeedListing.js";

// Connect to MongoDB
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/seedcycle");
        console.log("✅ Connected to MongoDB");
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1);
    }
}

// Sample users with varying points and badges
const sampleUsers = [
    {
        name: "Green Thumb Gardens",
        email: "greenthumb@seedcycle.demo",
        password: "demo123",
        phone: "919876543210",
        bio: "Organic seed supplier since 2018. Specializing in heirloom vegetables.",
        points: 2500,
        exchangesCompleted: 45,
        accountType: "company",
        companyDetails: {
            gstNumber: "27AAACC1206D1ZM",
            companyName: "Green Thumb Gardens Pvt Ltd",
            verificationStatus: "verified",
            verifiedAt: new Date()
        },
        badges: [
            { key: "verified_company", label: "Verified Company", earnedAt: new Date() },
            { key: "top_contributor", label: "Top Contributor", earnedAt: new Date() },
            { key: "seed_master", label: "Seed Master", earnedAt: new Date() },
            { key: "community_hero", label: "Community Hero", earnedAt: new Date() }
        ],
        homeLocation: { type: "Point", coordinates: [75.1240, 15.3647] }
    },
    {
        name: "Urban Farmer Priya",
        email: "priya@seedcycle.demo",
        password: "demo123",
        phone: "919988776655",
        bio: "Balcony gardener | Growing herbs and microgreens in the city 🌱",
        points: 850,
        exchangesCompleted: 12,
        accountType: "individual",
        badges: [
            { key: "first_listing", label: "First Listing", earnedAt: new Date() },
            { key: "helpful_neighbor", label: "Helpful Neighbor", earnedAt: new Date() }
        ],
        homeLocation: { type: "Point", coordinates: [75.1420, 15.3847] }
    },
    {
        name: "Organic Oasis Farm",
        email: "oasis@seedcycle.demo",
        password: "demo123",
        phone: "918877665544",
        bio: "100% organic farm in Karnataka. We grow, we share, we care.",
        points: 1800,
        exchangesCompleted: 32,
        accountType: "company",
        companyDetails: {
            gstNumber: "29BBBCC2307E2ZN",
            companyName: "Organic Oasis Farm LLP",
            verificationStatus: "verified",
            verifiedAt: new Date()
        },
        badges: [
            { key: "verified_company", label: "Verified Company", earnedAt: new Date() },
            { key: "eco_warrior", label: "Eco Warrior", earnedAt: new Date() },
            { key: "trusted_seller", label: "Trusted Seller", earnedAt: new Date() }
        ],
        homeLocation: { type: "Point", coordinates: [75.0540, 15.4047] }
    },
    {
        name: "Rajesh Kumar",
        email: "rajesh@seedcycle.demo",
        password: "demo123",
        phone: "917766554433",
        bio: "Retired teacher turned passionate gardener. Love sharing seeds!",
        points: 420,
        exchangesCompleted: 8,
        accountType: "individual",
        badges: [
            { key: "first_listing", label: "First Listing", earnedAt: new Date() }
        ],
        homeLocation: { type: "Point", coordinates: [75.2140, 15.3247] }
    },
    {
        name: "Bloom & Blossom Nursery",
        email: "bloom@seedcycle.demo",
        password: "demo123",
        phone: "916655443322",
        bio: "Premium flowering plants and ornamental seeds. Beautify your garden!",
        points: 3200,
        exchangesCompleted: 58,
        accountType: "company",
        companyDetails: {
            gstNumber: "27CCCDD3408F3ZP",
            companyName: "Bloom & Blossom Nursery",
            verificationStatus: "verified",
            verifiedAt: new Date()
        },
        badges: [
            { key: "verified_company", label: "Verified Company", earnedAt: new Date() },
            { key: "top_contributor", label: "Top Contributor", earnedAt: new Date() },
            { key: "flower_specialist", label: "Flower Specialist", earnedAt: new Date() },
            { key: "premium_seller", label: "Premium Seller", earnedAt: new Date() },
            { key: "community_hero", label: "Community Hero", earnedAt: new Date() }
        ],
        homeLocation: { type: "Point", coordinates: [75.0840, 15.3947] }
    },
    {
        name: "Meera Sharma",
        email: "meera@seedcycle.demo",
        password: "demo123",
        phone: "915544332211",
        bio: "Kitchen garden enthusiast. Growing tomatoes is my superpower 🍅",
        points: 290,
        exchangesCompleted: 5,
        accountType: "individual",
        badges: [],
        homeLocation: { type: "Point", coordinates: [75.1640, 15.3547] }
    },
    {
        name: "Heritage Seeds Co.",
        email: "heritage@seedcycle.demo",
        password: "demo123",
        phone: "914433221100",
        bio: "Preserving traditional Indian seed varieties. Desi seeds for desi gardens.",
        points: 1450,
        exchangesCompleted: 25,
        accountType: "company",
        companyDetails: {
            gstNumber: "29DDDEE4509G4ZQ",
            companyName: "Heritage Seeds Company",
            verificationStatus: "verified",
            verifiedAt: new Date()
        },
        badges: [
            { key: "verified_company", label: "Verified Company", earnedAt: new Date() },
            { key: "heritage_keeper", label: "Heritage Keeper", earnedAt: new Date() },
            { key: "trusted_seller", label: "Trusted Seller", earnedAt: new Date() }
        ],
        homeLocation: { type: "Point", coordinates: [75.2040, 15.4147] }
    },
    {
        name: "Arjun Patil",
        email: "arjun@seedcycle.demo",
        password: "demo123",
        phone: "913322110099",
        bio: "New to gardening but learning fast! Looking for beginner-friendly seeds.",
        points: 75,
        exchangesCompleted: 2,
        accountType: "individual",
        badges: [
            { key: "newcomer", label: "Newcomer", earnedAt: new Date() }
        ],
        homeLocation: { type: "Point", coordinates: [75.1340, 15.3747] }
    }
];

// Sample listings with photos
const sampleListings = [
    // Green Thumb Gardens listings (3)
    { title: "Premium Tomato Seeds (Roma)", type: "Vegetable Seeds", quantity: 100, price: 150, description: "High-yield Roma tomatoes. Perfect for sauces and salads. Germination rate 95%.", currency: "INR", photoUrl: "/uploads/seeds/tomato_seeds_1767775940978.png" },
    { title: "Organic Spinach Seeds", type: "Vegetable Seeds", quantity: 200, price: 80, description: "Fast-growing spinach variety. Ready to harvest in 40 days.", currency: "INR", photoUrl: "/uploads/seeds/spinach_seeds_1767775957826.png" },
    { title: "Heirloom Carrot Mix", type: "Vegetable Seeds", quantity: 150, price: 120, description: "Mix of purple, orange, and yellow carrots. Beautiful and nutritious!", currency: "INR", photoUrl: "/uploads/seeds/carrot_seeds_1767775974322.png" },

    // Urban Farmer Priya listings (2)
    { title: "Fresh Basil Seedlings", type: "Herb Seedlings", quantity: 20, price: 50, description: "Homegrown basil seedlings, 4 weeks old. Ready for transplant.", currency: "INR", photoUrl: "/uploads/seeds/basil_seedlings_1767775993380.png" },
    { title: "Microgreen Seeds Starter Pack", type: "Microgreen Seeds", quantity: 50, price: 200, description: "5 varieties: sunflower, radish, pea, broccoli, mustard.", currency: "INR", photoUrl: "/uploads/seeds/microgreen_seeds_1767776011800.png" },

    // Organic Oasis Farm listings (3)
    { title: "Organic Brinjal Seeds", type: "Vegetable Seeds", quantity: 80, price: 90, description: "Purple long brinjal variety. Pest-resistant and high-yielding.", currency: "INR", photoUrl: "/uploads/seeds/brinjal_seeds_1767776112767.png" },
    { title: "Drumstick Tree Saplings", type: "Tree Saplings", quantity: 15, price: 250, description: "6-month old Moringa saplings. Superfood tree!", currency: "INR", photoUrl: "/uploads/seeds/moringa_sapling_1767776131716.png" },
    { title: "Native Curry Leaf Plant", type: "Herb Plants", quantity: 10, price: 180, description: "Established curry leaf plants. Essential for South Indian cooking.", currency: "INR", photoUrl: "/uploads/seeds/curry_leaf_plant_1767776150244.png" },

    // Rajesh Kumar listings (2)
    { title: "Marigold Seeds (Orange)", type: "Flower Seeds", quantity: 100, price: 40, description: "Bright orange marigolds. Great for borders and pest control.", currency: "INR", photoUrl: "/uploads/seeds/marigold_seeds_1767776166655.png" },
    { title: "Coriander Seeds for Planting", type: "Herb Seeds", quantity: 200, price: 35, description: "Fresh coriander seeds from my garden. Very aromatic variety.", currency: "INR", photoUrl: "/uploads/seeds/coriander_seeds_1767776186116.png" },

    // Bloom & Blossom Nursery listings (4)
    { title: "Rose Plant Collection", type: "Flowering Plants", quantity: 25, price: 350, description: "Mixed rose varieties - red, pink, yellow, white. Grafted plants.", currency: "INR", photoUrl: "/uploads/seeds/rose_plants_1767776247307.png" },
    { title: "Jasmine Creeper", type: "Flowering Plants", quantity: 30, price: 200, description: "Fragrant jasmine creeper. Perfect for balcony gardens.", currency: "INR", photoUrl: "/uploads/seeds/jasmine_creeper_1767776271397.png" },
    { title: "Hibiscus Variety Pack", type: "Flowering Plants", quantity: 20, price: 280, description: "5 different hibiscus colors. Attracts butterflies!", currency: "INR", photoUrl: "/uploads/seeds/hibiscus_plants_1767776307845.png" },
    { title: "Sunflower Seeds (Giant)", type: "Flower Seeds", quantity: 100, price: 60, description: "Giant sunflower variety. Grows up to 8 feet tall!", currency: "INR", photoUrl: "/uploads/seeds/sunflower_seeds_1767776324366.png" },

    // Meera Sharma listings (1)
    { title: "Cherry Tomato Seeds", type: "Vegetable Seeds", quantity: 50, price: 70, description: "Sweet cherry tomatoes from my kitchen garden. Kids love them!", currency: "INR", photoUrl: "/uploads/seeds/cherry_tomato_1767776344868.png" },

    // Heritage Seeds Co. listings (3)
    { title: "Desi Bhindi Seeds", type: "Vegetable Seeds", quantity: 100, price: 85, description: "Traditional Indian okra variety. Less slimy, more flavor.", currency: "INR", photoUrl: "/uploads/seeds/okra_bhindi_1767776429160.png" },
    { title: "Heritage Bitter Gourd", type: "Vegetable Seeds", quantity: 80, price: 95, description: "Small bitter gourd variety used in authentic Indian recipes.", currency: "INR", photoUrl: "/uploads/seeds/bottle_gourd_1767776451777.png" },
    { title: "Traditional Bottle Gourd", type: "Vegetable Seeds", quantity: 60, price: 75, description: "Lauki/Dudhi seeds. Excellent for summer cultivation.", currency: "INR", photoUrl: "/uploads/seeds/bottle_gourd_1767776451777.png" },

    // Arjun Patil listings (1)
    { title: "Mint Plant Cuttings", type: "Herb Cuttings", quantity: 15, price: 25, description: "Fresh mint cuttings. Easy to grow in water first!", currency: "INR", photoUrl: "/uploads/seeds/mint_cuttings_1767776583496.png" }
];

async function seedDatabase() {
    await connectDB();

    console.log("\n🗑️  Clearing existing data...");
    await User.deleteMany({});
    await SeedListing.deleteMany({});
    console.log("✅ Cleared existing users and listings\n");

    console.log("👥 Creating users...");
    const createdUsers = [];

    for (const userData of sampleUsers) {
        const passwordHash = await bcrypt.hash(userData.password, 12);
        const user = await User.create({
            ...userData,
            passwordHash,
            password: undefined
        });
        createdUsers.push(user);
        console.log(`   ✅ Created: ${user.name} (${user.points} pts, ${user.badges.length} badges)`);
    }

    console.log("\n🌱 Creating listings with photos...");
    let listingIndex = 0;
    const listingsPerUser = [3, 2, 3, 2, 4, 1, 3, 1];

    for (let i = 0; i < createdUsers.length; i++) {
        const user = createdUsers[i];
        const numListings = listingsPerUser[i];

        for (let j = 0; j < numListings && listingIndex < sampleListings.length; j++) {
            const listingData = sampleListings[listingIndex];

            const lng = user.homeLocation.coordinates[0] + (Math.random() - 0.5) * 0.02;
            const lat = user.homeLocation.coordinates[1] + (Math.random() - 0.5) * 0.02;

            const listing = await SeedListing.create({
                ...listingData,
                owner: user._id,
                location: { type: "Point", coordinates: [lng, lat] }
            });

            console.log(`   📷 ${listing.title} - ₹${listing.price}`);
            listingIndex++;
        }
    }

    console.log("\n========================================");
    console.log("✅ SEED DATA WITH PHOTOS CREATED!");
    console.log("========================================");
    console.log(`👥 Users: ${createdUsers.length}`);
    console.log(`🌱 Listings: ${listingIndex}`);
    console.log(`📷 All listings have photos!`);
    console.log("========================================");
    console.log("\n📝 Demo Accounts (password: demo123):");
    console.log("----------------------------------------");
    sampleUsers.forEach(u => {
        const verified = u.accountType === "company" ? " ✓" : "";
        console.log(`   ${u.email}${verified} (${u.points} pts)`);
    });
    console.log("----------------------------------------\n");

    await mongoose.disconnect();
    console.log("✅ Database connection closed");
    process.exit(0);
}

seedDatabase().catch(err => {
    console.error("❌ Seed error:", err);
    process.exit(1);
});
