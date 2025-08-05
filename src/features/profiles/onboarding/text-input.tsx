import { cn } from '@/lib/utils';
import type { StandardSchemaV1Issue } from '@tanstack/react-form';
import { useRef } from 'react';

export interface TextFieldProps {
    label: string;
    placeholder?: string;
    className?: string;
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    error?: string | StandardSchemaV1Issue;
}

export function TextField({ label, placeholder, className = '', value, onChange, onBlur, error }: TextFieldProps) {
    const focused = useRef(null);

    const e = typeof error === 'string' ? error : error?.message;

    return (
        <div className={`space-y-2 ${className}`}>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <input
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                ref={focused}
                placeholder={placeholder}
                className={cn('w-full outline-none border-b-1 focus:border-b-primary p-4 transition-all', error && 'border-red-400 ')}
            />
            {error && <p className="text-sm text-red-400">{e}</p>}
        </div>
    );
}
