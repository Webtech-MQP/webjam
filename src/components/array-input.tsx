import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash } from 'lucide-react';
import { type ChangeEvent } from 'react';
import { Button } from './ui/button';

interface ArrayInputProps {
    title?: string;
    type?: 'string' | 'number';
    decoration?: 'none' | 'bullets' | 'numbers-dot' | 'numbers-paren' | 'letters-dot' | 'letters-paren';
    placeholder?: string;
    list?: (string | number)[];
    onChange?: (values: (string | number)[]) => void;
    allowCreate?: boolean;
    allowDelete?: boolean;
}

export const ArrayInput = (props: ArrayInputProps) => {
    const list = props.list ?? [];
    const type = props.type ?? 'string';

    const getDecoration = (index: number) => {
        switch (props.decoration) {
            case 'bullets':
                return '•';
            case 'numbers-dot':
                return `${index + 1}.`;
            case 'numbers-paren':
                return `${index + 1})`;
            case 'letters-dot':
                return String.fromCharCode(97 + index) + '.';
            case 'letters-paren':
                return String.fromCharCode(97 + index) + ')';
            default:
                return '';
        }
    };

    const setList = (newList: (string | number)[]) => {
        if (props.onChange) {
            props.onChange(newList);
        }
    };

    const createEntry = () => {
        const _list = [...list, props.type === 'number' ? 0 : ''];
        setList(_list);
        if (props.onChange) props.onChange(_list);
    };

    return (
        <div className="flex flex-col gap-3">
            <Label>{props.title}</Label>
            {list.map((item, index) => {
                return (
                    <span
                        key={'item' + index}
                        className="flex w-full flex-nowrap gap-2 items-center"
                    >
                        <p className="w-4">{getDecoration(index)}</p>
                        <Input
                            type={type}
                            autoFocus={index === list.length - 1}
                            id={'item' + index}
                            placeholder={props.placeholder}
                            value={item}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                const _list = [...list];
                                _list[index] = e.target.value;
                                setList(_list);
                                if (props.onChange) props.onChange(_list);
                            }}
                            onKeyDown={(e) => {
                                if ((e.key === 'Enter' || e.key === 'Return') && props.allowCreate) {
                                    createEntry();
                                }
                            }}
                        />
                        {props.allowDelete && (
                            <Button
                                size="icon"
                                variant="outline"
                                onClick={() => {
                                    const _list = list.filter((v, i) => i !== index);
                                    setList(_list);
                                    if (props.onChange) props.onChange(_list);
                                }}
                            >
                                <Trash />
                            </Button>
                        )}
                    </span>
                );
            })}
            {props.allowCreate && (
                <Button
                    size="icon"
                    variant="secondary"
                    onClick={createEntry}
                    className="w-full"
                >
                    <Plus />
                </Button>
            )}
        </div>
    );
};
