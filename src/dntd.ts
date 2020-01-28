#!/usr/bin/env node

import argparse from "argparse"
import { version } from "../package.json"
import { Journal, Config } from "./classes"
import { getMultilineInput, getEditorInput, Args } from "./helpers"

process.on("uncaughtException", error => {
    console.error(`${error.message}`);
    process.exit(1);
});

process.on("unhandledRejection", error => {
    console.error(`${error}`);
    process.exit(1);
});

const parser = new argparse.ArgumentParser({
    version: version,
    addHelp: true,
    description: "dntd - If no arguments are provided you will be prompted to input your entry text one line at a time."
})

parser.addArgument(["-j", "--journal"], {
    action: "store",
    help: "Name of journal to write to. Omit to write to default journal."
})

parser.addArgument(["entry"], {
    action: "store",
    nargs: "*",
    help: "If no optional arguments are provided, but text is, the text will be captured as an entry."
})

parser.addArgument(["-LS", "--list"], {
    action: "storeTrue",
    help: "List your journals."
})

parser.addArgument(["-t", "--tags"], {
    action: "storeTrue",
    help: "List all tags used in the selected journal."
})

parser.addArgument(["-e", "--edit"], {
    action: "storeTrue",
    help: "Edit your entire journal with configured editor."
})

parser.addArgument(["-c", "--compose"], {
    action: "storeTrue",
    help: "Compose an entry with configured editor."
})

parser.addArgument(["-a", "--and"], {
    action: "store",
    nargs: "+",
    type: "string",
    help: "Filter entries to include provided tags using AND."
})

parser.addArgument(["-o", "--or"], {
    action: "store",
    nargs: "+",
    type: "string",
    help: "Filter entries to include provided tags using OR."
})

parser.addArgument(["-x", "--exclude"], {
    action: "store",
    nargs: "+",
    type: "string",
    help: "Filter out selected entries with provided tags using AND."
})

parser.addArgument(["-f", "--first"], {
    action: "store",
    help: "Filter entries to the first N number of entries.",
    type: "int"
})

parser.addArgument(["-l", "--last"], {
    action: "store",
    type: "int",
    help: "Filter entries to the last N number of entries."
})

parser.addArgument(["-P", "--prefix"], {
    action: "store",
    nargs: "*",
    help: "Get or set prefix for selected/default journal. Use -eP to edit prefix with configured editor."
})

parser.addArgument(["-S", "--suffix"], {
    action: "store",
    nargs: "*",
    help: "Get or set suffix for selected/default journal. Use -eS to edit suffix with configured editor."
})

parser.addArgument(["-D", "--defaultJournal"], {
    action: "store",
    nargs: "*",
    help: "Get or set default journal. Use -eD to edit default journal with configured editor."
})

parser.addArgument(["-E", "--editor"], {
    action: "store",
    nargs: "*",
    help: "Get or set editor. Use -eE to edit editor with configured editor."
})

parser.addArgument(["-C", "--config"], {
    action: "store",
    nargs: "*",
    help: "Get config. Use -eC to edit config with configured editor."
})

parser.addArgument(["-A", "--aggregate"], {
    action: "store",
    type: "string",
    help: "Aggregate/group list/search results by the provided tag key."
})

function hasSearchArgs(args: any): boolean {
    if (args.and || args.or || args.exclude || args.first || args.last || args.aggregate) {
        return true
    }
    return false
}

async function main(): Promise<void> {
    const args: Args = parser.parseArgs()
    const config: Config = new Config()
    const journal: Journal = new Journal(args.journal, config)

    if (args.config && !args.edit) {
        // Config - GET
        console.log(config.read())
    } else if (args.config && args.edit) {
        // Config - SET via editor
        config.write(getEditorInput(config, config.read()))
    } else if (args.defaultJournal && args.defaultJournal.length === 0 && !args.edit) {
        // Default journal - GET
        console.log(config.defaultJournal)
    } else if (args.defaultJournal && args.edit) {
        // Default journal - SET via editor
        config.updateDefaultJournal(getEditorInput(config, config.defaultJournal))
    } else if (args.defaultJournal) {
        // Default journal - SET via args
        config.updateDefaultJournal(args.defaultJournal.join(""))
    } else if (args.editor && args.editor.length === 0 && !args.edit) {
        // Editor - GET
        console.log(`Editor: "${config.editor}"`)
    } else if(args.editor && args.edit) {
        // Editor - SET via editor
        config.updateEditor(getEditorInput(config, config.editor))
    } else if(args.editor) {
        // Editor - SET via args
        config.updateEditor(args.editor.join(" "))
    } else if (args.prefix && args.prefix.length === 0 && !args.edit) {
        // Prefix - GET
        console.log(`${journal.name} prefix is:\n"${journal.prefix}"`)
    } else if (args.prefix && args.edit) {
        // Prefix - SET via editor
        journal.prefix = getEditorInput(config, journal.prefix)
    } else if (args.prefix) {
        // Prefix - SET via args
        journal.prefix = args.prefix.join(" ")
    } else if (args.suffix && args.suffix.length === 0 && !args.edit) {
        // Suffix - GET
        console.log(`${journal.name} suffix is:\n"${journal.suffix}"`)
    } else if (args.suffix && args.edit) {
        // Suffix - SET via editor
        journal.suffix = getEditorInput(config, journal.suffix)
    } else if (args.suffix) {
        // Suffix - SET via args
        journal.suffix = args.suffix.join(" ")
    } else if (args.list) {
        // List all journals
        config.printJournals()
    } else if (args.tags && !hasSearchArgs(args)) {
        // List all tags
        journal.readTags()
    } else if (hasSearchArgs(args)) {
        // List all (filtered) entries
        journal.readEntries(args)
    } else if (args.edit) {
        // Open entire journal for editing
        journal.edit()
    } else if (args.compose) {
        // Compose entry in editor
        journal.write(getEditorInput(config))
    } else if (args.entry.length && !args.entry[0].startsWith("-")) {
        // Single-line entry
        journal.write(args.entry.join(" "))
     } else {
        // Multi-line entry
        journal.write(await getMultilineInput())
    }
}

main()
