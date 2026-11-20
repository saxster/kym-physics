import Foundation
import Testing
@testable import KymPhysics

@Suite("LiveIO bridge, seed pack schema & mentor dashboard")
struct LiveIOBridgeTests {
    @Test("InteractiveWidgetSpec decodes legacy JSON and enriched PhET-studio JSON backwards-compatibly")
    func backwardsCompatibleWidgetDecoding() throws {
        let legacyJSON = """
        {
          "id": "forces",
          "title": "Balanced & Unbalanced Forces Cart",
          "chapter": 3,
          "is3D": false,
          "challengePrompt": "Reach 150 N net force.",
          "cutaway": "Asperities push back.",
          "idealised": "No air drag.",
          "watchSteps": [{"title": "1. Wide", "caption": "Intro"}]
        }
        """.data(using: .utf8)!

        let legacy = try JSONDecoder().decode(InteractiveWidgetSpec.self, from: legacyJSON)
        #expect(legacy.id == "forces")
        #expect(legacy.presets.isEmpty)
        #expect(legacy.mentorTips == nil)
        #expect(legacy.capabilities.isEmpty)
        #expect(legacy.cambridgeUnits.isEmpty)
        #expect(legacy.relatedWidgetIds.isEmpty)

        let enrichedJSON = """
        {
          "id": "forces",
          "title": "Balanced & Unbalanced Forces Cart",
          "chapter": 3,
          "is3D": false,
          "challengePrompt": "Reach 150 N net force.",
          "cutaway": "Asperities push back.",
          "idealised": "No air drag.",
          "watchSteps": [{"title": "1. Wide", "caption": "Intro"}],
          "presets": [
            {
              "id": "forces_p0",
              "name": "Cruising at Zero Net Force",
              "prompt": "Balanced pulls while moving.",
              "stateJSON": "{\\"tabs\\":[0],\\"sliders\\":{\\"Pull to the left\\":200,\\"Pull to the right\\":200}}"
            }
          ],
          "mentorTips": {
            "openPlay": "Get the cart moving, then equalize pulls.",
            "misconception": "Assuming zero net force means stopped.",
            "dinnerQuestion": "What does a water cup on a steady train do?",
            "cambridgeUnit": "Unit 3 · Forces"
          },
          "capabilities": ["2D", "Sonify", "LiveIO"],
          "cambridgeUnits": [3],
          "relatedWidgetIds": ["ramp", "atwood"]
        }
        """.data(using: .utf8)!

        let enriched = try JSONDecoder().decode(InteractiveWidgetSpec.self, from: enrichedJSON)
        #expect(enriched.presets.count == 1)
        #expect(enriched.presets[0].name == "Cruising at Zero Net Force")
        #expect(enriched.mentorTips?.cambridgeUnit == "Unit 3 · Forces")
        #expect(enriched.capabilities == ["2D", "Sonify", "LiveIO"])
        #expect(enriched.cambridgeUnits == [3])
        #expect(enriched.relatedWidgetIds == ["ramp", "atwood"])
    }

    @Test("Exported seed pack includes PhET presets, accurate chapters, clean titles, and zero selftest leaks")
    func exportedSeedPackIncludesEnrichedWidgets() throws {
        let pack = try SeedPackLoader.loadFromBundle()
        #expect(pack.widgets.count >= 42)
        #expect(!pack.widgets.contains(where: { $0.id == "selftest" }))

        let forces = try #require(pack.widgets.first(where: { $0.id == "forces" }))
        #expect(!forces.presets.isEmpty)
        #expect(forces.mentorTips != nil)
        #expect(forces.capabilities.contains("Sonify"))
        #expect(forces.cambridgeUnits.contains(3))
        #expect(!forces.relatedWidgetIds.isEmpty)

        let sp = try #require(pack.widgets.first(where: { $0.id == "seriesparallel" }))
        #expect(sp.title == "Series & Parallel Circuit Bench")

        let tides = try #require(pack.widgets.first(where: { $0.id == "tides" }))
        #expect(!tides.capabilities.contains("Schematic"))

        #expect(pack.widgets.first(where: { $0.id == "shadow" })?.chapter == 0)
        #expect(pack.widgets.first(where: { $0.id == "airfall" })?.chapter == 4)
        #expect(pack.widgets.first(where: { $0.id == "freefall" })?.chapter == 5)
        #expect(pack.widgets.first(where: { $0.id == "expansion" })?.chapter == 15)

        for labId in ["fieldslab", "mechanicslab", "waveslab", "investigations"] {
            let w = pack.widgets.first(where: { $0.id == labId })
            #expect(w != nil, "Missing deep-linked lab widget \(labId)")
        }
    }

