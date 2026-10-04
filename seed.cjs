const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI not set");
  process.exit(1);
}

const postSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    excerpt: { type: String, required: true, trim: true, maxlength: 500 },
    content: { type: String, required: true },
    project: { type: String, required: true, trim: true, index: true },
    tags: { type: [String], default: [], index: true },
    coverImage: { type: String },
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
    publishedAt: { type: Date },
    authorId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

const posts = [
  {
    slug: "nightwave-finally-plays-audio",
    title: "Nightwave Finally Plays Audio",
    excerpt: "After three weeks of debugging I2S timers and fighting with DMA buffers, the ESP32 finally produced sound.",
    content: `After three weeks of debugging, the ESP32 finally produced sound. This is the story of what went wrong and how I fixed it.

## What happened

Nightwave is a standalone music player built around an ESP32. The goal was simple: load an SD card, decode MP3, output audio through I2S. Nothing exotic. Except it didn't work.

## What broke

The I2S DMA buffer was configured for 2048 samples, but the decoder was outputting 1152 samples per frame. Every buffer underrun produced a click.

## The fix

I switched to a double-buffering scheme with a ring buffer of 8 slots. The decoder writes into one slot while the I2S DMA reads from another.

## What I learned

Hardware debugging is 90% reading datasheets and 10% actually changing code.`,
    project: "Nightwave",
    tags: ["hardware", "esp32", "audio"],
    status: "published",
    publishedAt: new Date("2026-10-04"),
    authorId: "seed-author",
    featured: true,
  },
  {
    slug: "why-i-rebuilt-level-up",
    title: "Why I Rebuilt Level Up",
    excerpt: "Level Up started as a simple habit tracker. Six months later it was a mess of features that didn't work together.",
    content: `Level Up started as a simple habit tracker. Six months later it was a mess of features that didn't work together. So I started over.

## The problem

The original codebase had no clear data model. Habits, quests, and achievements were all stored in different ways.

## The rebuild

I started with a clean schema: users have habits, habits have completions, completions grant XP, XP levels up. That's it.

## What I learned

Delete code fearlessly. The first version taught me what to build. The second version is what I actually wanted.`,
    project: "Level Up",
    tags: ["software", "web"],
    status: "published",
    publishedAt: new Date("2026-09-28"),
    authorId: "seed-author",
  },
  {
    slug: "iron-marios-movement-problem",
    title: "Iron Mario's Movement Problem",
    excerpt: "The movement felt floaty and unresponsive. It took me two weeks to figure out it was a fixed timestep issue.",
    content: `The movement felt floaty and unresponsive. It took me two weeks to figure out it was a fixed timestep issue.

## The problem

Mario would move at different speeds depending on the frame rate. At 60 FPS he was fine, at 30 FPS he moved half speed.

## The fix

I implemented a fixed timestep accumulator. Physics updates at exactly 60Hz regardless of render frame rate.

## What I learned

Decouple physics from rendering. Always.`,
    project: "Iron Mario",
    tags: ["game-dev", "unity"],
    status: "published",
    publishedAt: new Date("2026-09-21"),
    authorId: "seed-author",
  },
  {
    slug: "clock-out-alive-prototype",
    title: "Clock Out Alive Prototype",
    excerpt: "A horror game where you work the night shift at a haunted office. The prototype is coming together.",
    content: `A horror game where you work the night shift at a haunted office. The prototype is coming together.

## The concept

You're a night security guard. The building is empty. Except it isn't.

## What works

The lighting system. Dynamic shadows that react to your flashlight.

## What doesn't

The AI. The ghost walks through walls. I need to add pathfinding.`,
    project: "Clock Out Alive",
    tags: ["game-dev", "horror"],
    status: "published",
    publishedAt: new Date("2026-09-14"),
    authorId: "seed-author",
  },
  {
    slug: "infinite-colour-craft-rendering",
    title: "Infinite Colour Craft Rendering",
    excerpt: "Building a procedural art generator that creates infinite color palettes from a single seed.",
    content: `Building a procedural art generator that creates infinite color palettes from a single seed.

## The concept

Enter a seed, get a unique color palette. Same seed, same palette. Different seed, different palette.

## The approach

I'm using a seeded random number generator with HSL color space. The seed determines hue rotation, saturation range, and lightness curve.

## What's next

Exporting to CSS variables and Adobe ASE format.`,
    project: "Infinite Colour Craft",
    tags: ["web", "art"],
    status: "published",
    publishedAt: new Date("2026-09-07"),
    authorId: "seed-author",
  },
];

async function seed() {
  await mongoose.connect(MONGO_URI);

  for (const post of posts) {
    await Post.findOneAndUpdate({ slug: post.slug }, post, { upsert: true, new: true });
  }

  console.log(`Seeded ${posts.length} posts`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
