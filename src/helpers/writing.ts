import fs from "fs"
import path from "path"
import readline from "readline"
import { Config } from "../classes"
import { spawnSync } from "child_process"

export async function getMultilineInput(): Promise<string> {
    let lines: string[] = []
    console.log("Compose your entry line by line below. Press Enter then CTRL-D to finish.")
    let lineReader: readline.Interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true,
        historySize: 0
    })
    try {
        for await (let line of lineReader) {
            lines.push(line)
        }
    } catch(e) {
        throw Error("Did not capture multiline entry.")
    }
    return lines.join("\n")
}

export function getEditorInput(config: Config, initialContent?: string): string {
    let content = (initialContent) ? initialContent : ""
    let filepath = path.join(config.dir, "tmp.out")
    if (!config.editor) {
        throw Error(`Invalid editor set in config at ${config.path}`)
    }
    try {
        fs.writeFileSync(filepath, content, "utf-8")
        openEditor(config, filepath)
        content = fs.readFileSync(filepath, "utf-8")
        fs.unlinkSync(filepath)
    } catch(e) {
        throw Error("Did not capture entry from editor.")
    }
    return content
}

export function openEditor(config: Config, filepath: string): void {
    if (!config.editor) {
        throw Error(`Invalid editor set in config at ${config.path}`)
    }
    let argsArr = config.editor.split(" ")
    spawnSync(argsArr[0], argsArr.slice(1, argsArr.length).concat(filepath), { stdio: "inherit" })
}
