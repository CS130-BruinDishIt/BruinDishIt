import MenuItem from "../models/MenuItem.js";
import DailyMenu from "../models/Menu.js";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function updateDailyMenus() {
  try {
    const { stdout } = await execAsync("python3 scraper/scrape.py");
    const scrapedJson = JSON.parse(stdout);

    const todayStr = new Date().toISOString().split('T')[0];

    await MenuItem.updateMany({lastSeen: { $exists: false}}, [{ $set: { lastSeen: "$dateAdded" } }]); // backfill menu items that don't have lastSeen

    await DailyMenu.deleteMany({});  // wipe yesterday's menus
    console.log("Cleared old daily menus.");

    // parse the JSON and build the new menus
    // loop through each Dining Hall (e.g., "bruin-plate")
    for (const [hallSlug, meals] of Object.entries(scrapedJson)) {
      
      // loop through each Meal (e.g., "breakfast", "lunch")
      for (const [mealType, mealData] of Object.entries(meals)) {
        const stationsArray = [];

        // loop through each Station (e.g., "Freshly Bowled", "Harvest")
        for (const [stationName, foodList] of Object.entries(mealData)) {
          
          // skip the "hours" key since it's not a food station
          if (stationName === "hours") continue; 

          const itemIdsForThisStation = [];

          // loop through each Food Item inside the station
          for (const foodName of foodList) {
            
            // find the item, or create it if it's new
            // 'upsert: true' tells MongoDB to create it if it doesn't exist
            // returnDocument: "after" tells it to return the newly created document
            const item = await MenuItem.findOneAndUpdate(
              { name: foodName, hallName: hallSlug }, // Search criteria
              { name: foodName, hallName: hallSlug, lastSeen: new Date() }, // Data to save
              { upsert: true, returnDocument: "after" }             // Options
            );

            // save the ID for our DailyMenu
            itemIdsForThisStation.push(item._id);
          }

          // add this completed station to our array
          stationsArray.push({
            stationName: stationName,
            items: itemIdsForThisStation
          });
        }

        // create the Daily Menu for this Hall + Meal combination
        await DailyMenu.create({
          date: todayStr,
          hallName: hallSlug,
          mealType: mealType,
          stations: stationsArray
        });
        
        console.log(`Successfully created menu for ${hallSlug} - ${mealType}`);
      }
    }
    
    console.log("All menus updated successfully!");

  } catch (error) {
    console.error("Error updating menus:", error);
  }
}

export { updateDailyMenus as runUpdate }; // Export the function for use in app.js