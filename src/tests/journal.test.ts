import Sandbox from "./Sandbox"

describe("Journal", () => {

    test("Custom Date Tagging", async () => {
        let sandbox = new Sandbox("custom-date-tagging")
        sandbox.spinup()
        sandbox.args.first = 5
        sandbox.journal.write("This entry will use the normal timestamp.")
        sandbox.journal.write("This entry will have it's timestamp YYYY-MM-DD replaced with @cdate:1000-10-10.")
        await sandbox.journal.readEntries(sandbox.args)
        sandbox.teardown()
        expect(sandbox.journal.entries.length).toEqual(2)
        expect(sandbox.journal.entries[1].raw).toContain("1000-10-10")
    })

    test("Repeated tags", async () => {
        let sandbox = new Sandbox("custom-date-tagging")
        sandbox.spinup()
        sandbox.args.first = 5
        sandbox.journal.write("This has multiple simple @tags @tags")
        sandbox.journal.write("This has multiple complex @complex:tags @complex:tags")
        sandbox.journal.write("This has multiple simple @tags")
        sandbox.journal.write("This has multiple complex @complex:tags @complex:tags")
        await sandbox.journal.readEntries(sandbox.args)
        sandbox.teardown()
        expect(sandbox.journal.entries.length).toEqual(4)
        expect(sandbox.journal.tags["@tags"].frq).toEqual(3)
        expect(sandbox.journal.tags["@complex:tags"].frq).toEqual(4)
    })

    test("Suffix and Prefix", async () => {
        let sandbox = new Sandbox("suffix-and-prefix")
        sandbox.journal.suffix = " suffix"
        sandbox.journal.prefix = "prefix "
        sandbox.journal.write("This is a test entry")
        await sandbox.journal.open()
        sandbox.teardown()
        expect(sandbox.journal.suffix).toEqual(" suffix")
        expect(sandbox.journal.prefix).toEqual("prefix ")
        expect(sandbox.journal.entries[0].raw).toContain("prefix")
        expect(sandbox.journal.entries[0].raw).toContain("suffix")
    })

    test("Empty Entry Error Caught", async () => {
        let sandbox = new Sandbox("empty-entry-error-caught")
        let err = null
        try {
            sandbox.journal.write("")
        } catch(e) {
            err = e
        }
        await sandbox.journal.open()
        sandbox.teardown()
        expect(err).toBeDefined()
        expect(sandbox.journal.entries.length).toEqual(0)
    })

    test("Read Tags", async () => {
        let sandbox = new Sandbox("read-tags")
        sandbox.journal.write("This is a @test.")
        sandbox.journal.write("This is a @test.")
        sandbox.journal.write("This is a @test, @hello, @tick:tock.")
        sandbox.journal.write("@tick:tock.")
        await sandbox.journal.readTags()
        sandbox.teardown()
        expect(sandbox.journal.tags["@test"].frq).toEqual(3)
        expect(sandbox.journal.tags["@hello"].frq).toEqual(1)
        expect(sandbox.journal.tags["@tick:tock"].frq).toEqual(2)
        
    })

    test("Read Entries", async () => {
        let sandbox = new Sandbox("read-entries")
        sandbox.journal.write("This is a TEST entry.")
        await sandbox.journal.open()
        sandbox.teardown()
        expect(sandbox.journal.entries[0].raw).toContain("This is a TEST entry.")
        expect(sandbox.journal.entries[0].low).toContain("this is a test entry.")
        expect(sandbox.journal.entries[0].toString()).toContain("This is a TEST entry.")
        
    })

    test("Search Entries - AND", async () => {
        let sandbox = new Sandbox("search-entries-and")
        sandbox.args.and = ["some", "@tags"]
        sandbox.journal.write("This sample has @tags, @tags, @tags.")
        sandbox.journal.write("This sample has some @tags, @tags, @tags.")
        sandbox.journal.write("This sample has no tags.")
        
        await sandbox.journal.readEntries(sandbox.args)
        sandbox.teardown()
        expect(sandbox.journal.entries.length).toEqual(1)
        
    })

    test("Search Entries - AND COMPLEX", async () => {
        let sandbox = new Sandbox("search-entries-and-complex")
        sandbox.args.and = ["some", "@complex:tags"]
        sandbox.journal.write("This sample has @complex:tags, @tags, @tags.")
        sandbox.journal.write("This sample has some @complex:tags, @tags, @tags.")
        sandbox.journal.write("This sample has no tags.")
        await sandbox.journal.readEntries(sandbox.args)
        sandbox.teardown()
        expect(sandbox.journal.entries.length).toEqual(1)
        
    })

    test("Search Entries - OR", async () => {
        let sandbox = new Sandbox("search-entries-or")
        sandbox.args.or = ["some", "@tags"]
        sandbox.journal.write("This sample has @tags, @tags, @tags.")
        sandbox.journal.write("This sample has some @tags, @tags, @tags.")
        sandbox.journal.write("This sample has no tags.")
        await sandbox.journal.readEntries(sandbox.args)
        sandbox.teardown()
        expect(sandbox.journal.entries.length).toEqual(2)
        
    })

    test("Search Entries - EXCLUDE", async () => {
        let sandbox = new Sandbox("search-entries-exclude")
        sandbox.args.exclude = ["some", "@tags"]
        sandbox.journal.write("This sample has @tags, @tags, @tags.")
        sandbox.journal.write("This sample has some @tags, @tags, @tags.")
        sandbox.journal.write("This sample has no tags.")
        await sandbox.journal.readEntries(sandbox.args)
        sandbox.teardown()
        expect(sandbox.journal.entries.length).toEqual(1)
        expect(sandbox.journal.entries[0].raw).toContain("This sample has no tags.")
    })

    test("Search Entries - LAST", async () => {
        let sandbox = new Sandbox("search-entries-last")
        sandbox.args.last = 1
        sandbox.journal.write("This sample has @tags, @tags, @tags.")
        sandbox.journal.write("This sample has some @tags, @tags, @tags.")
        sandbox.journal.write("This sample has no tags.")
        await sandbox.journal.readEntries(sandbox.args)
        sandbox.teardown()
        expect(sandbox.journal.entries.length).toEqual(1)
        expect(sandbox.journal.entries[0].raw).toContain("This sample has no tags.")
    })

    test("Search Entries - FIRST", async () => {
        let sandbox = new Sandbox("search-entries-first")
        sandbox.args.first = 2
        sandbox.journal.write("This sample has @tags, @tags, @tags.")
        sandbox.journal.write("This sample has some @tags, @tags, @tags.")
        sandbox.journal.write("This sample has no tags.")
        await sandbox.journal.readEntries(sandbox.args)
        sandbox.teardown()
        expect(sandbox.journal.entries.length).toEqual(2)
        expect(sandbox.journal.entries[0].raw).toContain("This sample has @tags, @tags, @tags.")
        expect(sandbox.journal.entries[1].raw).toContain("This sample has some @tags, @tags, @tags.")
    })

    test("Search Entries - MULTI", async () => {
        let sandbox = new Sandbox("search-entries-multi")
        sandbox.args.first = 2
        sandbox.args.last = 2
        sandbox.args.or = ["@more:", "@complex:tags"]
        sandbox.args.exclude = ["@exclude"]
        sandbox.journal.write("This sample has @tags, @tags, @tags.")
        sandbox.journal.write("This sample has some @tags, @tags, @tags.")
        sandbox.journal.write("This sample has some @complex:tags, @more:tags, @tags.")
        sandbox.journal.write("This sample has no tags.")
        sandbox.journal.write("This sample has some @more:tags, @tags, @tags, @tags.")
        sandbox.journal.write("This Zample has some @more:tags.")
        sandbox.journal.write("This Zample has some @more:tags.")
        sandbox.journal.write("This sample has some @more:tags.")
        sandbox.journal.write("This sample has some @more:tags.")
        await sandbox.journal.readEntries(sandbox.args)
        sandbox.teardown()
        expect(sandbox.journal.entries.length).toEqual(4)
        expect(sandbox.journal.entries[0].raw).toContain("more")
        expect(sandbox.journal.entries[1].raw).toContain("sample")
        expect(sandbox.journal.entries[2].raw).toContain("sample")
        expect(sandbox.journal.entries[3].raw).toContain("sample")
    })

    test("Search Entries - No First/Last filter Last Overflow", async () => {
        let sandbox = new Sandbox("search-entries-firstlastoverflow-last")
        sandbox.args.first = 1
        sandbox.args.last = 5
        sandbox.journal.write("This sample has some @more:tags.")
        sandbox.journal.write("This sample has some @more:tags.")
        sandbox.journal.write("This sample has some @more:tags.")
        sandbox.journal.write("This sample has some @more:tags.")
        await sandbox.journal.readEntries(sandbox.args)
        sandbox.teardown()
        expect(sandbox.journal.entries.length).toEqual(4)
    })

    test("Search Entries - No First/Last filter First Overflow", async () => {
        let sandbox = new Sandbox("search-entries-firstlastoverflow-first")
        sandbox.args.first = 5
        sandbox.args.last = 1
        sandbox.journal.write("This sample has some @more:tags.")
        sandbox.journal.write("This sample has some @more:tags.")
        sandbox.journal.write("This sample has some @more:tags.")
        sandbox.journal.write("This sample has some @more:tags.")
        await sandbox.journal.readEntries(sandbox.args)
        sandbox.teardown()
        expect(sandbox.journal.entries.length).toEqual(4)
    })

    test("Search Entries - No First/Last filter Both Overflow", async () => {
        let sandbox = new Sandbox("search-entries-firstlastoverflow-first-last")
        sandbox.args.first = 5
        sandbox.args.last = 5
        sandbox.journal.write("This sample has some @more:tags.")
        sandbox.journal.write("This sample has some @more:tags.")
        sandbox.journal.write("This sample has some @more:tags.")
        sandbox.journal.write("This sample has some @more:tags.")
        await sandbox.journal.readEntries(sandbox.args)
        sandbox.teardown()
        expect(sandbox.journal.entries.length).toEqual(4)
    })

    test("Search Entries - No First filter Overflow", async () => {
        let sandbox = new Sandbox("search-entries-first-overflow")
        sandbox.spinup()
        sandbox.args.first = 5
        sandbox.journal.write("This sample has some @more:tags.")
        sandbox.journal.write("This sample has some @more:tags.")
        sandbox.journal.write("This sample has some @more:tags.")
        sandbox.journal.write("This sample has some @more:tags.")
        await sandbox.journal.readEntries(sandbox.args)
        sandbox.teardown()
        expect(sandbox.journal.entries.length).toEqual(4)
    })

    test("Search Entries - No Last filter Overflow", async () => {
        let sandbox = new Sandbox("search-entries-last-overflow")
        sandbox.spinup()
        sandbox.args.last = 5
        sandbox.journal.write("This sample has some @more:tags.")
        sandbox.journal.write("This sample has some @more:tags.")
        sandbox.journal.write("This sample has some @more:tags.")
        sandbox.journal.write("This sample has some @more:tags.")
        await sandbox.journal.readEntries(sandbox.args)
        sandbox.teardown()
        expect(sandbox.journal.entries.length).toEqual(4)
    })

    test("Aggregate Entries - Just Aggregate", async () => {
        let sandbox = new Sandbox("aggregate-entries-just-aggregate")
        sandbox.spinup()
        sandbox.args.aggregate = "person"
        sandbox.journal.write("@person:John_Smith has 2 apples.")
        sandbox.journal.write("@person:John_Smith hates his name @person:John_Smith.")
        sandbox.journal.write("@person:Jane_Doe has 5 apples.")
        sandbox.journal.write("A tag that is @not_a_person:tag in case.")
        sandbox.journal.write("@person:John_Smith picked 2 more apples.")
        sandbox.journal.write("@person:Boblin_the_Goblin is tired.")
        sandbox.journal.write("@person:Jane_Doe ate 2 apples.")
        await sandbox.journal.readEntries(sandbox.args)
        sandbox.teardown()
        expect(Object.keys(sandbox.journal.aggregate).length).toEqual(3)
        expect(sandbox.journal.aggregate["John_Smith"].length).toEqual(3)
        expect(sandbox.journal.aggregate["Jane_Doe"].length).toEqual(2)
        expect(sandbox.journal.aggregate["Boblin_the_Goblin"].length).toEqual(1)
    })

    test("Aggregate Entries - With Filters", async () => {
        let sandbox = new Sandbox("aggregate-entries-with-filters")
        sandbox.spinup()
        sandbox.args.aggregate = "person"
        sandbox.args.and = ["@info"]
        sandbox.journal.write("@person:John_Smith has 2 apples. @info")
        sandbox.journal.write("@person:John_Smith hates his name @person:John_Smith. @info")
        sandbox.journal.write("@person:Jane_Doe has 5 apples. @info")
        sandbox.journal.write("A tag that is @not_a_person:tag in case.")
        sandbox.journal.write("@person:John_Smith picked 2 more apples.")
        sandbox.journal.write("@person:Boblin_the_Goblin is tired.")
        sandbox.journal.write("@person:Jane_Doe ate 2 apples.")
        await sandbox.journal.readEntries(sandbox.args)
        sandbox.teardown()
        expect(Object.keys(sandbox.journal.aggregate).length).toEqual(2)
        expect(sandbox.journal.aggregate["John_Smith"].length).toEqual(2)
        expect(sandbox.journal.aggregate["Jane_Doe"].length).toEqual(1)
        expect(sandbox.journal.aggregate["Boblin_the_Goblin"]).toBeUndefined
    })

})
