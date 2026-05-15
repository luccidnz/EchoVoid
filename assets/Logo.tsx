import * as React from "react";
import Svg, { Circle, Ellipse, Text } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
const SvgLogo = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={64}
    height={64}
    fill="none"
    {...props}
  >
    <Circle cx={32} cy={32} r={28} stroke="#00E0FF" strokeWidth={4} />
    <Ellipse cx={32} cy={32} stroke="#7D5CFF" strokeWidth={3} rx={10} ry={18} />
    <Text
      x={32}
      y={38}
      fill="#E7ECF2"
      fontFamily="monospace"
      fontSize={18}
      textAnchor="middle"
    >
      {"0"}
    </Text>
  </Svg>
);
export default SvgLogo;
