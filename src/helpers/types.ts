import { Tag, Entry } from "../classes"

export interface Args {
    journal: string | null
    entry: string[]
    list: boolean
    tags: boolean
    edit: boolean
    compose: boolean
    and: string[] | null
    or: string[] | null
    exclude: string[] | null
    first: number | null
    last: number | null
    prefix: string[] | null
    suffix: string[] | null
    defaultJournal: string[] | null
    aggregate: string | null
    editor: string[] | null
    config: string[] | null
}

export interface JournalConfig {
    path: string
    prefix: string
    suffix: string
}

export interface ConfigObject {
    journals: { [name: string]: JournalConfig }
    editor: string
    defaultJournal: string
}

export interface Tags {
    [ key: string ]: Tag
}

export interface Filter {
    text: string
    tag: Tag | null
}

export interface AggregatedEntries {
    [ key: string ]: Entry[]
}
