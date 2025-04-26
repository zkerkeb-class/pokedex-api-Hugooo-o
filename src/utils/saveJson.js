import fs from 'fs';

export const saveJson = (data, filePath) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}