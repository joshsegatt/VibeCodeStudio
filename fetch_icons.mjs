import fs from 'fs';
import https from 'https';
import path from 'path';

// Using reliable external sources for placeholders
const sources = {
    "icon.ico": "https://www.google.com/favicon.ico", // Valid ICO
    "32x32.png": "https://placehold.co/32x32.png",
    "128x128.png": "https://placehold.co/128x128.png",
    "128x128@2x.png": "https://placehold.co/256x256.png",
    "icon.icns": "https://raw.githubusercontent.com/tauri-apps/tauri/dev/app-template/src-tauri/icons/icon.icns" // Hope this one works or we skip
};

const targetDir = path.join("src-tauri", "icons");

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

Object.entries(sources).forEach(([filename, url]) => {
    const filePath = path.join(targetDir, filename);
    const file = fs.createWriteStream(filePath);

    https.get(url, response => {
        if (response.statusCode !== 200) {
            console.error(`Failed to download ${filename} from ${url}: Status ${response.statusCode}`);
            response.resume();
            fs.unlink(filePath, () => { });
            return;
        }

        response.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log(`Downloaded ${filename}`);
        });
    }).on('error', err => {
        fs.unlink(filePath, () => { });
        console.error(`Error downloading ${filename}: ${err.message}`);
    });
});
