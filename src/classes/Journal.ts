import fs from "fs"
import { Config } from "./Config"
import { Tag, Entry } from "../classes"
import { openEditor, getTag, genEntryText, Args, Tags, Filter, getTags, localNow, customDateTagPattern, AggregatedEntries } from "../helpers"

export class Journal {

    public path: string
    public name: string
    public config: Config
    public entries: Entry[] = []
    public aggregate: AggregatedEntries = {}
    public tags: Tags = {}

    constructor(name: string | undefined | null, config: Config) {
        this.config = config
        this.name = (!name) ? config.defaultJournal : name
        config.ensureJournalExists(this.name)
        this.path = this.config.journals[this.name].path
        if (!fs.existsSync(this.path)) {
            fs.writeFileSync(this.path, "")
        }
    }

    public get suffix(): string {
        return this.config.journals[this.name].suffix
    }
    public set suffix(suffix: string) {
        this.config.journals[this.name].suffix = suffix
        this.config.write()
    }

    public get prefix(): string {
        return this.config.journals[this.name].prefix
    }
    public set prefix(prefix: string) {
        this.config.journals[this.name].prefix = prefix
        this.config.write()
    }

    public async readTags(): Promise<void> {
        await this.open()
        Object.keys(this.tags).map(key => { this.tags[key].print() })
    }

    public async readEntries(args: Args): Promise<void> {
        await this.open()
        this.search(args.and, args.or, args.exclude)
        this.slice(args.first, args.last)
        if (args.aggregate) {
            this.aggregateEntries(args.aggregate)
            this.printAggregate(args.aggregate)
        } else {
            this.printEntries()
        }
    }

    public write(text: string): void {
        fs.appendFileSync(this.path, this.transformInput(text))
    }

    public edit(): void {
        openEditor(this.config, this.path)
    }

    private slice(first: number | null, last: number | null): void {
        let firstEntries: Entry[] = []
        let lastEntries: Entry[] = []

        if (first !== null && last !== null && this.entries.length <= first + last) {
            return
        } else if (first !== null && this.entries.length <= first) {
            return
        } else if (last !== null && this.entries.length <= last) {
            return
        }

        if (first !== null) {
            firstEntries = this.entries.slice(0, first)
        }
        if (last !== null) {
            lastEntries = this.entries.slice(-last)
        }

        if (first !== null || last !== null) {
            this.entries = firstEntries.concat(lastEntries)
        }
    }

    public async open(): Promise<void> {
        for await (let text of genEntryText(this.path)) {
            let entry = new Entry(text)
            this.entries.push(entry)
            this.addTags(entry.tags)
        }
    }

    private printAggregate(aggregatedBy: string): void {
        console.log(`Aggregated by "${aggregatedBy}"`)
        for (let agg in this.aggregate) {
            console.log(`\n${agg}:`)
            this.aggregate[agg].map(entry => { entry.print() })
        }
    }

    private printEntries(): void {
        this.entries.map(entry => { entry.print() })
    }

    private search(ands: string[] | null, ors: string[] | null, excludes: string[] | null): void {
        this.excludeFilter(excludes)
        this.andFilter(ands)
        this.orFilter(ors)
    }

    private orFilter(ors: string[] | null): void {
        if (ors !== null) {
            let filters = this.getFilters(ors)
            this.entries = this.entries.filter(entry =>
                filters!.some(or => this.matchesFilter(entry, or))
            )
        }
    }

    private andFilter(ands: string[] | null): void {
        if (ands !== null) {
            let filters = this.getFilters(ands)
            this.entries = this.entries.filter(entry =>
                filters!.every(and => this.matchesFilter(entry, and))
            )
        }
    }

    private excludeFilter(excludes: string[] | null): void {
        if (excludes !== null) {
            let filters = this.getFilters(excludes)
            this.entries = this.entries.filter(entry =>
                !filters!.some(exclude => this.matchesFilter(entry, exclude))
            )
        }
    }

    private getFilters(rawFilters: string[]): Filter[] {
        return rawFilters.map(text => {
            return {
                text: text.toLowerCase(),
                tag: getTag(text)
            }
        })
    }

    private matchesFilter(entry: Entry, filter: Filter) {
        if (filter.tag && filter.tag.val) {
            return (entry.tags[filter.tag.raw]) ? true : false
        } else if (filter.tag && !filter.tag.val) {
            return Object.values(entry.tags).some(tag => tag.key === filter.tag!.key)
        } else {
            return entry.low.includes(filter.text)
        }
    }

    private addTags(tags: Tags): void {
        for (let k in tags) {
            let tag = tags[k]
            if (tag.raw in this.tags) {
                this.tags[k].frq! += tag.frq
            } else {
                this.tags[k] = new Tag(tag.raw, tag.key, tag.val, tag.frq)
            }
        }
    }

    public aggregateEntries(aggregateBy: string | null): void {
        if (aggregateBy !== null) {
            for (let entry of this.entries) {
                let tagValsUsed: string[] = []
                for (let k in entry.tags) {
                    let tag = this.tags[k]
                    if (tag.key !== aggregateBy || tag.val === null || tagValsUsed.includes(tag.val)) {
                        continue
                    }
                    if (!Object.keys(this.aggregate).includes(tag.val)) {
                        this.aggregate[tag.val] = []
                    }
                    this.aggregate[tag.val].push(entry)
                }
            }
        }
    }

    private transformInput(rawText: string): string {
        rawText = rawText.trim()
        if (rawText.length === 0) {
            throw Error("Can't write empty entry.")
        }

        let text = this.prefix.trimLeft() + rawText + this.suffix.trimRight()
        let dateTag = getTags(text).filter(t => t.key === "cdate")[0] || undefined
        let time = (dateTag) ? `${dateTag.val} ${localNow({ hhmmOnly: true })}` : localNow()
        text = text.replace(customDateTagPattern, "")

        let entry = `[${time}] ${text}\n`
        return entry
    }

}
