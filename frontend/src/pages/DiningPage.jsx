import menuData from "../data/data.json";
import { useParams } from "react-router-dom";

const DiningPage = () => {
  const { name } = useParams();
  const breakfast = menuData?.[name]?.breakfast;

  if (!breakfast) {
    return <div><h1>Data unavailable for "{name}"</h1></div>;
  }

  return (
    <>
      <div>
        <h1>BPlate</h1>
        <h2>Hours: {breakfast.hours}</h2>
        <div>
          {Object.entries(breakfast)
            .filter(([key]) => key !== "hours")
            .map(([category, items], index) => (
              <div key={index}>
                <h3>{category}</h3>

                {items.map((item1, index1) => (
                  <div key={index1}>{item1}</div>
                ))}
              </div>
            ))}
        </div>
      </div>
    </>
  )
}

export default DiningPage
