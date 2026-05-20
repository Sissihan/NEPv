interface Props {
  A: number[][];
  title?: string;
}

function heatColor(v: number, min: number, max: number): string {
  const t = max === min ? 0.5 : (v - min) / (max - min);
  const r = Math.round(239 + t * (29 - 239));
  const g = Math.round(246 + t * (78 - 246));
  const b = Math.round(255 + t * (216 - 255));
  return `rgb(${r},${g},${b})`;
}

export function MatrixHeatmap({ A, title = 'A(x)' }: Props) {
  const flat = A.flat();
  const min = Math.min(...flat);
  const max = Math.max(...flat);
  const n = A.length;

  return (
    <div>
      <h3>{title}</h3>
      <div
        className="heatmap-grid"
        style={{ gridTemplateColumns: `repeat(${n}, minmax(40px, 1fr))` }}
      >
        {A.map((row, i) =>
          row.map((v, j) => (
            <div
              key={`${i}-${j}`}
              className="heatmap-cell"
              style={{ background: heatColor(v, min, max) }}
              title={`A[${i + 1},${j + 1}]`}
            >
              {v.toFixed(3)}
            </div>
          )),
        )}
      </div>
    </div>
  );
}
