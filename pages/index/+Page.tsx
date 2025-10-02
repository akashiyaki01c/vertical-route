import { useEffect, useState } from "react";
import { Terrain } from "./terrain";
import { Gradient } from "./gradient";
import { Station } from "./station";
import "./index.css";

const roundUpMultiple = (value: number, multiple: number) => {
  return Math.ceil(value / multiple) * multiple;
};

export default function Page() {
  const handleBeforeUnload = () => {
    if (confirm("ページを離れても良いですか？")) {
      return true;
    }
  };
  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [handleBeforeUnload]);

  const [verticalTerrain, setVerticalTerrain] = useState([] as Terrain[]);
  const [xScale, setXScale] = useState(0.5);
  const [yScale, setYScale] = useState(5);
  const [startHeight, setStartHeight] = useState(0);
  const [gradients, setGradients] = useState([
    new Gradient(100, 50),
    new Gradient(300, -50),
    new Gradient(600, 0),
  ] as Gradient[]);
  const [stations, setStations] = useState([] as Station[]);

  const [newGradientDistance, setNewGradientDistance] = useState(0);
  const [newGradientValue, setNewGradientValue] = useState(0);

  const firstDistance = verticalTerrain[0]?.distance - 100;
  const lastDistance =
    verticalTerrain[verticalTerrain.length - 1]?.distance + 100;

  const maxHeight =
    verticalTerrain
      .filter((v) => Number.isFinite(v.z))
      .map((v) => v.z)
      .reduce((max, current) => Math.max(max, current), -Infinity) + 20;
  const minHeight = verticalTerrain
    .filter((v) => Number.isFinite(v.z))
    .map((v) => v.z)
    .reduce((max, current) => Math.min(max, current), Infinity);
  const minHeightPadding = 20;

  console.log(firstDistance, lastDistance, maxHeight, minHeight);

  const components = [];
  {
    // xaxis
    for (let i = firstDistance; i <= lastDistance; i++) {
      if (i % 2000 === 0) {
        for (
          let j = Math.floor(minHeight - minHeightPadding);
          j <= maxHeight;
          j++
        ) {
          if (j % 10 === 0) {
            components.push(
              <text
                y={(maxHeight - minHeight - j) * yScale}
                x={(i - firstDistance) * xScale}
                textAnchor="middle"
                fill="gray"
              >
                {j}
              </text>
            );
          }
        }
      }
      if (i % 500 === 0) {
        components.push(
          <line
            y1={0}
            y2={(maxHeight - minHeight + minHeightPadding) * yScale}
            x1={(i - firstDistance) * xScale}
            x2={(i - firstDistance) * xScale}
            strokeWidth={2}
            stroke="#777"
          />
        );
      }
      if (i % 100 === 0) {
        components.push(
          <line
            y1={0}
            y2={(maxHeight - minHeight + minHeightPadding) * yScale}
            x1={(i - firstDistance) * xScale}
            x2={(i - firstDistance) * xScale}
            strokeWidth={0.5}
            stroke="#000"
          />
        );
        components.push(
          <text x={(i - firstDistance) * xScale} y={20} textAnchor="middle">
            {i}
          </text>
        );
        components.push(
          <text
            x={(i - firstDistance) * xScale}
            y={(maxHeight + minHeightPadding - 5) * yScale}
            textAnchor="middle"
          >
            {i}
          </text>
        );
      }
      if (i % 20 === 0) {
        components.push(
          <line
            y1={0}
            y2={(maxHeight - minHeight + minHeightPadding) * yScale}
            x1={(i - firstDistance) * xScale}
            x2={(i - firstDistance) * xScale}
            strokeWidth={0.5}
            stroke="#000"
            strokeDasharray="2 2"
          />
        );
      }
    }
  }
  {
    // y axis
    for (
      let i = Math.floor(minHeight - minHeightPadding);
      i <= maxHeight;
      i++
    ) {
      if (i % 10 === 0) {
        components.push(
          <line
            y1={(maxHeight - minHeight - i) * yScale}
            y2={(maxHeight - minHeight - i) * yScale}
            x1={0}
            x2={(lastDistance - firstDistance) * xScale}
            strokeWidth={0.5}
            stroke="#000"
          />
        );
      }
      if (i % 2 === 0) {
        components.push(
          <line
            y1={(maxHeight - minHeight - i) * yScale}
            y2={(maxHeight - minHeight - i) * yScale}
            x1={0}
            x2={(lastDistance - firstDistance) * xScale}
            strokeWidth={0.5}
            stroke="#000"
            strokeDasharray="2 2"
          />
        );
      }
    }
  }
  {
    // terrain
    const points = [];
    for (let i = 0; i < verticalTerrain.length; i++) {
      if (!Number.isFinite(verticalTerrain[i].z)) continue;
      points.push(
        `${(verticalTerrain[i].distance - firstDistance) * xScale},${
          (maxHeight - verticalTerrain[i].z - minHeight) * yScale
        }`
      );
    }
    components.push(
      <polyline
        points={points.join(" ")}
        stroke="blue"
        fill="none"
        strokeWidth={2}
      />
    );
  }
  {
    // gradients
    const points = [];
    const localGradients = [...gradients];
    let nowHeight = startHeight;

    points.push(`${0} ${(maxHeight - minHeight - nowHeight) * yScale}`);
    for (let i = 0; i < localGradients.length; i++) {
      const beforeLength =
        (localGradients[i]?.distance || 0) -
        (localGradients[i - 1]?.distance || 0);
      console.log(
        i,
        nowHeight,
        nowHeight + (beforeLength / 1000) * localGradients[i].gradientValue
      );
      nowHeight +=
        (beforeLength / 1000) * (localGradients[i - 1]?.gradientValue || 0);
      points.push(
        `${(localGradients[i].distance - firstDistance) * xScale} ${
          (maxHeight - minHeight - nowHeight) * yScale
        }`
      );
    }
    {
      const beforeLength =
        lastDistance -
        (localGradients[localGradients.length - 1]?.distance || 0);
      nowHeight +=
        (beforeLength / 1000) *
        (localGradients[localGradients.length - 1]?.gradientValue || 0);
      points.push(
        `${(lastDistance - firstDistance) * xScale} ${
          (maxHeight - minHeight - nowHeight) * yScale
        }`
      );
    }
    components.push(
      <polyline
        points={points.join(" ")}
        stroke="red"
        fill="none"
        strokeWidth={2}
      />
    );
    components.push(
      <polyline
        points={points.join(" ")}
        stroke="red"
        fill="none"
        strokeWidth={1}
        style={{ transform: `translate(0, -${4 * yScale}px)` }}
      />
    );
  }
  {
    // stations
    for (const sta of stations) {
      components.push(
        <line
          x1={(sta.distance - firstDistance) * xScale}
          x2={(sta.distance - firstDistance) * xScale}
          y1={0}
          y2={(maxHeight - minHeight) * yScale}
          stroke="green"
          strokeWidth={4}
        />
      );
      components.push(
        <text
          x={(sta.distance - firstDistance) * xScale}
          y={40}
          textAnchor="middle"
        >
          {sta.name}
        </text>
      );
    }
  }

  return (
    <div className="root">
      <div className="left">
        <div className="top">
          <div>
            <div>駅</div>
            <textarea
              onChange={(event) => {
                const value = event.target.value;
                setStations(JSON.parse(value));
              }}
            ></textarea>
          </div>
          <div>
            <div>地形標高</div>
            <textarea
              onChange={(event) => {
                const value = event.target.value;
                const csv = value
                  .split("\n")
                  .slice(1)
                  .map((v) => v.split("\t").map((v) => v.trim()));
                const result = [];
                for (const row of csv) {
                  if (row.length !== 4) {
                    continue;
                  }
                  result.push(
                    new Terrain(
                      Number.parseInt(row[0]),
                      Number.parseFloat(row[1]),
                      Number.parseFloat(row[2]),
                      Number.parseFloat(row[3])
                    )
                  );
                }
                setVerticalTerrain(result);
              }}
            ></textarea>
          </div>
          <div>
            <div>勾配出力</div>
            <textarea
              value={JSON.stringify(
                gradients.map((v) => ({
                  distance: v.distance,
                  value: v.gradientValue,
                }))
              )}
            ></textarea>
          </div>
          <div>
            <div>開始標高</div>
            <div>
              <input
                type="number"
                value={startHeight}
                style={{ width: "4em" }}
                onChange={(v) =>
                  setStartHeight(Number.parseFloat(v.target.value))
                }
              />
              m
            </div>
          </div>
        </div>
        <div className="main">
          <svg
            width={(lastDistance - firstDistance) * xScale}
            height={(maxHeight - minHeight + minHeightPadding) * yScale}
          >
            <g className="x-axis">{components}</g>
          </svg>
        </div>
      </div>
      <div className="right">
        {gradients.map((v, i) => {
          return (
            <>
              <div style={{ display: "flex", gap: "0.5em" }}>
                <label>
                  距離程
                  <input
                    type="number"
                    value={v.distance}
                    style={{ width: "4em" }}
                    onChange={(event) => {
                      const newGradients = [...gradients];
                      gradients[i].distance = Number.parseFloat(
                        event.target.value
                      );
                      setGradients(newGradients);
                    }}
                  />
                  m
                </label>
                <label>
                  勾配
                  <input
                    type="number"
                    value={v.gradientValue}
                    style={{ width: "4em" }}
                    onChange={(event) => {
                      const newGradients = [...gradients];
                      gradients[i].gradientValue = Number.parseFloat(
                        event.target.value
                      );
                      setGradients(newGradients);
                    }}
                  />
                  ‰
                </label>
                <button
                  onClick={() => {
                    setGradients(gradients.filter((_, j) => j !== i));
                  }}
                >
                  削除
                </button>
              </div>
            </>
          );
        })}
        <div style={{ display: "flex", gap: "0.5em", marginTop: "1em" }}>
          <label>
            距離程
            <input
              type="number"
              value={newGradientDistance}
              onChange={(event) =>
                setNewGradientDistance(Number.parseFloat(event.target.value))
              }
              style={{ width: "4em" }}
            />
            m
          </label>
          <label>
            勾配
            <input
              type="number"
              value={newGradientValue}
              onChange={(event) =>
                setNewGradientValue(Number.parseFloat(event.target.value))
              }
              style={{ width: "4em" }}
            />
            ‰
          </label>
          <button
            onClick={() => {
              setGradients([
                ...gradients,
                new Gradient(newGradientDistance, newGradientValue),
              ]);
              setNewGradientDistance(0);
              setNewGradientValue(0);
            }}
          >
            追加
          </button>
        </div>
      </div>
    </div>
  );
}
