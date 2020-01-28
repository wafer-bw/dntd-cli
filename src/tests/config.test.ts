import path from "path"
import Sandbox from "./Sandbox"

describe("Config", () => {

    test("Update Default Journal", async () => {
        let sandbox = new Sandbox("update-default-journal")
        sandbox.config.updateDefaultJournal("change-default-journal")
        sandbox.config.load()
        expect(sandbox.config.defaultJournal).toEqual("change-default-journal")
        sandbox.teardown()
    })

    test("Update Editor", async () => {
        let sandbox = new Sandbox("update-editor")
        sandbox.config.updateEditor("nano -L")
        sandbox.config.load()
        expect(sandbox.config.editor).toEqual("nano -L")
        sandbox.teardown()
    })

    test("Print Journals", async () => {
        let sandbox = new Sandbox("print-journals")
        sandbox.config.printJournals()
        sandbox.teardown()
    })

    test("Read Config - throws no errors", async () => {
        let sandbox = new Sandbox("read-config")
        sandbox.config.read()
        sandbox.teardown()
    })

    test("Initialize default journal (myjournal)", async () => {
        let sandbox = new Sandbox("myjournal", true)
        sandbox.teardown()
        expect(sandbox.journal.name).toEqual("myjournal")
    })

    test("Write Config Custom - throws no errors", async () => {
        let testname = "write-config-custom-throws-no-errors"
        let sandbox = new Sandbox(testname)
        let customContent = `journals:
    ${testname}:
        path: ${path.join(sandbox.config.dir, testname)}.txt
        suffix: ""
        prefix: ""
editor: vi
defaultJournal: ${testname}`
        sandbox.config.write(customContent)
        sandbox.teardown()
        expect(sandbox.config.editor).toEqual("vi")
    })

    test("Write Config Custom - missing editor field", async () => {
        let testname = "write-config-custom-missing-editor-field"
        let sandbox = new Sandbox(testname)
        let customContent = `journals:
    ${testname}:
        path: ${path.join(sandbox.config.dir, testname)}.txt
        suffix: ""
        prefix: ""
defaultJournal: ${testname}`
        sandbox.config.write(customContent)
        sandbox.teardown()
        expect(sandbox.config.editor).toEqual("")
    })

    test("Write Config Custom - Missing Default Journal", async () => {
        let err = null
        let testname = "write-config-custom-missing-default-journal"
        let sandbox = new Sandbox(testname)
        let badContent = `journals:
    ${testname}:
        path: ${path.join(sandbox.config.dir, testname)}.txt
        suffix: ""
        prefix: ""
editor: vi`
        let goodContent = `journals:
    ${testname}:
            path: ${path.join(sandbox.config.dir, testname)}.txt
            suffix: ""
            prefix: ""
editor: vi
defaultJournal: ${testname}`
        try {
            sandbox.config.write(badContent)
        }
        catch (e) {
            err = e
        }
        sandbox.config.write(goodContent)
        sandbox.teardown()
        expect(err).toBeDefined()
    })

})
