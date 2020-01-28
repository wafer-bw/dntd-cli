import fs from "fs"
import readline from "readline"
import { Tag } from "../classes"
import { tagPattern, defaultDatePattern } from "./patterns"

export function hasTimestamp(line: string): boolean {
    if (line.match(defaultDatePattern) === null) {
        return false
    } else {
        return true
    }
}

export function getTag(text: string): Tag | null {
    let match = tagPattern.exec(text)
    tagPattern.exec("") // Reset exec
    if (match) {
        return new Tag(match[0], match[1], match[3])
    }
    return null
}

export function getTags(text: string): Tag[] {
    let tags: Tag[] = []
    let matches = text.matchAll(tagPattern)
    for (let match of matches) {
        tags.push(new Tag(match[0], match[1], match[3]))
    }
    return tags
}

export async function* genEntryText(path: string): AsyncGenerator<string, void, undefined> {
    let text = ""
    let fileStream = fs.createReadStream(path)
    let rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity })
    for await (let line of rl) {
        if (hasTimestamp(line)) {
            if (text !== "") {
                yield text
            }
            text = `${line}\n`
        } else {
            text += `${line}\n`
        }
    }
    if (text !== "") {
        yield text
    }
}
