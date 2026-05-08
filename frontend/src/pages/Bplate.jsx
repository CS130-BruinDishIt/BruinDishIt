import menuData from "../data.json";

function Bplate() {
  const breakfast = menuData?.["bruin-plate"]?.breakfast;

  if (!breakfast) {
    return <h1>Loading or missing data...</h1>;
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

export default Bplate
