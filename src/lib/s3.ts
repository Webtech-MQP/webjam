import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';

const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export async function deleteS3Object(key: string): Promise<void> {
    try {
        const command = new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: key,
        });
        await s3Client.send(command);
    } catch (error) {
        console.error('Failed to delete S3 object:', error);
    }
}

export function getS3KeyFromUrl(url: string): string | null {
    try {
        const bucketName = process.env.AWS_S3_BUCKET_NAME!;
        const region = process.env.AWS_REGION!;

        // Handle both formats:
        // https://bucket.s3.region.amazonaws.com/key
        // https://s3.region.amazonaws.com/bucket/key
        const patterns = [
            new RegExp(`https://${bucketName}\\.s3\\.${region}\\.amazonaws\\.com/(.+)`),
            new RegExp(`https://s3\\.${region}\\.amazonaws\\.com/${bucketName}/(.+)`)
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1] || null;
        }

        return null;
    } catch {
        return null;
    }
}

export { s3Client, createPresignedPost };