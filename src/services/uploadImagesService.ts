import { promises as fsPromises, createWriteStream, existsSync, unlink } from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { v2 } from 'cloudinary'
import { Readable } from 'stream'
const cloudinary = v2
const { writeFile } = fsPromises;


function writeStreamToFile(stream: Readable, filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const writableStream = createWriteStream(filePath);

        stream.pipe(writableStream);

        writableStream.on('finish', () => {
            resolve();
        });

        writableStream.on('error', (error) => {
            reject(error);
        });
    });
}

async function uploadImage({ file, arrayBuffer }: { file: { name: string }, arrayBuffer: Buffer }): Promise<string | undefined> {
    try {
        const filePath = path.join(process.cwd(), "src", "public", `${crypto.randomUUID()}-${file.name || "example.jpg"}`);
        await writeFile(filePath, arrayBuffer)

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        const result = await uploadToCloudinary(filePath);
        if (existsSync(filePath)) {
            unlink(filePath, (err) => {
                if (err) {
                    console.error('Error al eliminar el archivo:', err);
                }
            });
        } else {
            console.log('El archivo no existe.');
        }
        return result?.secure_url
    } catch (error) {
        console.error('Error al procesar la imagen:', error);
        throw new Error('Error al procesar la imagen: ' + error);
    }
}



async function uploadToCloudinary(filePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(filePath, (error, result) => {
            if (error) {
                console.error('Error al subir la imagen a Cloudinary:', error);
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

export default uploadImage;
