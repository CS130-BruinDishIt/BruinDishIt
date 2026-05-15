const MenuItem = require('../models/MenuItem');
const Menu = require('../models/Menu');

// Factory Method for Station creation (conceptual, organizing items by station)
class StationFactory {
    static organizeByStation(menuData) {
        // menuData example: { "Harvest": ["Scrambled Eggs", ...], "Fruit": [...] }
        const stations = {};
        for (const [stationName, items] of Object.entries(menuData)) {
            // We can treat stationName as a tag or category
            // Factory could instantiate specific station objects if needed, 
            // but here we just process tags/stations to organize items.
            stations[stationName] = items; 
        }
        return stations;
    }
}

// Template Method + Strategy Base Class
class LocationMenuProcessor {
    constructor(locationName) {
        this.locationName = locationName;
    }

    // Template method
    async processMenu(mealPeriod, menuData) {
        const stations = StationFactory.organizeByStation(menuData);
        const resolvedItems = [];

        for (const [stationName, items] of Object.entries(stations)) {
            for (const itemName of items) {
                const menuItem = await this.resolveMenuItem(itemName, stationName);
                resolvedItems.push(menuItem);
            }
        }

        return await this.finalizeMenu(mealPeriod, resolvedItems);
    }

    async resolveMenuItem(itemName, stationName) {
        // Check existing database for this dining hall and item
        let menuItem = await MenuItem.findOne({
            name: itemName,
            location: this.locationName
        });

        if (!menuItem) {
            // No = create new page with that item's name as title
            menuItem = new MenuItem({
                name: itemName,
                location: this.locationName,
                station: stationName
            });
            await menuItem.save();
        }
        return menuItem;
    }

    // Hook to be overridden by strategies
    async finalizeMenu(mealPeriod, resolvedItems) {
        throw new Error("Method 'finalizeMenu()' must be implemented.");
    }
}

// Strategy for Dining Halls (Rotating Menus)
class DiningHallProcessor extends LocationMenuProcessor {
    async finalizeMenu(mealPeriod, resolvedItems) {
        // Once all menu items' pages are pulled in, 
        // it should only show listing of pages that are associated with today, during this meal period
        
        // We can create a new Menu record or update an existing one for today + mealPeriod
        const today = new Date().setHours(0, 0, 0, 0);

        // Replace or create a new menu document representing today's meal period
        let menu = await Menu.findOneAndUpdate(
            { location: this.locationName, mealPeriod: mealPeriod, date: today },
            { items: resolvedItems.map(item => item._id) },
            { upsert: true, new: true }
        ).populate('items');

        return menu;
    }
}

// Strategy for Takeout Locations (Fixed Menus)
class TakeoutProcessor extends LocationMenuProcessor {
    async finalizeMenu(mealPeriod, resolvedItems) {
        // Once all menu items' pages are pulled in, it should only show listing of these menu items' pages
        // We don't necessarily filter by today/meal period since it's mostly fixed.
        // We'll just update the general menu for this takeout location.
        
        let menu = await Menu.findOneAndUpdate(
            { location: this.locationName, isTakeout: true },
            { items: resolvedItems.map(item => item._id) },
            { upsert: true, new: true }
        ).populate('items');

        return menu;
    }
}

class MenuProcessorContext {
    constructor(locationName, type) {
        if (type === 'dining_hall') {
            this.processor = new DiningHallProcessor(locationName);
        } else if (type === 'takeout') {
            this.processor = new TakeoutProcessor(locationName);
        } else {
            throw new Error("Invalid location type");
        }
    }

    async execute(mealPeriod, menuData) {
        return await this.processor.processMenu(mealPeriod, menuData);
    }
}

module.exports = {
    MenuProcessorContext,
    StationFactory,
    LocationMenuProcessor,
    DiningHallProcessor,
    TakeoutProcessor
};
