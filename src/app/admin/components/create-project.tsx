"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { redirect } from "next/navigation";
import {api} from "@/trpc/react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DialogOverlay, DialogPortal } from "@radix-ui/react-dialog";
import { Plus, PlusCircle, Trash, X } from "lucide-react";
import { useState, type ChangeEvent } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { ArrayInput } from "@/components/array-input";

interface CreateProjectFormSchema {
    title: string;
    subtitle: string;
    description: string;
    requirements: string[];
    start: string;
    end: string;
    imageURL: string;
    tags: string[];
}

const defaultForm:CreateProjectFormSchema = {
    title: "",
    subtitle: "",
    description: "",
    requirements: [""],
    start: "",
    end: "",
    imageURL: "",
    tags: [""],
}

export default function AdminCreateProject() {
    const [dialogueOpen, setDialogueOpen] = useState<boolean>(false);
    const [formState, setFormState] = useState<CreateProjectFormSchema>(defaultForm);
    const createProject = api.projects.create.useMutation();
    async function onSubmit() {
        setDialogueOpen(false);
        console.log(formState);
        await createProject.mutateAsync({
            title: formState.title,
            subtitle: formState.subtitle,
            description: formState.description,
            requirements: getReqsString(),
            imageURL: formState.imageURL,
            starts: new Date(formState.start),
            ends: new Date(formState.end)
        });
    }

    function onDiscard() {
        setDialogueOpen(false);
        setFormState(defaultForm);
    }

    function getReqsString() {
        if(!formState.requirements || formState.requirements.length === 0){
            return "";
        }
        return "Requirements:\n"+formState.requirements.map(req=>"• "+req).join("\n");
    }

    return (
        <Dialog open={dialogueOpen}>
            <DialogTrigger onClick={()=>{
                setDialogueOpen(true)
            }}>
                <PlusCircle/> Create Project
            </DialogTrigger>
            <DialogPortal>
                <DialogOverlay />
                <DialogContent className="h-full overflow-y-scroll" showCloseButton={false}>
                    <DialogHeader >
                        <div className="w-full flex justify-between">
                            <DialogTitle>Create New Project</DialogTitle>
                            <DialogClose onClick={()=>{
                                setDialogueOpen(false);
                            }}><X/></DialogClose>
                        </div>
				        <DialogDescription>
                            Fill out the information needed to create a new project.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid w-full max-w-sm items-center gap-3">
                        <Label htmlFor="title">Title</Label>
                        <Input type="text" id="title" placeholder="Title" value={formState.title} 
                            onChange={(e: ChangeEvent<HTMLInputElement>)=>setFormState({...formState, title: e.target.value})}
                        />
                        <Label htmlFor="subtitle">Subtitle</Label>
                        <Input type="text" id="subtitle" placeholder="Subtitle" value={formState.subtitle} 
                            onChange={(e: ChangeEvent<HTMLInputElement>)=>setFormState({...formState, subtitle: e.target.value})}
                        />
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" placeholder="Description" value={formState.description} 
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>)=>setFormState({...formState, description: e.target.value})}
                        />
                        <ArrayInput
                            title="Requirements"
                            decoration="numbers-dot"
                            allowCreate allowDelete
                            onChange={(v)=>setFormState({...formState, requirements:(v as string[])})}
                            defaultValues={formState.requirements}
                        />
                        <Label htmlFor="start">Starts At</Label>
                        <Input type="datetime-local" id="start" placeholder="Starts At" value={formState.start} 
                            onChange={(e: ChangeEvent<HTMLInputElement>)=>setFormState({...formState, start: e.target.value})}
                        />
                        <Label htmlFor="end">Ends At</Label>
                        <Input type="datetime-local" id="end" placeholder="Ends At" value={formState.end} 
                            onChange={(e: ChangeEvent<HTMLInputElement>)=>setFormState({...formState, end: e.target.value})}
                        />
                        <Label htmlFor="imageURL">Image URL</Label>
                        <Input type="url" id="imageURL" placeholder="Image URL" value={formState.imageURL} 
                            onChange={(e: ChangeEvent<HTMLInputElement>)=>setFormState({...formState, imageURL: e.target.value})}
                        />
                        {
                            formState.imageURL.trim().length > 0 && isValidHttpUrl(formState.imageURL.trim()) &&
                            <Image src={formState.imageURL.trim()} alt="Image" width={100} height={100} className="object-cover" />
                        }
                        <ArrayInput
                            title="Tags"
                            decoration="bullets"
                            allowCreate allowDelete
                            onChange={(v)=>setFormState({...formState, tags:(v as string[])})}
                            defaultValues={formState.tags}
                        />
                        <Button onClick={onSubmit}>Create</Button>
                        <Button variant="secondary" onClick={onDiscard}>Discard</Button>
                    </div>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
}

function isValidHttpUrl(str: string) {
  let url;
  
  try {
    url = new URL(str);
  } catch (_) {
    return false;  
  }

  return url.protocol === "http:" || url.protocol === "https:";
}