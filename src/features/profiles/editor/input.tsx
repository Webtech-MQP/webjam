import { cn } from '@/lib/utils';

type Props = (
    | (React.InputHTMLAttributes<HTMLInputElement> & {
          type: 'input';
      })
    | (React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
          type: 'textarea';
      })
) & {
    label?: string;
    icon?: React.ReactNode;
};

export function Input(props: Props) {
    const { className, icon, ...rest } = props;

    return (
        <div className="relative">
            {rest.type === 'input' ? (
                <input
                    className={cn('focus:outline-primary focus:outline-b-2 w-full rounded-md p-4 outline outline-white/15 transition-all focus:outline-2', props.className, !!icon && 'pl-10')}
                    {...rest}
                />
            ) : (
                <textarea
                    className={cn('focus:outline-primary focus:outline-b-2 field-sizing-content rounded-md p-4 outline outline-white/15 transition-all focus:outline-2', className, !!icon && 'pl-10')}
                    {...rest}
                />
            )}
            {rest.label && <label className="text-muted-foreground dark:text-muted-foreground bg-background absolute top-0 left-2 block -translate-y-1/2 px-2 text-sm font-semibold">{props.label}</label>}
            {icon && <div className="text-muted-foreground dark:text-muted-foreground absolute top-1/2 left-2 block -translate-y-1/2 px-2">{icon}</div>}
        </div>
    );
}
