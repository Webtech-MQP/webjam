import { Calendar, UserPlus, Users, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { MessyButton } from './messy-button';
import { MessyTag } from './messy-tag';
import { Button } from './ui/button';

interface ProjectModalProps {
    title: string;
    subtitle: string;
    starts: string;
    ends: string;
    signups: number;
    description: string;
    imageUrl: string;
    requirements: string;
    tags: string[];
    onSignup?: () => void;
    onClose?: () => void;
}

export const ProjectModal = (props: ProjectModalProps) => {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        setVisible(true);
        document.body.style.overflowY = 'hidden';

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && props.onClose) {
                props.onClose();
            }
        };

        window.addEventListener('keydown', handleEsc);

        return () => {
            document.body.style.overflowY = 'scroll';
            window.removeEventListener('keydown', handleEsc);
        };
    }, [props, props.onClose]);

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 100,
                width: '100vw',
                height: '100vh',
                backgroundColor: '#00000040',
                backdropFilter: 'blur(10px)',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    opacity: visible ? 1 : 0,
                    transformOrigin: 'center',
                    ...(visible ? { transform: 'translate(-50%, -50%) scale(1)' } : { transform: 'translate(-50%, -50%) scale(0.92)' }),
                }}
            >
                <div className="flex max-h-[90vh] w-[80vw] flex-col items-start gap-4 overflow-x-hidden overflow-y-hidden bg-stone-800 p-6 rounded-lg   ">
                    <div className="flex w-full flex-row flex-nowrap justify-between">
                        <div className="flex flex-row flex-nowrap justify-start">
                            {props.tags.map((tag, index) => {
                                return (
                                    <MessyTag
                                        key={tag + index}
                                        textClassName="text-xs text-white"
                                        color="#d37c04"
                                    >
                                        {tag}
                                    </MessyTag>
                                );
                            })}
                        </div>
                        <MessyButton
                            variant="outline"
                            shape="circle"
                            onClick={() => {
                                if (props.onClose) {
                                    props.onClose();
                                }
                            }}
                        >
                            <X />
                        </MessyButton>
                    </div>
                    <div>
                        <h1>{props.title}</h1>
                        <p>{props.subtitle}</p>
                    </div>
                    <div>
                        <p className="flex flex-nowrap items-baseline gap-1 text-sm">
                            <Calendar size={'1rem'} /> {props.starts} --- {props.ends}
                        </p>
                        <p className="flex flex-nowrap items-baseline gap-1 text-sm">
                            <Users size={'1rem'} /> {props.signups} people signed up
                        </p>
                    </div>
                    <div className="flex flex-row">
                        <div className="flex w-1/2 flex-col gap-4">
                            <p className="text-sm">{props.description}</p>
                            <ul>
                                <p className="text-sm">Requirements:</p>
                                {/* {
                                    props.requirements.map((req, index)=>{
                                        return (
                                            <li 
                                                key={req+index}
                                                className="text-sm list-disc list-inside"
                                            >{req}</li>
                                        )
                                    })
                                } */}
                                <li className="list-inside list-disc text-sm">{props.requirements}</li>
                            </ul>
                            <Button
                                asChild
                                onClick={() => {
                                    if (props.onSignup) {
                                        props.onSignup();
                                    }
                                }}
                            >
                                <span>
                                    Join Project <UserPlus />
                                </span>
                            </Button>
                        </div>
                        <div className="w-1/2 px-20">
                            <Image
                                src={props.imageUrl}
                                alt={'Project Image'}
                                width={1000}
                                height={1000}
                                className="object-cover"
                                style={{ aspectRatio: 1 / 1 }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
