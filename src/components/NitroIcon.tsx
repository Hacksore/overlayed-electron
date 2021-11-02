const NitroIcon = ({ color, size }: { color: string, size: string }) => (
  <svg aria-label="Server boosting since Nov 20, 2020" aria-hidden="false" width={size} height={size} viewBox="0 0 8 12">
    <path d="M4 0L0 4V8L4 12L8 8V4L4 0ZM7 7.59L4 10.59L1 7.59V4.41L4 1.41L7 4.41V7.59Z" fill={color}></path>
    <path d="M2 4.83V7.17L4 9.17L6 7.17V4.83L4 2.83L2 4.83Z" fill={color}></path>
  </svg>
);

export default NitroIcon;
