import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchDailyMenu } from "../api/dining";
import { diningLocations } from "../data/diningLocations";

// Map backend meal keys to friendly labels for display.
const MEAL_LABELS = {
  allday: "All Day",
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  "extended dinner": "Extended Dinner",
};

const DiningPage = () => {
  const { name } = useParams();
  const loc = diningLocations.find((u) => u.id === name);

  // Track request lifecycle to handle async loading and error states cleanly.
  const [menuData, setMenuData] = useState(null);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!name) return;

    // Cancel in-flight requests when the route changes to prevent stale updates.
    const controller = new AbortController();
    setStatus("loading");
    setErrorMessage("");

    fetchDailyMenu(name, { signal: controller.signal })
      .then((data) => {
        setMenuData(data);
        setStatus("success");
      })
      .catch((error) => {
        if (error?.name === "AbortError") return;
        setErrorMessage(error?.message || "Menu unavailable.");
        setStatus("error");
      });

    return () => controller.abort();
  }, [name]);

  // Normalize menu data for render without recalculating on every render.
  const meals = useMemo(() => menuData?.meals || [], [menuData]);
  const isLoading = status === "loading" || status === "idle";

  if (isLoading) {
    return (
      <div>
        <h1>Loading menu...</h1>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div>
        <h1>Menus unavailable for "{name}"</h1>
        {errorMessage && <p>{errorMessage}</p>}
      </div>
    );
  }

  if (!meals.length) {
    return (
      <div>
        <h1>Menus unavailable for "{name}"</h1>
      </div>
    );
  }

  return (
    <>
      {/* Page wrapper for the dining hall menu content. */}
      <div>
        {/* Hall title fallback to slug if name lookup fails. */}
        <h1>{loc?.name || name}</h1>

        {/* Render each meal block returned by the API. */}
        {meals.map((meal) => (
          <div key={meal.mealType}>
            {/* Human-friendly meal label with safe fallback. */}
            <h2>{MEAL_LABELS[meal.mealType] || meal.mealType}</h2>

            {/* Render stations and their items for this meal. */}
            {meal.stations.map((station) => (
              <div key={station.stationName}>
                {/* Station header (e.g., "Harvest"). */}
                <h4>{station.stationName}</h4>

                {/* Render each item in the station. */}
                {station.items.map((item) => (
                  <div key={item.id || item.name}>{item.name}</div>
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
