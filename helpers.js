import { writeFile, readFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Save Objects as JSON under given name.
 * 
 * @param {String} name Name under which data gets saved
 * @param {Object} json JavaScript Object
 * @returns {Boolean} Return true when saving succeeds
 */
export const saveJson = async (name, json) => {
    const savePath = join(__dirname, "data", name + ".json")
    await writeFile(
        savePath,
        JSON.stringify(json, null, 2),
        { encoding: "utf-8" }
    );
    return true
}

/**
 * Get saved JSON as Object, if available
 * 
 * @param {String} name Name of File
 * @returns {Object} JSON parsed as Object
 */
export const getJson = async (name) => {
    const savePath = join(__dirname, "data", name + ".json")
    try {
        const savedFile = await readFile(savePath, { encoding: "utf-8" })
        return JSON.parse(savedFile);
    } catch (err) {
        return null
    }
}

export const priceToCent = (price) => {
    return parseInt(String(price).replace(".", ""))
}