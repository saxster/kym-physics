import SwiftUI
import WebKit

struct LabsExplorersHomeView: View {
    @EnvironmentObject private var store: AppStore
    @State private var selectedTab: String = "widgets" // "widgets" | "explorers" | "investigations" | "sensors" | "visuals"
    @State private var selectedChapterFilter: Int? = nil
    @State private var selectedInvestigationChapter: Int? = nil
    @State private var selectedInvestigationCategory: String = "all"
    @State private var activeWatchStepIndex: Int = 0
    @State private var showingCutaway: Bool = false
    @State private var showLiveWebGLSimulation: Bool = true
    @State private var sliderParameter: Double = 0.60

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
        guard let ch = selectedChapterFilter else { return store.pack.widgets }
        return store.pack.widgets.filter { $0.chapter == ch }
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
            title: "3D Physics Labs, Sensors & Explorers",
            subtitle: "56 Interactive Simulations · 4 Front-Matter Explorers · 126 Investigations · iPad Sensor Bench",
            headerAccessory: {
                ThemePickerMenu()
            }
        ) {
            // 1. Mode Switcher
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Spacing.sm) {
                    Button { selectedTab = "widgets" } label: {
                        JournalChip(title: "56 Live Simulations", isSelected: selectedTab == "widgets")
                    }
                    .buttonStyle(.plain)

                    Button { selectedTab = "explorers" } label: {
                        JournalChip(title: "4 Front-Matter Explorers", isSelected: selectedTab == "explorers")
                    }
                    .buttonStyle(.plain)

                    Button { selectedTab = "investigations" } label: {
                        JournalChip(title: "126 Investigations & Atlas", isSelected: selectedTab == "investigations")
                    }
                    .buttonStyle(.plain)

                    Button { selectedTab = "sensors" } label: {
                        JournalChip(title: "iPad Hardware Sensors & 240 fps", isSelected: selectedTab == "sensors")
                    }
                    .buttonStyle(.plain)

                    Button { selectedTab = "arduino" } label: {
                        JournalChip(title: "Arduino Hardware Missions", isSelected: selectedTab == "arduino")
                    }
                    .buttonStyle(.plain)

                    Button { selectedTab = "visuals" } label: {
                        JournalChip(title: "Cambridge Concept Visuals", isSelected: selectedTab == "visuals")
                    }
                    .buttonStyle(.plain)
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
                                            .font(.title2)
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
                                        Button {
                                            store.activeExplorerId = exp.id
                                        } label: {
                                            JournalChip(
                                                title: store.activeExplorerId == exp.id ? "Active Below ✓" : "Open Interactive Explorer",
                                                isSelected: store.activeExplorerId == exp.id
                                            )
                                        }
                                        .buttonStyle(.plain)
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
                            MovingWorldLiveTargetWebView(targetSelector: "#explore-\(activeExpId), [data-live='\(activeExpId)']")
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
                                Button {
                                    selectedInvestigationCategory = cat
                                } label: {
                                    JournalChip(
                                        title: cat == "all" ? "All Categories (\(store.pack.investigations.count))" : cat.capitalized,
                                        isSelected: selectedInvestigationCategory == cat
                                    )
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }

                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: Spacing.xs) {
                            Button {
                                selectedInvestigationChapter = nil
                            } label: {
                                JournalChip(
                                    title: "All Chapters",
                                    isSelected: selectedInvestigationChapter == nil
                                )
                            }
                            .buttonStyle(.plain)

                            ForEach(0..<16, id: \.self) { ch in
                                Button {
                                    selectedInvestigationChapter = ch
                                } label: {
                                    JournalChip(
                                        title: "Ch \(ch)",
                                        isSelected: selectedInvestigationChapter == ch
                                    )
                                }
                                .buttonStyle(.plain)
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
                                    targetSelector: "[data-live='\(activeWidget.id)'], #c\(activeWidget.chapter)"
                                )
                                .frame(minHeight: 460)
                                .clipShape(RoundedRectangle(cornerRadius: CornerRadius.md, style: .continuous))
                            }

                            // Interactive Canvas Preview + Parameter Control
                            InteractivePhysicsCanvasView(
                                widget: activeWidget,
                                parameter: sliderParameter,
                                showingCutaway: showingCutaway
                            )
                            .frame(height: 200)
                            .clipShape(RoundedRectangle(cornerRadius: CornerRadius.md, style: .continuous))

                            HStack {
                                Text("Control Parameter:")
                                    .font(.kymaiaCaption.weight(.semibold))
                                Slider(value: $sliderParameter, in: 0.0...1.0)
                                Text(String(format: "%.2f", sliderParameter))
                                    .font(.system(.caption, design: .monospaced))
                                Toggle("Inside Cut-away View", isOn: $showingCutaway)
                                    .toggleStyle(.button)
                                    .font(.kymaiaCaption)
                            }

                            if showingCutaway {
                                Text("Inside Cut-away: \(activeWidget.cutaway)")
                                    .font(.kymaiaCallout)
                                    .foregroundStyle(Color.kymaiaSecondary)
                            }

                            // 5-Step Choreographed Watch Tour
                            if !activeWidget.watchSteps.isEmpty {
                                VStack(alignment: .leading, spacing: Spacing.xs) {
                                    Text("Choreographed Watch Tour")
                                        .font(.kymaiaCaption.weight(.bold))
                                        .foregroundStyle(Color.kymaiaMutedInk)
                                    ScrollView(.horizontal, showsIndicators: false) {
                                        HStack(spacing: Spacing.xs) {
                                            ForEach(Array(activeWidget.watchSteps.enumerated()), id: \.offset) { idx, step in
                                                Button {
                                                    activeWatchStepIndex = idx
                                                    showingCutaway = step.title.lowercased().contains("cut-away")
                                                } label: {
                                                    JournalChip(
                                                        title: step.title,
                                                        isSelected: activeWatchStepIndex == idx
                                                    )
                                                }
                                                .buttonStyle(.plain)
                                            }
                                        }
                                    }
                                    let safeIdx = min(activeWatchStepIndex, activeWidget.watchSteps.count - 1)
                                    Text(activeWidget.watchSteps[max(0, safeIdx)].caption)
                                        .font(.kymaiaCallout)
                                        .foregroundStyle(Color.kymaiaInk)
                                }
                            }

                            // Challenge + Freeze to Lab Log Actions
                            VStack(alignment: .leading, spacing: Spacing.xs) {
                                Text("Micro-Challenge: \(activeWidget.challengePrompt)")
                                    .font(.kymaiaCallout.weight(.semibold))
                                    .foregroundStyle(Color.kymaiaPrimary)
                                Text("What the model simplifies: \(activeWidget.idealised)")
                                    .font(.kymaiaCaption)
                                    .foregroundStyle(Color.kymaiaMutedInk)

                                HStack(spacing: Spacing.md) {
                                    Button {
                                        store.earnWidgetChallengeStamp(
                                            widgetId: activeWidget.id,
                                            chapterNumber: activeWidget.chapter,
                                            readout: String(format: "param=%.2f, cutaway=%@", sliderParameter, showingCutaway.description)
                                        )
                                    } label: {
                                        Label("Complete Challenge & Earn Stamp", systemImage: "seal.fill")
                                            .font(.kymaiaCallout.weight(.semibold))
                                    }
                                    .buttonStyle(.borderedProminent)
                                    .tint(Color.kymaiaPrimary)

                                    Button {
                                        _ = store.freezeWidgetIntoLabLog(
                                            widget: activeWidget,
                                            readout: String(format: "Parameter = %.2f · Watch step %d", sliderParameter, activeWatchStepIndex + 1)
                                        )
                                    } label: {
                                        Label("Freeze State to Lab Notebook", systemImage: "camera.aperture")
                                            .font(.kymaiaCallout)
                                    }
                                    .buttonStyle(.bordered)
                                }
                            }
                        }
                    }
                }

                // All 56 Widgets Grid
                JournalSection(title: "All \(store.pack.widgets.count) Interactive Physics Simulations") {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: Spacing.xs) {
                            Button { selectedChapterFilter = nil } label: {
                                JournalChip(title: "All Chapters", isSelected: selectedChapterFilter == nil)
                            }
                            .buttonStyle(.plain)
                            ForEach(0..<16, id: \.self) { ch in
                                Button { selectedChapterFilter = ch } label: {
                                    JournalChip(title: "Ch \(ch)", isSelected: selectedChapterFilter == ch)
                                }
                                .buttonStyle(.plain)
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
                                        HStack {
                                            JournalBadge(text: "Ch \(w.chapter)", tone: .accent)
                                            if w.is3D {
                                                JournalBadge(text: "3D", tone: .neutral)
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

// MARK: - Interactive Physics Vector / Wave / Field Canvas Preview

private struct InteractivePhysicsCanvasView: View {
    let widget: InteractiveWidgetSpec
    let parameter: Double
    let showingCutaway: Bool

    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: CornerRadius.md, style: .continuous)
                .fill(Color.kymaiaSurface)
            Canvas { context, size in
                let midY = size.height * 0.5
                let midX = size.width * 0.5

                // Draw sinusoidal wave / field lines + vector arrow responsive to parameter
                var wave = Path()
                let amp = CGFloat(25.0 + parameter * 55.0)
                let freq = CGFloat(2.0 + parameter * 4.0)
                for x in stride(from: 24.0, through: size.width - 24.0, by: 3.0) {
                    let normX = (x - 24.0) / (size.width - 48.0)
                    let y = midY + sin(normX * .pi * 2.0 * freq) * amp * 0.65
                    if x == 24.0 {
                        wave.move(to: CGPoint(x: x, y: y))
                    } else {
                        wave.addLine(to: CGPoint(x: x, y: y))
                    }
                }
                context.stroke(wave, with: .color(.kymaiaSecondary), lineWidth: 2.5)

                // Vector arrow
                var arrow = Path()
                let len = CGFloat(50.0 + parameter * 140.0)
                arrow.move(to: CGPoint(x: midX - len * 0.5, y: midY))
                arrow.addLine(to: CGPoint(x: midX + len * 0.5, y: midY))
                arrow.move(to: CGPoint(x: midX + len * 0.5 - 12, y: midY - 8))
                arrow.addLine(to: CGPoint(x: midX + len * 0.5, y: midY))
                arrow.addLine(to: CGPoint(x: midX + len * 0.5 - 12, y: midY + 8))
                context.stroke(arrow, with: .color(.kymaiaPrimary), lineWidth: 3.5)

                if showingCutaway {
                    let rect = CGRect(x: midX - 90, y: midY - 60, width: 180, height: 120)
                    context.stroke(Path(roundedRect: rect, cornerRadius: 12), with: .color(.kymaiaPrimary), style: StrokeStyle(lineWidth: 1.5, dash: [6, 4]))
                }
            }
            VStack {
                HStack {
                    Text("\(widget.id) · Live Readout = \(String(format: "%.2f", parameter * 10.0)) SI units")
                        .font(.system(.caption, design: .monospaced).weight(.semibold))
                        .padding(Spacing.xs)
                        .background(Color.kymaiaSurfaceElevated, in: Capsule())
                        .overlay(Capsule().strokeBorder(Color.kymaiaSurfaceBorder, lineWidth: 1))
                    Spacer()
                }
                Spacer()
            }
            .padding(Spacing.sm)
        }
    }
}

// MARK: - Live WebGL / Three.js Simulation & Explorer WebView (loads MovingWorldBook/index.html & focuses target widget/explorer)

#if os(macOS)
struct MovingWorldLiveTargetWebView: NSViewRepresentable {
    let targetSelector: String

    func makeNSView(context: Context) -> WKWebView {
        let webView = WKWebView(frame: .zero)
        MovingWorldWebBookView.loadBook(in: webView, chapterNumber: 0)
        return webView
    }

    func updateNSView(_ webView: WKWebView, context: Context) {
        let escaped = targetSelector.replacingOccurrences(of: "\"", with: "\\\"")
        let js = """
        (function() {
            const el = document.querySelector("\(escaped)");
            if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
        })();
        """
        webView.evaluateJavaScript(js, completionHandler: nil)
    }
}
#else
struct MovingWorldLiveTargetWebView: UIViewRepresentable {
    let targetSelector: String

    func makeUIView(context: Context) -> WKWebView {
        let webView = WKWebView(frame: .zero)
        if let url = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "MovingWorldBook") {
            webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
        }
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        let escaped = targetSelector.replacingOccurrences(of: "\"", with: "\\\"")
        let js = """
        (function() {
            const el = document.querySelector("\(escaped)");
            if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
        })();
        """
        webView.evaluateJavaScript(js, completionHandler: nil)
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
