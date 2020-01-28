import fs from "fs"
import os from "os"
import path from "path"
import yaml from "yaml"
import { JournalConfig, ConfigObject } from "../helpers"

const appName = "dntd"

export class Config implements ConfigObject {

    public dir: string
    public path: string
    public editor!: string
    public defaultJournal!: string
    public journals: { [name: string]: JournalConfig } = {}
    private initialJournalName = "myjournal"

    constructor(testDir?: string) {
        this.dir = this.getConfigDir(testDir)
        this.path = path.join(this.dir, "config.yml")
        this.load()
    }

    public ensureJournalExists(name: string): void {
        if (!this.journals[name]) {
            this.addJournal(name)
        }
    }

    public printJournals(): void {
        console.log(`Config: ${this.path}`)
        console.log("Journals:")
        for (let journal in this.journals) {
            let txt = `- ${journal} @ ${this.journals[journal].path}`
            txt += (this.defaultJournal === journal) ? " (default)" : ""
            console.log(txt)
        }
    }

    public updateDefaultJournal(name: string): void {
        this.defaultJournal = name
        this.write()
    }

    public updateEditor(editor: string): void {
        this.editor = editor
        this.write()
    }

    public write(customContentInput?: string): void {
        if (customContentInput) {
            fs.writeFileSync(this.path, customContentInput)
            this.load()
        } else {
            fs.writeFileSync(this.path, yaml.stringify(this.toObj()))
            this.load()
        }
    }

    public read(): string {
        return fs.readFileSync(this.path, "utf-8")
    }

    private addJournal(name: string, isDefault?: boolean): void {
        this.journals[name] = {
            path: path.join(this.dir, `${name}.txt`),
            suffix: "",
            prefix: "",
        }
        if (isDefault) {
            this.defaultJournal = name
        }
        this.write()
    }

    public load(): void {
        this.ensureConfigExists()
        let conf = yaml.parse(fs.readFileSync(this.path, "utf-8"))
        this.journals = conf.journals
        this.editor = conf.editor
        this.defaultJournal = conf.defaultJournal
        this.ensureConfigValid()
    }

    private toObj(): ConfigObject {
        return {
            journals: this.journals,
            editor: this.editor,
            defaultJournal: this.defaultJournal
        }
    }

    private getConfigDir(testDir?: string): string {
        let dir = (process.platform === "win32") ?
            path.join(os.homedir(), "AppData", "Local", `${appName}`) :
            path.join(os.homedir(), ".config", `${appName}`)
        return (testDir) ? testDir : dir
    }

    private ensureConfigExists(): void {
        if (!fs.existsSync(this.dir)) {
            fs.mkdirSync(this.dir, { recursive: true })
        }
        if (!fs.existsSync(this.path)) {
            this.newInitialState()
            this.write()
        }
    }

    private ensureConfigValid(): void {
        if (Object.keys(this.journals).length === 0) {
            this.addJournal(this.initialJournalName, true)
        }
        if (!this.defaultJournal) {
            throw Error(`Default journal not set. Please configure: ${this.path}`)
        }
        if (!this.editor && this.editor !== "") {
            this.editor = ""
        }
    }

    private newInitialState() {
        this.editor = ""
        this.defaultJournal = this.initialJournalName
    }

}
