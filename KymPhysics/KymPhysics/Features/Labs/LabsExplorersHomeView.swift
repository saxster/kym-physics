import SwiftUI
import WebKit

private enum GalleryFacet: String, CaseIterable {
    case all
    case unit3
    case unit6
    case unit9
    case is3D
    case sonify
    case unstamped

    var label: String {
        switch self {
        case .all: return "All Labs"
        case .unit3: return "Unit 3 · Forces & Energy"
        case .unit6: return "Unit 6 · Sound & Light"
        case .unit9: return "Unit 9 · Circuits & Fields"
        case .is3D: return "3D"
        case .sonify: return "Sonified"
        case .unstamped: return "Unstamped"
        }
    }
}

struct LabsExplorersHomeView: View {
    @EnvironmentObject private var store: AppStore
    @State private var selectedTab: String = "widgets" // "widgets" | "explorers" | "investigations" | "sensors" | "visuals"
    @State private var selectedChapterFilter: Int? = nil
    @State private var selectedGalleryFacet: GalleryFacet = .all
    @State private var selectedInvestigationChapter: Int? = nil
    @State private var selectedInvestigationCategory: String = "all"
    @State private var activeWatchStepIndex: Int = 0
    @State private var showingCutaway: Bool = false
    @State private var showLiveWebGLSimulation: Bool = true
    @State private var bridgeSession = LiveSimulationBridgeSession()
    @State private var isFreezingSnapshot: Bool = false

    // Sensor & Hardware simulator states
    @State private var elevatorAccelG: Double = 1.00
    @State private var acousticFreqHz: Double = 440.0
    @State private var compassAzimuthDeg: Double = 0.0
    @State private var videoFrameIndex: Int = 3

    private var activeWidget: InteractiveWidgetSpec {
        if let id = store.activeWidgetId,
           let match = store.pack.widgets.first(where: { $0.id == id }) {
            return match
        }
        return store.pack.widgets.first(where: { $0.id == "fieldslab" })
            ?? store.pack.widgets.first
            ?? InteractiveWidgetSpec(
                id: "fieldslab",
                title: "Electromagnet & Magnetic Fields Bench",
                chapter: 13,
                is3D: true,
                challengePrompt: "Increase coil turns to 60 and insert the soft iron core to lift 28 paperclips.",
                cutaway: "Magnetic domains inside the soft iron core align with the solenoid's B-field.",
                idealised: "Uniform solenoid field idealisation.",
                watchSteps: []
            )
    }

    private var filteredWidgets: [InteractiveWidgetSpec] {
        store.pack.widgets.filter { w in
            if let ch = selectedChapterFilter, w.chapter != ch { return false }
            switch selectedGalleryFacet {
            case .unit3: return w.cambridgeUnits.contains(3)
            case .unit6: return w.cambridgeUnits.contains(6)
            case .unit9: return w.cambridgeUnits.contains(9)
            case .is3D: return w.is3D || w.capabilities.contains("3D")
            case .sonify: return w.capabilities.contains("Sonify")
            case .unstamped: return store.widgetStamps[w.id] == nil
            case .all: return true
            }
        }
    }

    private var filteredInvestigations: [PhysicsInvestigation] {
        store.pack.investigations.filter { inv in
            let matchesCh = (selectedInvestigationChapter == nil) || (inv.chapter == selectedInvestigationChapter)
            let matchesCat = (selectedInvestigationCategory == "all") || (inv.category.lowercased() == selectedInvestigationCategory)
            return matchesCh && matchesCat
        }
    }

    var body: some View {
        JournalPage(
            eyebrow: AppRoom.labsExplorers.title,
            title: "3D Physics Labs, Sensors & Explorers",
            subtitle: "56 Interactive Simulations · 4 Front-Matter Explorers · 126 Investigations · iPad Sensor Bench",
            headerAccessory: {
                StandardThemeMenu()
            }
        ) {
            // 1. Mode Switcher
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Spacing.sm) {
                    StandardFilterChip("56 Live Simulations", isSelected: selectedTab == "widgets") { selectedTab = "widgets" }

                    StandardFilterChip("4 Front-Matter Explorers", isSelected: selectedTab == "explorers") { selectedTab = "explorers" }

                    StandardFilterChip("126 Investigations & Atlas", isSelected: selectedTab == "investigations") { selectedTab = "investigations" }

                    StandardFilterChip("iPad Hardware Sensors & 240 fps", isSelected: selectedTab == "sensors") { selectedTab = "sensors" }

                    StandardFilterChip("Arduino Hardware Missions", isSelected: selectedTab == "arduino") { selectedTab = "arduino" }

                    StandardFilterChip("Cambridge Concept Visuals", isSelected: selectedTab == "visuals") { selectedTab = "visuals" }
                }
            }

