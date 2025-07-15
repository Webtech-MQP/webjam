import { Calendar, UserPlus, Users, X } from "lucide-react";
import { MessyTag } from "./messy-tag";
import { Button } from "./ui/button";
import Image from "next/image";
import { MessyButton } from "./messy-button";
import { useEffect } from "react";

interface ProjectModalProps {
    title:string;
    subtitle:string;
    starts:string;
    ends:string;
    signups:number;
    description:string;
    imageUrl:string;
    requirements:string[];
    tags:string[];
    onSignup?: ()=>void;
    onClose?: ()=>void;
}

export const ProjectModal = (props:ProjectModalProps) => {

    useEffect(()=>{
        document.body.style.overflowY = "hidden";
        return ()=>{
            document.body.style.overflowY = "scroll";
        };
    }, []);
    
    return (
        <div style={{
            position:"fixed",
            top:0,
            left:0,
            zIndex: 100,
            width:"100vw",
            height:"100vh",
            backgroundColor:"#00000040",
            backdropFilter: "blur(10px)"
        }}>
            <div style={{
                position:"absolute",
                left:"50%",
                top:"50%",
                transform:"translate(-50%, -50%)",
            }}>
                <div className="bg-stone-800 flex flex-col items-start w-[80vw] max-h-[90vh] overflow-x-hidden overflow-y-scroll p-6 gap-4">
                    <div className="w-full flex flex-row flex-nowrap justify-between">
                        <div className="flex flex-row flex-nowrap justify-start">
                            {
                                props.tags.map((tag, index)=>{
                                    return(
                                        <MessyTag
                                            key={tag+index}
                                            textClassName="text-xs text-white"
                                            color="#d37c04"
                                        >{tag}</MessyTag>
                                    )
                                })
                            }
                        </div>
                        <MessyButton
                            variant="outline"
                            shape="circle"
                            onClick={()=>{
                                if(props.onClose){
                                    props.onClose();
                                }
                            }}
                        >
                            <X/>
                        </MessyButton>
                    </div>
                    <div>
                        <h1>{props.title}</h1>
                        <p>{props.subtitle}</p>
                    </div>
                    <div>
                        <p className="text-sm flex flex-nowrap items-baseline gap-1"><Calendar size={"1rem"}/> {props.starts} --- {props.ends}</p>
                        <p className="text-sm flex flex-nowrap items-baseline gap-1"><Users size={"1rem"}/> {props.signups} people signed up</p>
                    </div>
                    <div className="flex flex-row">
                        <div className="w-1/2 flex flex-col gap-4">
                            <p className="text-sm">{props.description}</p>
                            <ul>
                            <p className="text-sm">Requirements:</p>
                                {
                                    props.requirements.map((req, index)=>{
                                        return (
                                            <li 
                                                key={req+index}
                                                className="text-sm list-disc list-inside"
                                            >{req}</li>
                                        )
                                    })
                                }
                            </ul>
                            <Button asChild onClick={()=>{
                                if(props.onSignup){
                                    props.onSignup();
                                }
                            }}><span>Join Project <UserPlus/></span></Button>
                        </div>
                        <div className="w-1/2 px-20">
                            <Image
                                src={props.imageUrl}
                                alt={"Project Image"}
                                width={1000}
                                height={1000}
                                className="object-cover"
                                style={{aspectRatio:1/1}}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}