    @MainActor
    @Test("MovingWorldBridgeController honesty gate uses strict user allowlist")
    func honestyGateRejectsTourAndAwardsUserStamp() {
        let db = DatabaseManager(inMemory: true)
        let store = AppStore(db: db, pack: SeedPackLoader.fallbackPack())
        let session = LiveSimulationBridgeSession()
        let controller = MovingWorldBridgeController(store: store, bridgeSession: session)

        let payload = "{\"sliders\":{\"Pull to the left\":0,\"Pull to the right\":250}}"
        for nonUser in ["tour", "preset", "reset", "model", nil] as [String?] {
            controller.handleProcessedEvent(MovingWorldBridgeEvent(
                kind: "live_io_stamp",
                chapter: 3,
                widgetId: "forces",
                actor: nonUser,
                prompt: nil,
                responseText: "Net force 150 N to the right",
                stateJSON: payload
            ))
            #expect(store.widgetStamps["forces"] == nil, "Non-user actor \(String(describing: nonUser)) must NOT stamp")
        }
        #expect(session.lastStampedWidgetId == nil)

        controller.handleProcessedEvent(MovingWorldBridgeEvent(
            kind: "live_io_stamp",
            chapter: 3,
            widgetId: "forces",
            actor: "user",
            prompt: nil,
            responseText: "Net force 150 N to the right",
            stateJSON: payload
        ))
        #expect(store.widgetStamps["forces"] != nil)
        #expect(session.lastStampedWidgetId == "forces")
        #expect(session.latestStateJSON == payload)
    }

    @MainActor
    @Test("MovingWorldBridgeController keeps live_io_event state isolated from eventJSON and chapter progress")
    func liveIOEventIsolatesStateFromProgress() async {
        let db = DatabaseManager(inMemory: true)
        let store = AppStore(db: db, pack: SeedPackLoader.fallbackPack())
        let session = LiveSimulationBridgeSession()
        let controller = MovingWorldBridgeController(store: store, bridgeSession: session)

        let stateJSON = "{\"sliders\":{\"Pull to the left\":150}}"
        controller.handleProcessedEvent(MovingWorldBridgeEvent(
            kind: "live_io_event",
            chapter: 3,
            widgetId: "forces",
            actor: "user",
            prompt: nil,
            responseText: "Net force 50 N",
            eventJSON: "{\"seq\":1,\"kind\":\"slider\"}",
            stateJSON: stateJSON
        ))
        #expect(session.latestStateJSON == stateJSON)
        #expect(session.latestReadout == "Net force 50 N")
        #expect(session.latestEventCount == 1)
        #expect(store.readingProgress[3] == nil)

        for (hashStr, expectedCh) in [("#ch12", 12), ("#fig-7-3", 7), ("#c3", 3)] {
            let parsedEvent: MovingWorldBridgeEvent = await withCheckedContinuation { continuation in
                controller.onBridgeEvent = { ev in
                    controller.onBridgeEvent = nil
                    continuation.resume(returning: ev)
                }
                controller.processMessage(["kind": "hash_change", "hash": hashStr])
            }
            #expect(parsedEvent.chapter == expectedCh, "Failed parsing chapter from \(hashStr)")
        }
    }

    @Test("MovingWorldBookSchemeHandler resolves in-root assets, blocks traversal, and sets JS MIME type")
    func schemeHandlerTraversalAndMimeTests() {
        let root = URL(fileURLWithPath: "/tmp/MovingWorldBookRoot")
        #expect(MovingWorldBookSchemeHandler.resolveFileURL(for: URL(string: "kymbook://moving-world/")!, inside: root)?.path == "/tmp/MovingWorldBookRoot/index.html")
        #expect(MovingWorldBookSchemeHandler.resolveFileURL(for: URL(string: "kymbook://moving-world/live/app.js")!, inside: root)?.path == "/tmp/MovingWorldBookRoot/live/app.js")
        #expect(MovingWorldBookSchemeHandler.resolveFileURL(for: URL(string: "kymbook://moving-world/../../etc/passwd")!, inside: root) == nil)
        #expect(MovingWorldBookSchemeHandler.mimeType(for: URL(fileURLWithPath: "app.js")) == "text/javascript; charset=utf-8")
        #expect(MovingWorldBookSchemeHandler.mimeType(for: URL(fileURLWithPath: "icon-192.png")) == "image/png")
    }

