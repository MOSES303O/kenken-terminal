import type { Cage } from '../engine/types';
import type { Cell } from '../engine/types';

interface Props {
  grid: Cell[][];
  cages: Cage[];
  selected: [number,number] | null;
}

function getCageLabel(cages: Cage[], r: number, c: number): string {
  const cage = cages.find(cage => cage.cells[0][0] === r && cage.cells[0][1] === c);
  return cage ? `${cage.target}${cage.op}` : '';
}

function getBorders(cages: Cage[], r: number, c: number, size: number) {
  const inCage = (cr: number, cc: number, cageId: string) =>
    cages.find(ca => ca.id === cageId)?.cells.some(([x,y]) => x===cr && y===cc) ?? false;
  const myCage = cages.find(ca => ca.cells.some(([x,y]) => x===r && y===c));
  if (!myCage) return {};
  const CAGE_COLOR = '#5b8fff';
  const THIN = '1px solid #2a2a2a';
  const THICK = `2px solid ${CAGE_COLOR}`;
  return {
    borderTop:    (r===0 || !inCage(r-1,c,myCage.id)) ? THICK : THIN,
    borderBottom: (r===size-1 || !inCage(r+1,c,myCage.id)) ? THICK : THIN,
    borderLeft:   (c===0 || !inCage(r,c-1,myCage.id)) ? THICK : THIN,
    borderRight:  (c===size-1 || !inCage(r,c+1,myCage.id)) ? THICK : THIN,
  };
}

export function KenKenGrid({ grid, cages, selected }: Props) {
  const size = grid.length;
  return (
    <table data-testid="kenken-grid" style={{ borderCollapse:'collapse' }}>
      <tbody>
        {grid.map((row, r) => (
          <tr key={r}>
            {row.map((cell, c) => {
              const isSelected = selected?.[0]===r && selected?.[1]===c;
              const label = getCageLabel(cages, r, c);
              const borders = getBorders(cages, r, c, size);
              let color = '#c8c8c8';
              if (cell.isError) color = '#ef4444';
              else if (cell.isHint) color = '#facc15';
              else if (isSelected) color = '#4ade80';
              return (
                <td key={c} data-testid={`cell-${r}-${c}`} style={{
                  width:52, height:52, textAlign:'center', verticalAlign:'middle',
                  position:'relative', fontSize:18, fontFamily:'monospace',
                  color,
                  background: cell.isError ? '#1a0808' : cell.isHint ? '#1a1a08' : isSelected ? '#0d1a0d' : 'transparent',
                  ...borders,
                }}>
                  {label && (
                    <span style={{
                      position:'absolute', top:2, left:3,
                      fontSize:9, color:'#888', lineHeight:1, fontFamily:'monospace',
                    }}>{label}</span>
                  )}
                  {cell.value ?? ''}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
