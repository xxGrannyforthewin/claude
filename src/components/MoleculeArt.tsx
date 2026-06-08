import React from 'react';
import Svg, { Circle, Line, Defs, RadialGradient, Stop } from 'react-native-svg';

export default function MoleculeArt({ width = 160, height = 90 }: { width?: number; height?: number }) {
  const nodes = [
    { id: 'n1', cx: 36, cy: 44, r: 18, g: 'rose' },
    { id: 'n2', cx: 80, cy: 20, r: 13, g: 'lav' },
    { id: 'n3', cx: 118, cy: 50, r: 20, g: 'rose2' },
    { id: 'n4', cx: 66, cy: 70, r: 10, g: 'lav' },
    { id: 'n5', cx: 145, cy: 22, r: 9, g: 'rose' },
  ];
  const edges = [
    [36, 44, 80, 20],
    [80, 20, 118, 50],
    [36, 44, 66, 70],
    [80, 20, 66, 70],
    [118, 50, 66, 70],
    [118, 50, 145, 22],
    [80, 20, 145, 22],
  ];

  return (
    <Svg width={width} height={height} viewBox={`0 0 160 90`}>
      <Defs>
        <RadialGradient id="rose" cx="35%" cy="30%" r="70%">
          <Stop offset="0" stopColor="#F9CEC8" stopOpacity="1" />
          <Stop offset="1" stopColor="#E8A598" stopOpacity="0.6" />
        </RadialGradient>
        <RadialGradient id="rose2" cx="35%" cy="30%" r="70%">
          <Stop offset="0" stopColor="#FDD5CC" stopOpacity="1" />
          <Stop offset="1" stopColor="#E8A598" stopOpacity="0.5" />
        </RadialGradient>
        <RadialGradient id="lav" cx="35%" cy="30%" r="70%">
          <Stop offset="0" stopColor="#E0D6FF" stopOpacity="1" />
          <Stop offset="1" stopColor="#C4B5FD" stopOpacity="0.55" />
        </RadialGradient>
      </Defs>

      {edges.map(([x1, y1, x2, y2], i) => (
        <Line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="#E8A59840" strokeWidth={1.2} strokeDasharray="3,3" />
      ))}

      {nodes.map(n => (
        <Circle key={n.id} cx={n.cx} cy={n.cy} r={n.r}
          fill={`url(#${n.g})`} opacity={0.88} />
      ))}
    </Svg>
  );
}
