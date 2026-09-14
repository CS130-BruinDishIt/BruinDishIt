import mongoose from 'mongoose';
import { exec } from 'child_process';
import { promisify } from 'util';
import 'dotenv/config';
import DiningHall from '../models/DiningHall.js';

const execAsync = promisify(exec);

const hallShortNames = {
    "bruin-plate" : "BPlate",
    "spice-kitchen" : "Feast",
    "de-neve-dining" : "De Neve",
    "epicuria-at-covel" : "Epic",
    "sack-lunch-program" : "Sack",
    "bruin-bowl" : "BBowl",
    "bruin-cafe" : "BCafe",
    "cafe-1919" : "1919",
    "epicuria-at-ackerman" : "Epic Ack",
    "meal-swipe-exchange" : "Food Trucks",
    "the-drey" : "Drey",
    "the-study-at-hedrick" : "Study",
    "rendezvous" : "Rende"
}
function slugToName(slug) {
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

await mongoose.connect(process.env.MONGODB_URI);
console.log('Connected to MongoDB');

const { stdout } = await execAsync('python3 scraper/scrape.py');
const scrapedJson = JSON.parse(stdout);

for (const hallSlug of Object.keys(scrapedJson)) {
    await DiningHall.findOneAndUpdate(
        { slug: hallSlug },
        {
            slug: hallSlug,
            name: slugToName(hallSlug),
            shortName: hallShortNames[hallSlug] || slugToName(hallSlug),
        },
        { upsert: true, returnDocument: 'after' }
    );
    console.log(`Upserted: ${hallSlug}`);
}

console.log('Done seeding dining halls.');
await mongoose.disconnect();