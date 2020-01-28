import { tagPattern, customDateTagPattern, defaultDatePattern } from "../helpers"

describe("Patterns", () => {

    test("No Tag Match", async () => {
        let match = tagPattern.exec("this is a sample tagless string")
        expect(match).toBeNull()
        tagPattern.exec("")
    })

    test("Simple Tag Match", async () => {
        let match = tagPattern.exec("this is a sample with a @tag.")
        expect(match).toBeTruthy()
        expect(match![0]).toEqual("@tag")
        expect(match![1]).toEqual("tag")
        expect(match![2]).toBeUndefined()
        expect(match![3]).toBeUndefined()
        tagPattern.exec("")
    })

    test("Complex Tag Match", async () => {
        let match = tagPattern.exec("this is a sample with a @complex:tag.")
        expect(match).toBeTruthy()
        expect(match![0]).toEqual("@complex:tag")
        expect(match![1]).toEqual("complex")
        expect(match![2]).toEqual(":")
        expect(match![3]).toEqual("tag")
        tagPattern.exec("")
    })

    test("No Date Tag Match", async () => {
        let match = customDateTagPattern.exec("this is a sample tagless string")
        expect(match).toBeNull()
        customDateTagPattern.exec("")

    })

    test("Date Tag Match", async () => {
        let match = customDateTagPattern.exec("this is a sample with a custom date tag @cdate:1000-100-10")
        expect(match).toBeTruthy()
        expect(match![0]).toEqual(" @cdate:1000-100-10")
        expect(match![1]).toBeUndefined()
        expect(match![2]).toBeUndefined()
        expect(match![3]).toBeUndefined()
        customDateTagPattern.exec("")
    })

    test("No Default Date Match", async () => {
        let match = defaultDatePattern.exec("2020-01-31 18:20 this is a sample without a valid datestamp.")
        expect(match).toBeNull()
        defaultDatePattern.exec("")
    })

    test("Default Date Match", async () => {
        let match = defaultDatePattern.exec("[2020-01-31 18:20] this is a sample with a valid datestamp.")
        expect(match).toBeTruthy()
        expect(match![0]).toEqual("[2020-01-31 18:20]")
        defaultDatePattern.exec("")
    })

})
