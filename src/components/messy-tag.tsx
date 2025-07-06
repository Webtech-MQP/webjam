import type { ReactNode } from "react"
import type { CSSProperties } from "react";

interface MessyTagProps {
    children: ReactNode;
    color?: string;
    textStyle?: CSSProperties;
}
export const MessyTag = (props:MessyTagProps)=>{
    return (
        <div
            style={{
                border: "2px solid white",
                borderRadius: "1000px",
                padding: 8,
                color: props.color,
            }}
        >
            <p style={props.textStyle}>{props.children}</p>
        </div>
    )
}