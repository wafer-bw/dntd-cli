import { Tag } from "./Tag"
import { Tags, getTags } from "../helpers"

export class Entry {

    public low: string
    public tags: Tags = {}

    constructor(public raw: string) {
        this.raw = this.raw.trim()
        this.low = this.raw.toLowerCase()
        getTags(raw).map(tag => this.addTag(tag))
    }

    public toString(): string {
        return this.raw
    }

    public print(): void {
        console.log(this.toString())
    }

    private addTag(tag: Tag): void {
        if (tag.raw in this.tags) {
            this.tags[tag.raw].frq! += 1
        } else {
            this.tags[tag.raw] = new Tag(tag.raw, tag.key, tag.val, 1)
        }
    }

}
