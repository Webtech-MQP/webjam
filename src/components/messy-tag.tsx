'use client'
import { useEffect, useRef, useState, type ReactNode } from "react"
import type { CSSProperties } from "react";
import ReactRough, { Rectangle } from 'rough-react-wrapper'

interface MessyTagProps {
    children?: ReactNode;
    color?: string;
    style?: CSSProperties;
    className?: string;
    textClassName?: string;
    textStyles?: CSSProperties;
}
export const MessyTag = (props:MessyTagProps)=>{
    const labelRef = useRef<HTMLParagraphElement>(null);
    const [dim, setDim] = useState<{x:number, y:number}>({x:0, y:0});

    useEffect(()=>{
        const boxModel = labelRef.current?.getBoundingClientRect();
        if(boxModel){
            setDim({x:boxModel.width, y:boxModel.height})
        }
    }, [props.children])

    return (
        <div
            style={{
                padding: 8,
                color: props.color,
                width: "fit-content",
                transform:`translate(5px, 5px)`,
                ...props.style,
            }}
            className={props.className}
        >
            <div style={{
                position: "relative",
            }}>
                <p 
                    ref={labelRef}
                    style={{
                        position:"absolute",
                        textWrap: "nowrap",
                        padding: "8px",
                        ...props.textStyles
                    }} 
                    className={props.textClassName}
                >{props.children}</p>
            </div>
            <div style={{transform:`translate(-5px, -5px)`}}>
                {/* @ts-expect-error this can have children.. weird type issue */}
                <ReactRough
                    renderer={"svg"}
                    width={dim.x + 10}
                    height={dim.y + 10}
                >
                    <Rectangle
                        width={dim.x}
                        height={dim.y}
                        x={5}
                        y={5}
                        stroke="white"
                        strokeWidth={2}
                        roughness={3}
                    />
                </ReactRough>
            </div>
        </div>
    )
}