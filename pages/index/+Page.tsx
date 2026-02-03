import { useEffect, useState } from "react";
import { Terrain } from "./terrain";
import { Gradient } from "./gradient";
import { Station } from "./station";
import "./index.css";
import { Structure, StructureType } from "./structure";

export default function Page() {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    const message =
      "入力内容が保存されない可能性があります。ページを離れますか？";
    e.preventDefault();
    e.returnValue = message;
    return message;
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
  const [structures, setStructures] = useState([] as Structure[]);

  const [newGradientDistance, setNewGradientDistance] = useState(0);
  const [newGradientValue, setNewGradientValue] = useState(0);

  const [newStructureStartDistance, setNewStructureStartDistance] = useState(0);
  const [newStructureEndDistance, setNewStructureEndDistance] = useState(0);
  const [newStructureType, setNewStructureType] = useState("tunnel");
  const [newStructureName, setNewStructureName] = useState("");

  const firstDistance = verticalTerrain[0]?.distance - 100;
  const lastDistance =
    verticalTerrain[verticalTerrain.length - 1]?.distance + 100;

  const maxHeight =
    verticalTerrain
      .filter((v) => Number.isFinite(v.z))
      .map((v) => v.z)
      .reduce((max, current) => Math.max(max, current), -Infinity) + 20;
  const minHeight = 0;
  const minHeightPadding = 20;

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
              </text>,
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
          />,
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
          />,
        );
        components.push(
          <text x={(i - firstDistance) * xScale} y={20} textAnchor="middle">
            {i}
          </text>,
        );
        components.push(
          <text
            x={(i - firstDistance) * xScale}
            y={(maxHeight + minHeightPadding - 5) * yScale}
            textAnchor="middle"
          >
            {i}
          </text>,
        );
      }
      if (i % 50 === 0) {
        components.push(
          <line
            y1={0}
            y2={(maxHeight - minHeight + minHeightPadding) * yScale}
            x1={(i - firstDistance) * xScale}
            x2={(i - firstDistance) * xScale}
            strokeWidth={0.5}
            stroke="#000"
            strokeDasharray="2 2"
          />,
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
          />,
        );
      }
      if (i % 5 === 0) {
        components.push(
          <line
            y1={(maxHeight - minHeight - i) * yScale}
            y2={(maxHeight - minHeight - i) * yScale}
            x1={0}
            x2={(lastDistance - firstDistance) * xScale}
            strokeWidth={0.5}
            stroke="#000"
            strokeDasharray="2 2"
          />,
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
        }`,
      );
    }
    components.push(
      <polyline
        points={points.join(" ")}
        stroke="blue"
        fill="none"
        strokeWidth={2}
      />,
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
      nowHeight +=
        (beforeLength / 1000) * (localGradients[i - 1]?.gradientValue || 0);
      points.push(
        `${(localGradients[i].distance - firstDistance) * xScale} ${
          (maxHeight - minHeight - nowHeight) * yScale
        }`,
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
        }`,
      );
    }
    components.push(
      <polyline
        points={points.join(" ")}
        stroke="red"
        fill="none"
        strokeWidth={2}
      />,
    );
    components.push(
      <polyline
        points={points.join(" ")}
        stroke="red"
        fill="none"
        strokeWidth={1}
        style={{ transform: `translate(0, -${4 * yScale}px)` }}
      />,
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
        />,
      );
      components.push(
        <text
          x={(sta.distance - firstDistance) * xScale}
          y={40}
          textAnchor="middle"
        >
          {sta.name}
        </text>,
      );
    }
  }
  {
    // トンネル･橋梁
    function getEveration(distance: number): {
      everation: number;
      gradient: number;
    } {
      if (distance >= lastDistance) {
        return { everation: 0, gradient: 0 };
      }

      let everation = startHeight;
      let gradient = 0;
      for (let i = 0; i < distance; i++) {
        everation += gradient / 1000;

        const gradientChange = gradients.find((v) => v.distance === i);
        if (gradientChange) {
          gradient = gradientChange.gradientValue;
        }
      }

      return { everation, gradient };
    }

    for (const structure of structures) {
      const points = [];
      const everation = getEveration(structure.startDistance);
      let nowHeight = everation.everation;
      let nowGradient = everation.gradient;
      let beforeDistance = structure.startDistance;
      for (let i = structure.startDistance; i < structure.endDistance; i++) {
        nowHeight += (1 / 1000) * (nowGradient || 0);
        points.push(
          `${(i - firstDistance) * xScale} ${
            (maxHeight - minHeight - nowHeight) * yScale
          }`,
        );

        const gradientChange = gradients.find((v) => v.distance === i);
        if (gradientChange) {
          nowGradient = gradientChange.gradientValue;
          console.log(nowGradient);
        }
      }
      components.push(
        <text
          x={`${((structure.startDistance + structure.endDistance) / 2 - firstDistance) * xScale}`}
          y={`${(maxHeight - minHeight - nowHeight + 10) * yScale}`}
          textAnchor="middle"
        >
          {structure.name}
        </text>,
      );
      components.push(
        <polyline
          points={points.join(" ")}
          className={`structure-${structure.type}`}
          fill="none"
          strokeWidth={6}
        />,
      );
      components.push(
        <polyline
          points={points.join(" ")}
          className={`structure-${structure.type}`}
          fill="none"
          strokeWidth={6}
          style={{ transform: `translate(0, -${4 * yScale}px)` }}
        />,
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
                      Number.parseFloat(row[3]),
                    ),
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
                  position: v.distance,
                  value: v.gradientValue,
                })),
              )}
              onChange={(event) => {
                try {
                  const json = JSON.parse(event.target.value);
                  if (Array.isArray(json)) {
                    const arr = json as any[];
                    const gradients = arr.map((v) => {
                      return new Gradient(
                        Number.parseInt(v.position),
                        Number.parseFloat(v.value),
                      );
                    });
                    setGradients(gradients);
                  }
                } catch (error) {}
              }}
            ></textarea>
          </div>
          <div>
            <div>構造物出力</div>
            <textarea
              value={JSON.stringify(
                structures.map((v) => ({
                  start: v.startDistance,
                  end: v.endDistance,
                  type: v.type,
                  name: v.name,
                })),
              )}
              onChange={(event) => {
                try {
                  const json = JSON.parse(event.target.value);
                  if (Array.isArray(json)) {
                    const arr = json as any[];
                    const structures = arr.map((v) => {
                      return new Structure(
                        Number.parseInt(v.start),
                        Number.parseInt(v.end),
                        v.type,
                        v.name,
                      );
                    });
                    setStructures(structures);
                  }
                } catch (error) {}
              }}
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
                        event.target.value,
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
                        event.target.value,
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

        {structures.map((v, i) => {
          return (
            <>
              <div style={{ display: "flex", gap: "0.5em" }}>
                <label>
                  開始
                  <input
                    type="number"
                    value={v.startDistance}
                    style={{ width: "4em" }}
                    onChange={(event) => {
                      const newStructures = [...structures];
                      newStructures[i].startDistance = Number.parseFloat(
                        event.target.value,
                      );
                      setStructures(newStructures);
                    }}
                  />
                  m
                </label>
                <label>
                  終了
                  <input
                    type="number"
                    value={v.endDistance}
                    style={{ width: "4em" }}
                    onChange={(event) => {
                      const newStructures = [...structures];
                      newStructures[i].endDistance = Number.parseFloat(
                        event.target.value,
                      );
                      setStructures(newStructures);
                    }}
                  />
                  m
                </label>
                <label>
                  名称
                  <input
                    type="text"
                    value={v.name}
                    style={{ width: "6em" }}
                    onChange={(event) => {
                      const newStructures = [...structures];
                      newStructures[i].name = event.target.value;
                      setStructures(newStructures);
                    }}
                  />
                </label>
                <label>
                  <select
                    value={v.type}
                    onChange={(event) => {
                      const newStructures = [...structures];
                      newStructures[i].type = event.target
                        .value as StructureType;
                      setStructures(newStructures);
                    }}
                  >
                    <option value="tunnel">トンネル</option>
                    <option value="bridge">橋梁</option>
                  </select>
                </label>
                <button
                  onClick={() => {
                    setStructures(structures.filter((_, j) => j !== i));
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
            開始
            <input
              type="number"
              value={newStructureStartDistance}
              style={{ width: "4em" }}
              onChange={(event) => {
                setNewStructureStartDistance(
                  Number.parseFloat(event.target.value),
                );
              }}
            />
            m
          </label>
          <label>
            終了
            <input
              type="number"
              value={newStructureEndDistance}
              style={{ width: "4em" }}
              onChange={(event) => {
                setNewStructureEndDistance(
                  Number.parseFloat(event.target.value),
                );
              }}
            />
            m
          </label>
          <label>
            名称
            <input
              type="text"
              value={newStructureName}
              style={{ width: "6em" }}
              onChange={(event) => {
                setNewStructureName(event.target.value);
              }}
            />
          </label>
          <label>
            <select
              value={newStructureType}
              onChange={(event) => {
                setNewStructureType(event.target.value);
              }}
            >
              <option value="tunnel">トンネル</option>
              <option value="bridge">橋梁</option>
            </select>
          </label>
          <button
            onClick={() => {
              setStructures([
                ...structures,
                new Structure(
                  newStructureStartDistance,
                  newStructureEndDistance,
                  newStructureType as StructureType,
                  newStructureName,
                ),
              ]);
              setNewStructureStartDistance(0);
              setNewStructureEndDistance(0);
            }}
          >
            追加
          </button>
        </div>
      </div>
    </div>
  );
}
