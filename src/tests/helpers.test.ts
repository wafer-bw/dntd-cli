import path from "path"
import { getTag, getTags, hasTimestamp, genEntryText, localNow } from "../helpers"

describe("Helpers", () => {

    test("Function: getTag - No Tag", async () => {
        let tag = getTag("this has no tag.")
        expect(tag).toBeNull()
    })

    test("Function: getTag  - Simple Tag", async () => {
        let tag = getTag("this has as simple @tag.")
        expect(tag!.raw).toEqual("@tag")
        expect(tag!.key).toEqual("tag")
        expect(tag!.val).toBeUndefined()
        expect(tag!.frq).toEqual(1)
    })

    test("Function: getTag  - Complex Tag", async () => {
        let tag = getTag("this has as @complex:tag.")
        expect(tag!.raw).toEqual("@complex:tag")
        expect(tag!.key).toEqual("complex")
        expect(tag!.val).toEqual("tag")
        expect(tag!.frq).toEqual(1)
    })

    test("Function: getTags - No Tag", async () => {
        let tag = getTags("this has no tag.")
        expect(tag).toEqual([])
    })

    test("Function: getTags  - 1 Simple Tag", async () => {
        let tag = getTags("this has as simple @tag.")
        expect(tag[0]!.raw).toEqual("@tag")
        expect(tag[0]!.key).toEqual("tag")
        expect(tag[0]!.val).toBeUndefined()
        expect(tag[0]!.frq).toEqual(1)
    })

    test("Function: getTags  - 1 Complex Tag", async () => {
        let tag = getTags("this has a @complex:tag.")
        expect(tag[0]!.raw).toEqual("@complex:tag")
        expect(tag[0]!.key).toEqual("complex")
        expect(tag[0]!.val).toEqual("tag")
        expect(tag[0]!.frq).toEqual(1)
    })

    test("Function: getTags  - 2 Simple Tag", async () => {
        let tag = getTags("this has as simple @tag and another @simple tag")
        expect(tag[0]!.raw).toEqual("@tag")
        expect(tag[0]!.key).toEqual("tag")
        expect(tag[0]!.val).toBeUndefined()
        expect(tag[0]!.frq).toEqual(1)
        expect(tag[1]!.raw).toEqual("@simple")
        expect(tag[1]!.key).toEqual("simple")
        expect(tag[1]!.val).toBeUndefined()
        expect(tag[1]!.frq).toEqual(1)
    })

    test("Function: getTags  - 2 Complex Tag", async () => {
        let tag = getTags("this has a @complex:tag, and another @key:val complex tag.")
        expect(tag[0]!.raw).toEqual("@complex:tag")
        expect(tag[0]!.key).toEqual("complex")
        expect(tag[0]!.val).toEqual("tag")
        expect(tag[0]!.frq).toEqual(1)
        expect(tag[1]!.raw).toEqual("@key:val")
        expect(tag[1]!.key).toEqual("key")
        expect(tag[1]!.val).toEqual("val")
        expect(tag[1]!.frq).toEqual(1)
    })

    test("Function: hasTimestamp - No timestamp", async () => {
        let res = hasTimestamp("this has no timestamp.")
        expect(res).toBeFalsy()
    })

    test("Function: hasTimestamp - With timestamp", async () => {
        let res = hasTimestamp("[2020-01-31 18:20] this has a timestamp.")
        expect(res).toBeTruthy()
    })

    test("Function: genEntryText - Read All Entries", async () => {
        let filepath = path.join(__dirname, "data", "genEntryTextTestSample.txt")
        for await (let text of genEntryText(filepath)) {
            expect(text).toBeTruthy()
        }
    })

    test("Function: localNow - Generates properly.", async () => {
        let now = localNow()
        expect(now).toBeDefined()
        expect(`[${hasTimestamp(localNow())}]`).toBeTruthy()
    })

})
