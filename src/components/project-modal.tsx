import { Calendar, UserPlus, Users, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { MessyButton } from './messy-button';
import { MessyTag } from './messy-tag';
import { Button } from './ui/button';
import { ProjectRegistrationFlow } from './project-registration-flow';

interface ProjectModalProps {
    id: string;
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
    const [showRegistration, setShowRegistration] = useState(false);
    const [registrationCompleted, setRegistrationCompleted] = useState(false);
    
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
                backdropFilter: showRegistration ? 'blur(10px)' : 'none',
                transition: 'backdrop-filter 0.2s',
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
                <div className={`flex flex-col items-start gap-4 bg-stone-800 p-6 rounded-lg transition-all duration-300 ${showRegistration ? 'w-[600px] max-h-[90vh]' : 'w-[80vw] max-h-[90vh]'}`}>
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
                    {!showRegistration && !registrationCompleted && (
                        <>
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
                                        <p className="text-sm font-medium">Requirements:</p>
                                        <li className="list-inside list-disc text-sm">{props.requirements}</li>
                                    </ul>
                                    <Button onClick={() => setShowRegistration(true)}>
                                        <span className="flex items-center gap-2">
                                            Join Project <UserPlus className="h-4 w-4" />
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
                        </>
                    )}

                    {showRegistration && (
                        <ProjectRegistrationFlow
                            projectId={props.id}
                            open={showRegistration}
                            onClose={(wasSuccessful: boolean) => {
                                setShowRegistration(false);
                                if (wasSuccessful) {
                                    setRegistrationCompleted(true);
                                }
                            }}
                        />
                    )}

                    {registrationCompleted && !showRegistration && (
                        <div className="w-full text-center p-8">
                            <h2 className="text-2xl font-bold text-white">Registration successful</h2>
                            <p className="text-stone-300 mt-2">Thanks for signing up. We&#39;ll be in touch soon.</p>
                            <Button onClick={props.onClose} className="mt-4">Close</Button>
                        </div>
                    )}
                    
                </div>
            </div>
        </div>
    );
};
