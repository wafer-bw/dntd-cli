import fs from "fs"
import path from "path"
import { Args } from "../helpers"
import { Config, Journal } from "../classes"

export default class Sandbox {
    public config!: Config
    public journal!: Journal
    public args!: Args
    private dir: string

    constructor (private testName: string, nojournalname?: boolean | undefined) {
        this.dir = path.join(__dirname, "data", ".config", testName)
        this.spinup(nojournalname)
    }

    public spinup(nojournalname?: boolean) {
        this.config = new Config(this.dir)
        if (nojournalname) {
            this.journal = new Journal(null, this.config)
        } else {
            this.journal = new Journal(this.testName, this.config)
        }
        this.args = {
            journal: null,
            entry: [],
            list: false,
            tags: false,
            edit: false,
            compose: false,
            and: null,
            or: null,
            exclude: null,
            first: null,
            last: null,
            prefix: null,
            suffix: null,
            defaultJournal: null,
            aggregate: null,
            editor: null,
            config: null
        }
    }

    public teardown() {
        for(let journal in this.config.journals) {
            try {
                fs.unlinkSync(path.join(this.config.dir, `${journal}.txt`))
            } catch(e) {}
        }
        try {
            fs.unlinkSync(this.config.path)
        } catch(e) {}
    }
}
