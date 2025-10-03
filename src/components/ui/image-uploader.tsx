'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/react';
import { Camera, LoaderCircle, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useRef } from 'react';

interface ImageUploadProps {
    currentImageUrl?: string;
    uploadType: 'profile' | 'banner' | 'project' | 'award';
    onImageChange: (imageUrl: string | null) => void;
    className?: string;
    disabled?: boolean;
}

export function ImageUpload({ currentImageUrl, uploadType, onImageChange, className, disabled = false }: ImageUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const generateUploadUrl = uploadType === 'project' || uploadType === 'award' ? api.projects.generateUploadUrl.useMutation() : api.candidates.generateUploadUrl.useMutation();

    const handleFileSelect = useCallback(
        async (file: File) => {
            if (!file) return;

            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }

            try {
                //Generate presigned URL
                const uploadData = await generateUploadUrl.mutateAsync({
                    fileType: file.type,
                    fileSize: file.size,
                    uploadType,
                });

                //Upload to S3
                const formData = new FormData();
                Object.entries(uploadData.fields).forEach(([key, value]) => {
                    formData.append(key, value);
                });
                formData.append('file', file);

                const uploadResponse = await fetch(uploadData.uploadUrl, {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadResponse.ok) {
                    const errorText = await uploadResponse.text();
                    console.error('S3 Upload Error:', errorText);
                    throw new Error('Upload failed');
                }

                //Update the image URL
                onImageChange(uploadData.fileUrl);
            } catch (error) {
                console.error('Upload error:', error);
                alert('Failed to upload image. Please try again.');
            }
        },
        [generateUploadUrl, onImageChange, uploadType]
    );

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            void handleFileSelect(file);
        }
        event.target.value = '';
    };

    const handleRemove = () => {
        onImageChange(null);
    };

    const isUploading = generateUploadUrl.isPending;
    const isProfileUpload = uploadType === 'profile';

    return (
        <div className={'relative group'}>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={disabled || isUploading}
            />

            <div
                className={cn('relative overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer', className, currentImageUrl && 'border-solid border-gray-200', disabled && 'opacity-50 cursor-not-allowed')}
                onClick={!disabled ? handleButtonClick : undefined}
            >
                {currentImageUrl ? (
                    <>
                        <Image
                            src={currentImageUrl}
                            alt={`${uploadType} image`}
                            {...(isProfileUpload ? { width: 100, height: 100 } : { fill: true })}
                            objectFit="cover"
                        />
                        {!disabled && (
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove();
                                }}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        {isUploading ? (
                            <LoaderCircle className="h-6 w-6 animate-spin" />
                        ) : (
                            <>
                                <Camera className="h-6 w-6 mb-2" />
                                <span className="text-sm text-center px-2">Upload Photo</span>
                            </>
                        )}
                    </div>
                )}
            </div>

            {isUploading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                    <LoaderCircle className="h-6 w-6 animate-spin text-blue-600" />
                </div>
            )}
        </div>
    );
}
