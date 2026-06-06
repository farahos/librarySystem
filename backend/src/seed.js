import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { connectDb } from "./config/db.js";
import Chapter from "./models/Chapter.js";
import Comment from "./models/Comment.js";
import Genre from "./models/Genre.js";
import Story from "./models/Story.js";
import User from "./models/User.js";
import { slugify } from "./utils/slug.js";

const genres = [
  "Romance",
  "Horror",
  "History",
  "Drama",
  "Mystery",
  "Fantasy",
  "Action",
  "Comedy",
  "Islamic",
  "Poetry",
  "Short Stories",
];

async function seed() {
  await connectDb();

  const adminEmail = process.env.ADMIN_EMAIL || "admin@madal.so";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin12345";
  const adminName = process.env.ADMIN_NAME || "madal_admin";

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const admin = await User.findOneAndUpdate(
    { email: adminEmail },
    {
      username: adminName,
      email: adminEmail,
      passwordHash,
      displayName: "Madal Admin",
      roles: ["user", "admin", "owner"],
      emailVerified: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  await User.updateMany({ _id: { $ne: admin._id }, roles: "owner" }, { $pull: { roles: "owner" } });

  for (const [index, name] of genres.entries()) {
    await Genre.findOneAndUpdate(
      { slug: slugify(name) },
      { name, slug: slugify(name), sortOrder: index + 1, active: true },
      { upsert: true, new: true }
    );
  }

  const writer = await User.findOneAndUpdate(
    { email: "writer@madal.so" },
    {
      username: "sheeko_qore",
      email: "writer@madal.so",
      passwordHash,
      displayName: "Sheeko Qore",
      roles: ["user", "verified_author"],
      verification: { status: "approved", verifiedAt: new Date() },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const samples = [
    {
      title: "Habeenkii Hargeysa",
      category: "romance",
      description: "Sheeko jacayl ah oo ka bilaabata roob habeenkii ka da'aya Hargeysa.",
      metrics: { views: 30200, reads: 24800, likes: 1200, bookmarks: 420 },
    },
    {
      title: "Qalcaddii Qarsoonayd",
      category: "mystery",
      description: "Wiil dhalinyaro ah ayaa raadiya sir ku duugan qalcad qadiimi ah.",
      metrics: { views: 18400, reads: 12600, likes: 740, bookmarks: 260 },
    },
    {
      title: "Codkii Badda",
      category: "poetry",
      description: "Tix iyo tiraab isku dhafan oo ka hadlaysa badda, hoyga, iyo xusuusta.",
      metrics: { views: 1200000, reads: 830000, likes: 42000, bookmarks: 9100 },
    },
  ];

  for (const sample of samples) {
    const story = await Story.findOneAndUpdate(
      { slug: slugify(sample.title) },
      {
        ...sample,
        slug: slugify(sample.title),
        authorId: writer._id,
        visibility: "public",
        status: "ongoing",
        coverUrl: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=900&q=80",
        tags: [sample.category],
        metrics: sample.metrics,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const chapter = await Chapter.findOneAndUpdate(
      { storyId: story._id, chapterNumber: 1 },
      {
        storyId: story._id,
        chapterNumber: 1,
        title: "Bilowga",
        content: `${sample.description}\n\nTani waa cutub tijaabo ah oo loogu talagalay Madal MVP.`,
        status: "published",
        publishDate: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await Comment.findOneAndUpdate(
      { storyId: story._id, chapterId: chapter._id, authorId: admin._id },
      {
        storyId: story._id,
        chapterId: chapter._id,
        authorId: admin._id,
        content: "Sheekadan si fiican ayay u bilaabatay.",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  console.log(`Seed complete. Admin: ${adminEmail} / ${adminPassword}`);
  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
