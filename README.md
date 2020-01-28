<div align="center">
    <h1>wafer-bw/dntd</h1>
    <p>Tag-based plaintext journaling CLI tool with a slight feature focus on DnD and other tabletop RPGs.</p>
    <img src="https://img.shields.io/badge/node-v12.10.0-blue">
    <img src="https://img.shields.io/badge/npm-v6.13.6-blue">
    <img src="https://img.shields.io/badge/typescript-3.7.3-blue">
    <a href="https://github.com/wafer-bw/dnted/blob/master/LICENSE" target="_blank"><img src="https://img.shields.io/badge/license-MIT-blue.svg"/></a><br>
    <img src="https://github.com/wafer-bw/dntd/workflows/Build/badge.svg">
    <img src="./badges/coverage_badge.svg">
</div>

## Features
* **Inline tagging** - Tags can be added anywhere in a journal entry.
* **Key-value pair tagging** - Better organization and categorization.
* **Prefixes & suffixes** - Configure prefix & suffixes to apply to your entries.
* **Custom datestamps** - Inject your homebrew calendar into entry timestamps.
* **Search** - Search & filter for text or tags.
* **Aggregation** - Aggregate results for a tag key by tag values.
* **Terminal editors** - Use editors like `vi` or `nano` to add entries.
* **Plaintext** - Your journals are saved as `.txt` files.

## Setup
```bash
git clone git@github.com:wafer-bw/dntd.git
cd dntd
npm run setup
```

## Usage Examples
_Note - In the usage examples below the timestamp which prepends each printed entry is ommited in most cases for simplicity's sake._

#### List all available commands
```bash
dntd --help
```

#### Add an entry to your journal
```bash
dntd My first journal entry!
```

### Tags
* All tags can be used inline within your entry text, and an entry can have as many tags as you'd like.
* Tags are identified by an `@` symbol.
* Tags can contain letters, digits, underscores, dashes, and apostrophes.
* Separate a key-value pair tag's key and value with a `:`.
* Tags and their parts are identified by the following regex pattern:
    ```
    /\@([\w-']+)+(:)?([\w-']+)?/g
    ```

#### Add an entry with a simple tag
```bash
dntd Accepted a new @quest, the party must find the holy grail.
```

#### Add an entry with a key-value pair tag
```bash
dntd Purchased a new @item:The_Scroll_of_Truth.
```

### Filter

#### View the first n and/or last n entries in your journal
```bash
dntd -f 2
#> My first journal entry!
#> My second journal entry!

dntd -l 2
#> My second journal entry!
#> My third journal entry, with a @tag!

dntd -f 1 -l 2
#> My first journal entry!
#> My second journal entry!
#> My third journal entry, with a @tag!
```

#### View entries excluding those which contain provided text or tags
```bash
dntd -x second third
#> My first journal entry!

dntd -x @tag
#> My first journal entry!
#> My second journal entry!
```

### Search

#### AND Search - return entries which include _every_ provided word or tag
```bash
dntd -a weapons purchased
#> Purchased weapons from @shop:The_Pointy_End.
#> Purchased weapons from @shop:The_Heavy_End.

dntd -a @tag
#> My third journal entry, with a @tag!

dntd -a @shop
#> Purchased weapons from @shop:The_Heavy_End.
#> Purchased weapons from @shop:The_Pointy_End.

dntd -a @shop:The_Heavy_End
#> Purchased weapons from @shop:The_Heavy_End.
```

#### OR Search - return entries which include _at least one_ of the provided words or tags
```bash
dntd -o purchased sold
#> Purchased weapons from @shop:The_Heavy_End.
#> Sold weapons to @npc:Terry_The_Terrible.
#> Sold potions to @npc:Terry_The_Terrible.
#> Purchased weapons from @shop:The_Pointy_End.
```

#### Aggregate entries into groups per tag value by provided tag key
```bash
dntd -A npc
#> Aggregated by "npc"
#> 
#> Terry_The_Terrible:
#> Sold weapons to @npc:Terry_The_Terrible.
#> Sold potions to @npc:Terry_The_Terrible.
#> 
#> Boblin_The_Goblin:
#> Spoke with @npc:Boblin_The_Goblin about shiny things.
```

