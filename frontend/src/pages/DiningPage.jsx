import menuData from "../../../scraper/dining_data.json";
import { diningLocations } from "../data/diningLocations";
import { useParams } from "react-router-dom";

const DiningPage = () => {
  const { name } = useParams();
  const loc = diningLocations.find(u => u.id === name);

  const hallMenu = menuData?.[name];
  if (!hallMenu) {
    return <div><h1>Data unavailable for "{name}"</h1></div>;
  }

  let mealMenus = {
    "All Day": hallMenu?.["allday"],
    "Breakfast": hallMenu?.["breakfast"],
    "Lunch": hallMenu?.["lunch"],
    "Dinner": hallMenu?.["dinner"],
    "Extended Dinner": hallMenu?.["extended dinner"],
  }
  for (const key in mealMenus) {
    if (!mealMenus[key]) {
      delete mealMenus[key];
    }
    if (Object.keys(mealMenus).length === 0) {
      return <div><h1>Menus unavailable for "{name}"</h1></div>;
    }
  }

  return (
    <>
      <div>
        <h1>{loc.name}</h1>

        {Object.entries(mealMenus).map(([mealName, mealData]) => (
          <div key={mealName}>
            <h2>{mealName}</h2>

            {/* <h3>Hours: {mealData.hours}</h3> */}

            {Object.entries(mealData)
              .filter(([key]) => key !== "hours")
              .map(([category, items]) => (
                <div key={category}>
                  <h4>{category}</h4>

                  {items.map((item, index) => (
                    <div key={index}>{item}</div>
                  ))}
                </div>
              ))}
          </div>
        ))}
      </div>
    </>
  )
}

export default DiningPage
