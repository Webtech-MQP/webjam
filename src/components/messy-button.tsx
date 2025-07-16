"use client";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import ReactRough, { Circle, Rectangle } from "rough-react-wrapper";

interface MessyButtonProps {
  children: string | ReactNode;
  color?: string;
  style?: CSSProperties;
  className?: string;
  textClassName?: string;
  textStyles?: CSSProperties;

  variant?: "fill" | "outline";
  shape?: "rectangle" | "circle";

  onClick?: () => void;
  onMouseOver?: () => void;
  onMouseLeave?: () => void;
}
export const MessyButton = (props: MessyButtonProps) => {
  const labelRef = useRef<HTMLParagraphElement>(null);
  const [dim, setDim] = useState<{ x: number; y: number }>({
    x: typeof props.children === "string" ? props.children.length * 8 : 20,
    y: 20,
  });
  const [hovered, setHovered] = useState<boolean>(false);

  useEffect(() => {
    const boxModel = labelRef.current?.getBoundingClientRect();
    if (boxModel) {
      setDim({ x: boxModel.width, y: boxModel.height });
    }
  }, [props.children, props.textClassName, props.textStyles]);

  const onHover = () => {
    setHovered(true);
    if (props.onMouseOver) props.onMouseOver();
  };

  const onDehover = () => {
    setHovered(false);
    if (props.onMouseLeave) props.onMouseLeave();
  };

  const onClick = () => {
    if (props.onClick) props.onClick();
  };

  return (
    <div
      style={{
        color: props.color,
        width: "fit-content",
        transform: `translate(5px, 5px)`,
        ...props.style,
      }}
      className={props.className}
    >
      <div
        style={{
          position: "relative",
        }}
      >
        <p
          ref={labelRef}
          style={{
            position: "absolute",
            textWrap: "nowrap",
            padding: "8px",
            ...props.textStyles,
          }}
          className={props.textClassName}
        >
          {props.children}
        </p>
      </div>
      <button
        type="button"
        style={{
          background: "none",
          border: "none",
          padding: 0,
          margin: 0,
          cursor: "pointer",
          outline: "none",
          transform: `translate(-5px, -5px)`,
          display: "block",
        }}
        onMouseOver={onHover}
        onMouseLeave={onDehover}
        onClick={onClick}
        aria-label={
          typeof props.children === "string" ? props.children : "button"
        }
      >
        {/* @ts-expect-error this can have children.. weird type issue */}
        <ReactRough renderer={"svg"} width={dim.x + 10} height={dim.y + 10}>
          {(props.shape === "rectangle" || props.shape === undefined) && (
            <Rectangle
              width={dim.x}
              height={dim.y}
              x={5}
              y={5}
              stroke={
                props.variant === "fill" || hovered
                  ? props.color || "white"
                  : "none"
              }
              strokeWidth={0.8}
              roughness={3}
              simplification={0.5}
              maxRandomnessOffset={1.75}
              fillStyle="cross-hatch"
              fill={hovered && props.variant === "fill" ? "#ffffff60" : "none"}
            />
          )}
          {props.shape === "circle" && (
            <Circle
              diameter={Math.max(dim.x, dim.y)}
              x={Math.max(dim.x, dim.y) / 2 + 5}
              y={Math.max(dim.x, dim.y) / 2 + 5}
              stroke={
                props.variant === "fill" || hovered
                  ? props.color || "white"
                  : "none"
              }
              strokeWidth={0.8}
              roughness={2}
              simplification={0.5}
              maxRandomnessOffset={1.75}
              fillStyle="cross-hatch"
              fill={hovered && props.variant === "fill" ? "#ffffff60" : "none"}
            />
          )}
        </ReactRough>
      </button>
    </div>
  );
};