            if selectedTab == "explorers" {
                JournalSection(
                    title: "Four Front-Matter Explorers",
                    subtitle: "Powers of Ten, The Sky Over Mumbai, The Ladder of Light & The Adventure Map"
                ) {
                    LazyVGrid(
                        columns: [GridItem(.flexible(), spacing: Spacing.md), GridItem(.flexible(), spacing: Spacing.md)],
                        spacing: Spacing.md
                    ) {
                        ForEach(store.pack.explorers) { exp in
                            JournalCard {
                                VStack(alignment: .leading, spacing: Spacing.sm) {
                                    HStack {
                                        Image(systemName: exp.symbol)
                                            .font(.kymaiaSymbolLarge)
                                            .foregroundStyle(Color.kymaiaPrimary)
                                        VStack(alignment: .leading) {
                                            Text(exp.title)
                                                .font(.kymaiaTitle3)
                                                .foregroundStyle(Color.kymaiaInk)
                                            Text(exp.subtitle)
                                                .font(.kymaiaCaption)
                                                .foregroundStyle(Color.kymaiaMutedInk)
                                        }
                                        Spacer()
                                        StandardFilterChip(store.activeExplorerId == exp.id ? "Active Below ✓" : "Open Interactive Explorer", isSelected: store.activeExplorerId == exp.id) {
                                            store.activeExplorerId = exp.id
                                        }
                                    }
                                    Text(exp.summary)
                                        .font(.kymaiaReadingBody)
                                        .foregroundStyle(Color.kymaiaInk)

                                    HStack {
                                        ForEach(exp.linkedChapters.prefix(5), id: \.self) { ch in
                                            Button("Ch \(ch)") {
                                                store.activeMovingWorldChapter = ch
                                                store.selectedRoom = .movingWorld
                                            }
                                            .buttonStyle(.bordered)
                                        }
                                    }
                                }
                            }
                        }
                    }

                    let activeExpId = store.activeExplorerId ?? store.pack.explorers.first?.id ?? "scale"
                    JournalCard {
                        VStack(alignment: .leading, spacing: Spacing.sm) {
                            HStack {
                                JournalBadge(text: "Live Interactive Explorer", tone: .accent)
                                Text("Embedded from MovingWorldBook/live/x_\(activeExpId).js")
                                    .font(.kymaiaCaption)
                                    .foregroundStyle(Color.kymaiaMutedInk)
                                Spacer()
                            }
                            let explorerSlug = activeExpId.replacingOccurrences(of: "x_", with: "")
                            MovingWorldLiveTargetWebView(
                                targetSelector: "#explore-\(explorerSlug), [data-live='\(activeExpId)']",
                                widgetId: nil,
                                store: store,
                                bridgeSession: nil
                            )
                                .frame(minHeight: 540)
                                .clipShape(RoundedRectangle(cornerRadius: CornerRadius.md, style: .continuous))
                        }
                    }
                }
            } else if selectedTab == "investigations" {
                JournalSection(
                    title: "All \(store.pack.investigations.count) Structured Physics Investigations & 3D Atlas Lessons (\(filteredInvestigations.count) shown)",
                    subtitle: "Complete with materials, repeatable trial procedures, limits of the model, and worked numbers"
                ) {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: Spacing.xs) {
                            ForEach(["all", "home", "lab", "thought", "atlas"], id: \.self) { cat in
                                StandardFilterChip(cat == "all" ? "All Categories (\(store.pack.investigations.count))" : cat.capitalized, isSelected: selectedInvestigationCategory == cat) {
                                    selectedInvestigationCategory = cat
                                }
                            }
                        }
                    }

                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: Spacing.xs) {
                            StandardFilterChip("All Chapters", isSelected: selectedInvestigationChapter == nil) {
                                selectedInvestigationChapter = nil
                            }

                            ForEach(0..<16, id: \.self) { ch in
                                StandardFilterChip("Ch \(ch)", isSelected: selectedInvestigationChapter == ch) {
                                    selectedInvestigationChapter = ch
                                }
                            }
                        }
                    }

                    VStack(spacing: Spacing.md) {
                        ForEach(filteredInvestigations) { inv in
                            JournalCard {
                                VStack(alignment: .leading, spacing: Spacing.sm) {
                                    HStack {
                                        JournalBadge(text: inv.category.capitalized, tone: .accent)
                                        JournalBadge(text: "Ch \(inv.chapter) · §\(inv.section)", tone: .neutral)
                                        Text(inv.title)
                                            .font(.kymaiaHeadline)
                                            .foregroundStyle(Color.kymaiaInk)
                                        Spacer()
                                    }

                                    Text("Question: \(inv.question)")
                                        .font(.kymaiaCallout.weight(.semibold))
                                        .foregroundStyle(Color.kymaiaPrimary)

                                    Text(inv.explanation)
                                        .font(.kymaiaReadingBody)
                                        .foregroundStyle(Color.kymaiaInk)

                                    if !inv.materials.isEmpty {
                                        Text("Materials: \(inv.materials)")
                                            .font(.kymaiaCaption)
                                            .foregroundStyle(Color.kymaiaMutedInk)
                                    }

                                    if !inv.worked.isEmpty {
                                        Text("Worked numbers: \(inv.worked)")
                                            .font(.system(.caption, design: .monospaced))
                                            .foregroundStyle(Color.kymaiaSecondary)
                                    }

                                    Text("Model limits: \(inv.limits)")
                                        .font(.kymaiaCaption)
                                        .foregroundStyle(Color.kymaiaMutedInk)
                                }
                            }
                        }
                    }
                }
            } else if selectedTab == "sensors" {
                PhysicsHardwareSensorsBenchView()
            } else if selectedTab == "arduino" {
                ArduinoMissionsGalleryView()
            } else if selectedTab == "visuals" {
                PhysicsSubjectTipsView()
                PhysicsSubjectTipsVisualsSection()
            } else {
                // Default: 56 Interactive Simulations Bench
                JournalSection(
                    title: "Active Simulation Bench · \(activeWidget.title)",
                    subtitle: "Chapter \(activeWidget.chapter) · Goal-directed micro-challenge, 5-step Watch tour, and 1-tap Freeze to Lab Notebook"
                ) {
                    JournalCard {
                        VStack(alignment: .leading, spacing: Spacing.md) {
                            HStack {
                                JournalBadge(text: "Ch \(activeWidget.chapter)", tone: .accent)
                                JournalBadge(text: activeWidget.is3D ? "3D WebGL / Spatial" : "2D Interactive", tone: .neutral)
                                Text(activeWidget.title)
                                    .font(.kymaiaTitle3)
                                    .foregroundStyle(Color.kymaiaInk)
                                Spacer()
                                if store.widgetStamps[activeWidget.id] != nil {
                                    JournalBadge(text: "Challenge Stamped ★", tone: .positive)
                                }
                                Toggle("3D / WebGL Engine", isOn: $showLiveWebGLSimulation)
                                    .toggleStyle(.button)
                                    .font(.kymaiaCaption.weight(.semibold))
                            }

                            if showLiveWebGLSimulation {
                                MovingWorldLiveTargetWebView(
                                    targetSelector: "[data-live='\(activeWidget.id)'], #ch\(activeWidget.chapter)",
                                    widgetId: activeWidget.id,
                                    store: store,
                                    bridgeSession: bridgeSession
                                )
                                .frame(minHeight: 520)
                                .clipShape(RoundedRectangle(cornerRadius: CornerRadius.md, style: .continuous))
                            }

                            // PhET-Style Inquiry Presets Strip (one tap configures the live WKWebView via LiveIO)
                            if !activeWidget.presets.isEmpty {
                                VStack(alignment: .leading, spacing: Spacing.xs) {
                                    Text("Curated Inquiry Presets")
                                        .font(.kymaiaCaption.weight(.bold))
                                        .foregroundStyle(Color.kymaiaMutedInk)
                                    ScrollView(.horizontal, showsIndicators: false) {
                                        HStack(spacing: Spacing.xs) {
                                            ForEach(activeWidget.presets) { preset in
                                                StandardFilterChip(preset.name, isSelected: false) {
                                                    bridgeSession.openPreset(widgetId: activeWidget.id, stateJSON: preset.stateJSON)
                                                }
                                            }
                                        }
                                    }
                                }
                            }

                            HStack(spacing: Spacing.sm) {
                                Toggle("Inside Cut-away Note", isOn: $showingCutaway)
                                    .toggleStyle(.button)
                                    .font(.kymaiaCaption)

                                if let liveReadout = bridgeSession.latestReadout, !liveReadout.isEmpty {
                                    Text(liveReadout)
                                        .font(.kymaiaMonoCaption)
                                        .foregroundStyle(Color.kymaiaPrimary)
                                        .lineLimit(2)
                                }
                            }

                            if showingCutaway {
                                Text("Inside Cut-away: \(activeWidget.cutaway)")
                                    .font(.kymaiaCallout)
                                    .foregroundStyle(Color.kymaiaSecondary)
                            }

                            // 5-Step Choreographed Watch Tour Notes
                            if !activeWidget.watchSteps.isEmpty {
                                VStack(alignment: .leading, spacing: Spacing.xs) {
                                    Text("Choreographed Watch Tour")
                                        .font(.kymaiaCaption.weight(.bold))
                                        .foregroundStyle(Color.kymaiaMutedInk)
                                    ScrollView(.horizontal, showsIndicators: false) {
                                        HStack(spacing: Spacing.xs) {
                                            ForEach(Array(activeWidget.watchSteps.enumerated()), id: \.offset) { idx, step in
                                                StandardFilterChip(step.title, isSelected: activeWatchStepIndex == idx) {
                                                    activeWatchStepIndex = idx
                                                    showingCutaway = step.title.lowercased().contains("cut-away")
                                                }
                                            }
                                        }
                                    }
                                    let safeIdx = min(activeWatchStepIndex, activeWidget.watchSteps.count - 1)
                                    Text(activeWidget.watchSteps[max(0, safeIdx)].caption)
                                        .font(.kymaiaCallout)
                                        .foregroundStyle(Color.kymaiaInk)
                                }
                            }

                            // Honest Challenge Status + Real Async Freeze to Lab Notebook
                            VStack(alignment: .leading, spacing: Spacing.xs) {
                                Text("Micro-Challenge: \(activeWidget.challengePrompt)")
                                    .font(.kymaiaCallout.weight(.semibold))
                                    .foregroundStyle(Color.kymaiaPrimary)
                                Text("What the model simplifies: \(activeWidget.idealised)")
                                    .font(.kymaiaCaption)
                                    .foregroundStyle(Color.kymaiaMutedInk)

                                HStack(spacing: Spacing.md) {
                                    if store.widgetStamps[activeWidget.id] != nil {
                                        JournalBadge(text: "★ Stamped from Live Simulation", tone: .positive)
                                    } else {
                                        JournalBadge(text: "◎ Solve inside the live simulation above to earn your stamp", tone: .neutral)
                                    }

                                    Spacer()

                                    Button {
                                        isFreezingSnapshot = true
                                        Task { @MainActor in
                                            let snap = await bridgeSession.captureLiveSnapshot(widgetId: activeWidget.id)
                                            let readoutText = snap.readout.isEmpty ? activeWidget.challengePrompt : snap.readout
                                            _ = store.freezeWidgetIntoLabLog(
                                                widget: activeWidget,
                                                readout: readoutText,
                                                snapshotPNGData: snap.pngData,
                                                stateJSON: snap.stateJSON
                                            )
                                            isFreezingSnapshot = false
                                        }
                                    } label: {
                                        Label(
                                            isFreezingSnapshot ? "Capturing Live View…" : "Freeze Live State to Lab Notebook",
                                            systemImage: "camera.aperture"
                                        )
                                        .font(.kymaiaCallout.weight(.semibold))
                                    }
                                    .buttonStyle(BrassButtonStyle())
                                    .disabled(isFreezingSnapshot)
                                }
                            }

                            // Related Simulations Cross-Links
                            if !activeWidget.relatedWidgetIds.isEmpty {
                                ScrollView(.horizontal, showsIndicators: false) {
                                    HStack(spacing: Spacing.xs) {
                                        Text("Related Labs:")
                                            .font(.kymaiaCaption.weight(.semibold))
                                            .foregroundStyle(Color.kymaiaMutedInk)
                                        ForEach(activeWidget.relatedWidgetIds, id: \.self) { relId in
                                            if let target = store.pack.widgets.first(where: { $0.id == relId }) {
                                                StandardFilterChip(target.title, isSelected: false) {
                                                    store.activeWidgetId = target.id
                                                    activeWatchStepIndex = 0
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // All Simulations Gallery with Capability & Cambridge Unit Facets
                JournalSection(title: "All \(store.pack.widgets.count) Interactive Physics Simulations (\(filteredWidgets.count) shown)") {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: Spacing.xs) {
                            ForEach(GalleryFacet.allCases, id: \.self) { facet in
                                StandardFilterChip(facet.label, isSelected: selectedGalleryFacet == facet) {
                                    selectedGalleryFacet = facet
                                }
                            }
                        }
                    }

                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: Spacing.xs) {
                            StandardFilterChip("All Chapters", isSelected: selectedChapterFilter == nil) { selectedChapterFilter = nil }
                            ForEach(0..<16, id: \.self) { ch in
                                StandardFilterChip("Ch \(ch)", isSelected: selectedChapterFilter == ch) { selectedChapterFilter = ch }
                            }
                        }
                    }

                    LazyVGrid(
                        columns: [GridItem(.flexible(), spacing: Spacing.md), GridItem(.flexible(), spacing: Spacing.md)],
                        spacing: Spacing.md
                    ) {
                        ForEach(filteredWidgets) { w in
                            Button {
                                store.activeWidgetId = w.id
                                activeWatchStepIndex = 0
                            } label: {
                                JournalCard {
                                    VStack(alignment: .leading, spacing: Spacing.xs) {
                                        HStack(spacing: Spacing.xs) {
                                            JournalBadge(text: "Ch \(w.chapter)", tone: .accent)
                                            ForEach(w.capabilities.prefix(3), id: \.self) { cap in
                                                JournalBadge(text: cap, tone: .neutral)
                                            }
                                            Spacer()
                                            if store.widgetStamps[w.id] != nil {
                                                Image(systemName: "seal.fill")
                                                    .foregroundStyle(Color.kymaiaSuccess)
                                            }
                                        }
                                        Text(w.title)
                                            .font(.kymaiaHeadline)
                                            .foregroundStyle(Color.kymaiaInk)
                                        Text(w.challengePrompt)
                                            .font(.kymaiaCaption)
                                            .foregroundStyle(Color.kymaiaMutedInk)
                                            .lineLimit(2)
                                    }
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                }
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
            }
        }
    }
}

// MARK: - Live WebGL / Three.js Simulation & Explorer WebView (loads MovingWorldBook/index.html & attaches LiveIO bridge)

@MainActor
final class MovingWorldTargetCoordinator: NSObject, WKNavigationDelegate {
    let bridge: MovingWorldBridgeController
    var targetSelector: String
    var widgetId: String?
    weak var session: LiveSimulationBridgeSession?

    init(store: AppStore?, session: LiveSimulationBridgeSession?, targetSelector: String, widgetId: String?) {
        self.bridge = MovingWorldBridgeController(store: store, bridgeSession: session)
        self.targetSelector = targetSelector
        self.widgetId = widgetId
        self.session = session
    }

    @MainActor
    func focusCurrentTarget(in webView: WKWebView) {
        if let widgetId, let session {
            if let pending = bridge.store?.pendingWidgetStateJSON, !pending.isEmpty {
                bridge.store?.pendingWidgetStateJSON = nil
                session.openPreset(widgetId: widgetId, stateJSON: pending)
            } else {
                session.focusWidget(widgetId: widgetId)
            }
            return
        }
        webView.callAsyncJavaScript(
            "const el = document.querySelector(sel); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }",
            arguments: ["sel": targetSelector],
            in: nil,
            in: .page,
            completionHandler: nil
        )
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        Task { @MainActor in
            focusCurrentTarget(in: webView)
        }
    }
}

#if os(macOS)
struct MovingWorldLiveTargetWebView: NSViewRepresentable {
    let targetSelector: String
    var widgetId: String? = nil
    var store: AppStore? = nil
    var bridgeSession: LiveSimulationBridgeSession? = nil

    func makeCoordinator() -> MovingWorldTargetCoordinator {
        MovingWorldTargetCoordinator(store: store, session: bridgeSession, targetSelector: targetSelector, widgetId: widgetId)
    }

    func makeNSView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        MovingWorldBookSchemeHandler.configure(config, bridge: context.coordinator.bridge)
        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        bridgeSession?.activeWebView = webView
        MovingWorldBookSchemeHandler.loadBook(in: webView, chapterNumber: 0)
        return webView
    }

    func updateNSView(_ webView: WKWebView, context: Context) {
        context.coordinator.bridge.store = store
        context.coordinator.bridge.bridgeSession = bridgeSession
        context.coordinator.session = bridgeSession
        bridgeSession?.activeWebView = webView
        let changed = context.coordinator.targetSelector != targetSelector || context.coordinator.widgetId != widgetId
        context.coordinator.targetSelector = targetSelector
        context.coordinator.widgetId = widgetId
        if changed {
            bridgeSession?.latestReadout = nil
            bridgeSession?.latestStateJSON = nil
            context.coordinator.focusCurrentTarget(in: webView)
        }
    }

    static func dismantleNSView(_ webView: WKWebView, coordinator: MovingWorldTargetCoordinator) {
        webView.configuration.userContentController.removeScriptMessageHandler(forName: MovingWorldBridgeController.handlerName)
        if coordinator.session?.activeWebView === webView {
            coordinator.session?.activeWebView = nil
        }
    }
}
#else
struct MovingWorldLiveTargetWebView: UIViewRepresentable {
    let targetSelector: String
    var widgetId: String? = nil
    var store: AppStore? = nil
    var bridgeSession: LiveSimulationBridgeSession? = nil

    func makeCoordinator() -> MovingWorldTargetCoordinator {
        MovingWorldTargetCoordinator(store: store, session: bridgeSession, targetSelector: targetSelector, widgetId: widgetId)
    }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        MovingWorldBookSchemeHandler.configure(config, bridge: context.coordinator.bridge)
        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        bridgeSession?.activeWebView = webView
        MovingWorldBookSchemeHandler.loadBook(in: webView, chapterNumber: 0)
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        context.coordinator.bridge.store = store
        context.coordinator.bridge.bridgeSession = bridgeSession
        context.coordinator.session = bridgeSession
        bridgeSession?.activeWebView = webView
        let changed = context.coordinator.targetSelector != targetSelector || context.coordinator.widgetId != widgetId
        context.coordinator.targetSelector = targetSelector
        context.coordinator.widgetId = widgetId
        if changed {
            bridgeSession?.latestReadout = nil
            bridgeSession?.latestStateJSON = nil
            context.coordinator.focusCurrentTarget(in: webView)
        }
    }

    static func dismantleUIView(_ webView: WKWebView, coordinator: MovingWorldTargetCoordinator) {
        webView.configuration.userContentController.removeScriptMessageHandler(forName: MovingWorldBridgeController.handlerName)
        if coordinator.session?.activeWebView === webView {
            coordinator.session?.activeWebView = nil
        }
    }
}
#endif

// MARK: - Ported Physics Subject Tips Visuals (from KymaiaTutor)

private struct PhysicsSubjectTipsVisualsSection: View {
    @State private var forwardThrustN: Double = 160
    @State private var dragForceN: Double = 100
    @State private var planetGravity: Double = 9.8
    @State private var incidentAngleDeg: Double = 55
    @State private var circuitMode: String = "parallel"

    var body: some View {
        JournalSection(
            title: "Cambridge Physics Concept Visuals",
            subtitle: "Ported from KymaiaTutor Physics Subject Tips — interactive traps & invariants"
        ) {
            LazyVGrid(
                columns: [GridItem(.flexible(), spacing: Spacing.md), GridItem(.flexible(), spacing: Spacing.md)],
                spacing: Spacing.md
            ) {
                // 1. ForceArrowsVisual
                JournalCard {
                    VStack(alignment: .leading, spacing: Spacing.sm) {
                        JournalBadge(text: "Unit 3.1 · ForceArrowsVisual", tone: .accent)
                        Text("Balanced vs Unbalanced Resultant Force")
                            .font(.kymaiaHeadline)
                        Text("Forward = \(Int(forwardThrustN)) N · Drag = \(Int(dragForceN)) N → Resultant = \(Int(forwardThrustN - dragForceN)) N")
                            .font(.system(.callout, design: .monospaced).weight(.semibold))
                            .foregroundStyle(Color.kymaiaPrimary)
                        Slider(value: $forwardThrustN, in: 50...250, step: 10)
                        Text(forwardThrustN == dragForceN ? "Balanced (0 N): stationary OR constant velocity!" : "Unbalanced (\(Int(forwardThrustN - dragForceN)) N): accelerating!")
                            .font(.kymaiaCaption)
                            .foregroundStyle(Color.kymaiaMutedInk)
                    }
                }

                // 2. MassWeightVisual
                JournalCard {
                    VStack(alignment: .leading, spacing: Spacing.sm) {
                        JournalBadge(text: "Unit 3.1 & Ch 2 · MassWeightVisual", tone: .accent)
                        Text("Mass (kg) stays invariant; Weight (W = mg) changes")
                            .font(.kymaiaHeadline)
                        Text(String(format: "Mass m = 50 kg · g = %.1f N/kg → Weight W = %.0f N", planetGravity, 50.0 * planetGravity))
                            .font(.system(.callout, design: .monospaced).weight(.semibold))
                            .foregroundStyle(Color.kymaiaPrimary)
                        HStack {
                            Button("Earth (9.8)") { planetGravity = 9.8 }.buttonStyle(.bordered)
                            Button("Moon (1.6)") { planetGravity = 1.6 }.buttonStyle(.bordered)
                            Button("Jupiter (24.8)") { planetGravity = 24.8 }.buttonStyle(.bordered)
                        }
                    }
                }

                // 3. ReflectionVisual
                JournalCard {
                    VStack(alignment: .leading, spacing: Spacing.sm) {
                        JournalBadge(text: "Unit 6.1 · ReflectionVisual", tone: .accent)
                        Text("Law of Reflection Measured from the 90° Normal")
                            .font(.kymaiaHeadline)
                        Text("Angle of incidence i = \(Int(incidentAngleDeg))° → Angle of reflection r = \(Int(incidentAngleDeg))° (grazing angle to mirror = \(90 - Int(incidentAngleDeg))°)")
                            .font(.system(.callout, design: .monospaced).weight(.semibold))
                            .foregroundStyle(Color.kymaiaPrimary)
                        Slider(value: $incidentAngleDeg, in: 10...80, step: 5)
                    }
                }

                // 4. CircuitToggleVisual
                JournalCard {
                    VStack(alignment: .leading, spacing: Spacing.sm) {
                        JournalBadge(text: "Ch 12 & Unit 9.3 · CircuitToggleVisual", tone: .accent)
                        Text("Series vs Parallel Lamp & Ammeter Topology")
                            .font(.kymaiaHeadline)
                        Text(circuitMode == "parallel" ? "Parallel branches: each lamp gets full cell voltage V; if one lamp blows, the other stays lit." : "Series loop: current I is identical everywhere; voltage divides between lamps.")
                            .font(.kymaiaCallout)
                            .foregroundStyle(Color.kymaiaInk)
                        HStack {
                            Button("Series Loop") { circuitMode = "series" }.buttonStyle(.bordered)
                            Button("Parallel Branches") { circuitMode = "parallel" }.buttonStyle(.bordered)
                        }
                    }
                }
            }
        }
    }
}
