import { Label } from "@/components/ui/label";
import { useState, type ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";
import { Plus, Trash } from "lucide-react";

interface ArrayInputProps {
    title?: string;
    type?: "string" | "number";
    decoration?: "none" | "bullets" | "numbers-dot" | "numbers-paren" | "letters-dot" | "letters-paren";
    placeholder?: string;
    defaultValues?: (string | number)[];
    onChange?: (values: (string | number)[])=>void;
    allowCreate?:boolean;
    allowDelete?:boolean;
}
    
export const ArrayInput = (props:ArrayInputProps) => {
    const [list, setList] = useState<(string | number)[]>(props.defaultValues ?? []);
    const type = props.type ?? "string";

    const getDecoration = (index:number) => {
        switch(props.decoration){
            case "bullets": return "•";
            case "numbers-dot": return `${index+1}.`;
            case "numbers-paren": return `${index+1})`;
            case "letters-dot": return String.fromCharCode(97 + index)+".";
            case "letters-paren": return String.fromCharCode(97 + index)+")";
            default: return "";
        }
    }

    const createEntry = ()=>{
        const _list = [...list, props.type==="number"?0:""];
        setList(_list);
        if(props.onChange)props.onChange(_list);
    }

    return (
        <div className="flex flex-col gap-3">
            <Label>{props.title}</Label>
            {
                list.map((item, i)=>{
                    return (
                        <span key={"item"+i} className="flex w-full flex-nowrap gap-2 items-center">
                            <p className="w-4">{getDecoration(i)}</p>
                            <Input 
                                type={type}
                                // autoFocus = {i === list.length-1}
                                id={"item"+i}
                                placeholder={props.placeholder}
                                value={item}
                                onChange={(e:ChangeEvent<HTMLInputElement>)=>{
                                    const _list = [...list];
                                    _list[i] = e.target.value;
                                    setList(_list);
                                    if(props.onChange)props.onChange(_list);
                                }}
                                onKeyDown={(e)=>{
                                    if((e.key === "Enter" || e.key==="Return") && props.allowCreate){
                                        createEntry();
                                    }
                                }}
                            />
                            {
                                props.allowDelete && 
                                <Button 
                                    size="icon"
                                    onClick={()=>{
                                        const _list = list.filter((i)=>i !== item);
                                        setList(_list);
                                        if(props.onChange)props.onChange(_list);
                                    }}
                                ><Trash/></Button>
                            }
                        </span>
                    )
                })
            }
            {
                props.allowCreate &&
                <Button 
                    size="icon"
                    onClick={createEntry}
                ><Plus/></Button>
            }
        </div>
    )
}