### Combining search & filter arguments
Search arguments (`-a`, `-o`, `-A`) and filter arguments (`-x`, `-f`, `-l`) can all be used together. Each argument will simply reduce the results down to matching entries only.
```bash
dntd -a textA @tagA -o textB @tagB -x textC @tagC -f 2 -l 2 -A tagA
```

The order they will be evaluated is:
1. Exclude
2. And
3. Or
4. First & Last
5. Aggregation

### Writing

#### Compose a single-line entry
```bash
dntd My entry text
```

#### Compose a multi-line entry
```bash
dntd
#> Compose your entry line by line below. Press Enter then CTRL-D to finish.
```

#### Configure/set your terminal editor of choice
```bash
dntd -E "vi"
# or:
dntd -E "nano -L"
```

#### Compose an entry within your configured editor
```bash
dntd -c
# At this point your editor will open; save & exit to add the entry to your journal.
```

#### Open your entire journal for editing with your configured editor
```bash
dntd -e
# At this point your editor will open your journal for editing.
```

#### Write to a non-default journal
* If the journal does not exist it will be created.
* `dntd` will always write to your default journal unless you specify a different one with `-j <journalname>`
```bash
dntd -j mysecondjournal This is my first entry.
```

#### Change default journal
```bash
dntd -D mysecondjournal
dntd -LS
#> Config: /path/to/dntd/config.yml
#> Journals:
#> - myjournal @ /path/to/dntd/myjournal.txt
#> - mysecondjournal @ /path/to/dntd/mysecondjournal.txt (default)
```

### Custom timestamps
* Minutes and Hours will always use local time
* Custom date tags must match this regex pattern:
    ```
    / ?\@cdate:[\d-]+ ?/
    ```

#### Override the timestamp of an entry with a custom date
```bash
dntd This uses a normal timestamp.
dntd I designed my very own calendar and I can use it here @cdate:12020-01-20.
dntd -l 2
#> [2020-01-20 21:00] This uses a normal timestamp.
#> [12020-01-20 21:00] I designed my very own calendar and I can use it here.
```

### Prefix & suffixes

#### Set your journal's prefix or suffix
```bash
dntd -P "@session:23 "
dntd -S " @playing_as:Hoblin_the_Goblin"
```

#### Edit your journal's prefix or suffix with your configured editor
```bash
dntd -eP
dntd -eS
```

#### View your journal's configured prefix or suffix
```bash
dntd -P
#> mysecondjournal prefix is:
#> "@session:23 "

dntd -S
#> mysecondjournal suffix is:
#> " @playing_as:Hoblin_the_Goblin"

dntd Entry with prefix and suffix!
dntd -l 1
#> @session:23 Entry with prefix and suffix! @playing_as:Hoblin_the_Goblin
```

### Misc

#### List all tags including their frequency within the journal
```bash
dntd -t
#> @npc:Terry_The_Terrible (2)
#> @npc:Boblin_The_Goblin (1)
#> @shop:The_Pointy_End (1)
#> @shop:The_Heavy_End (1)
#> @tag (1)
```

#### List config and each journals' location
```bash
dntd -LS
#> Config: /path/to/dntd/config.yml
#> Journals:
#> - myjournal @ /path/to/dntd/myjournal.txt (default)
#> - mysecondjournal @ /path/to/dntd/mysecondjournal.txt
```

#### View contents of your configuration (`config.yml`) file
```bash
dntd -C
#> journals:
#>   myjournal:
#>     path: /path/to/dntd/myjournal.txt
#>     suffix: ""
#>     prefix: hello oohh
#>   mysecondjournal:
#>     path: /path/to/dntd/mysecondjournal.txt
#>     suffix: ""
#>     prefix: ""
#> editor: vi
#> defaultJournal: mysecondjournal
```

#### Open your config file for editing with your current configured editor
```bash
dntd -eC
# At this point your editor will open your config for editing.
```

## Caveats
Some special characters can cause issues or will not be accepted like you may expect if you are not used to working in the command line:
```bash
dntd "Using characters like ', #, and & means you must wrap the entry text in quotation marks."
```
```
dntd Characters like \', \#, \", \&.
```

## Inspiration
* [jrnl-org/jrnl](https://github.com/jrnl-org/jrnl)
* [michaellee/ntbk](https://github.com/michaellee/ntbk)
