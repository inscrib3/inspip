export const Icon = (props: {
  name: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLSpanElement> | undefined;
}) => (
  <span
    className="material-symbols-outlined"
    style={props.style}
    onClick={props.onClick}
  >
    {props.name}
  </span>
);