    @MainActor
    @Test("AppStore.freezeWidgetIntoLabLog persists PNG snapshot and widgetStateJSON cleanly")
    func freezeWidgetPersistsSnapshotAndState() {
        let db = DatabaseManager(inMemory: true)
        let store = AppStore(db: db, pack: SeedPackLoader.fallbackPack())
        let widget = InteractiveWidgetSpec(
            id: "forces",
            title: "Balanced & Unbalanced Forces Cart",
            chapter: 3,
            is3D: false,
            challengePrompt: "Hit 150 N net force.",
            cutaway: "Asperities.",
            idealised: "Zero air drag.",
            watchSteps: []
        )
        let fakePNG = Data([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x01, 0x02])
        let stateJSON = "{\"sliders\":{\"Pull to the left\":200,\"Pull to the right\":200}}"

        let entry = store.freezeWidgetIntoLabLog(
            widget: widget,
            readout: "Net force 0. Keeps 4.0 m/s",
            snapshotPNGData: fakePNG,
            stateJSON: stateJSON
        )
        #expect(entry.snapshotPNGData == fakePNG)
        #expect(entry.widgetStateJSON == stateJSON)
        #expect(entry.controlVarsText == "Boundary conditions & reference frame held constant")
        #expect(!entry.summaryText.contains(stateJSON))
        #expect(store.journalEntries.contains(where: { $0.id == entry.id && $0.snapshotPNGData == fakePNG && $0.widgetStateJSON == stateJSON }))
    }

    @MainActor
    @Test("ParentMentorReportGenerator prioritizes active chapter & unstamped widgets dynamically")
    func mentorPrioritizationAndMarkdownReport() {
        let base = SeedPackLoader.fallbackPack()
        let ch3Stamped = InteractiveWidgetSpec(
            id: "forces",
            title: "Forces Cart",
            chapter: 3,
            is3D: false,
            challengePrompt: "p",
            cutaway: "c",
            idealised: "i",
            watchSteps: [],
            mentorTips: WidgetMentorTips(
                openPlay: "Open play forces",
                misconception: "Motion needs continuous push.",
                dinnerQuestion: "Does a cruising train glass tilt?",
                cambridgeUnit: "Unit 3"
            ),
            cambridgeUnits: [3]
        )
        let ch12Active = InteractiveWidgetSpec(
            id: "circuit",
            title: "Circuit Loop",
            chapter: 12,
            is3D: false,
            challengePrompt: "p",
            cutaway: "c",
            idealised: "i",
            watchSteps: [],
            mentorTips: WidgetMentorTips(
                openPlay: "Open play circuit",
                misconception: "Current is used up around loop.",
                dinnerQuestion: "Why are ammeters before and after an LED identical?",
                cambridgeUnit: "Unit 9"
            ),
            cambridgeUnits: [9]
        )
        let ch7Unstamped = InteractiveWidgetSpec(
            id: "energytrack",
            title: "Energy Track",
            chapter: 7,
            is3D: false,
            challengePrompt: "p",
            cutaway: "c",
            idealised: "i",
            watchSteps: [],
            mentorTips: WidgetMentorTips(
                openPlay: "Open play track",
                misconception: "Heavy bead falls faster.",
                dinnerQuestion: "Does a 3x heavier marble move faster at the bottom?",
                cambridgeUnit: "Unit 3"
            ),
            cambridgeUnits: [3]
        )

        let pack = KymPhysicsSeedPack(
            schemaVersion: base.schemaVersion,
            packId: base.packId,
            generatedBy: base.generatedBy,
            volumes: base.volumes,
            chapters: base.chapters,
            stories: base.stories,
            explorers: base.explorers,
            investigations: base.investigations,
            widgets: [ch3Stamped, ch7Unstamped, ch12Active],
            examBanks: base.examBanks,
            crossDisciplinaryBridges: base.crossDisciplinaryBridges,
            schoolTextbook: base.schoolTextbook,
            schoolQuestions: base.schoolQuestions,
            diagramPlates: base.diagramPlates,
            propositionGraph: base.propositionGraph,
            practiceDemands: base.practiceDemands
        )

        let db = DatabaseManager(inMemory: true)
        let store = AppStore(db: db, pack: pack)
        store.activeMovingWorldChapter = 12
        store.earnWidgetChallengeStamp(widgetId: "forces", chapterNumber: 3, readout: "done")

        let prioritized = ParentMentorReportGenerator.prioritizedMentorWidgets(for: store)
        #expect(prioritized.map(\.id) == ["circuit", "energytrack", "forces"])

        let report = ParentMentorReportGenerator.generateMarkdownReport(for: store)
        #expect(report.contains("Why are ammeters before and after an LED identical?"))
        #expect(report.contains("Current is used up around loop."))
    }
}
