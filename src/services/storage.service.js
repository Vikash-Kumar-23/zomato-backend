const Imagekit = require('imagekit');

const imagekit = new Imagekit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

async function uploadFile(fileBuffer, fileName) {
    try {
        const result = await imagekit.upload({
            file: fileBuffer,
            fileName: fileName,
            folder: '/zomato/food-videos',
        });
        return result;
    } catch (error) {
        console.error('Error uploading file to ImageKit:', error);
        throw error;
    }
}

module.exports = {
    uploadFile
}
