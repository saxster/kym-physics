import SwiftUI
import WebKit

struct MovingWorldHomeView: View {
    @EnvironmentObject private var store: AppStore
    @State private var readerMode: String = "native" // "native" | "web" | "stories"
    @State private var revealedCallouts: Set<String> = []
    @State private var storyFilter: String = "all"   // "all" | "portrait" | "topic"

    private var activeChapter: MovingWorldChapter {
        store.pack.chapters.first(where: { $0.number == store.activeMovingWorldChapter })
            ?? store.pack.chapters.first
            ?? MovingWorldChapter(
                id: "ch00",
                number: 0,
                volumeNumber: 1,
                volumeTitle: "Volume I · How Things Move",
                title: "The physicist's way of seeing",
                subtitle: "Models, measurement, powers of ten and estimation",
                hookSummary: "",
                sections: [],
                callouts: [],
                keyTerms: [],
                widgets: []
            )
    }

    private var filteredStories: [MovingWorldStory] {
        if storyFilter == "all" { return store.pack.stories }
        return store.pack.stories.filter { $0.kind == storyFilter }
    }

    var body: some View {
        JournalReaderPage(
            eyebrow: AppRoom.movingWorld.title,
            title: "The Moving World · Ch \(activeChapter.number): \(activeChapter.title)",
            subtitle: "\(activeChapter.volumeTitle) · \(activeChapter.subtitle)",
            headerAccessory: {
                HStack(spacing: Spacing.sm) {
                    StandardFilterChip("Journal Reader", isSelected: readerMode == "native") {
                        readerMode = "native"
                    }

                    StandardFilterChip("Interactive Web Book", isSelected: readerMode == "web") {
                        readerMode = "web"
                    }

                    StandardFilterChip("95 Physics Stories", isSelected: readerMode == "stories") {
                        readerMode = "stories"
                    }

                    Button {
                        ChapterExplainerPlayer.shared.playChapter(activeChapter)
                    } label: {
                        Label("Listen", systemImage: "headphones")
                            .font(.kymaiaCaption.weight(.semibold))
                    }
                    .buttonStyle(.bordered)
                    .tint(Color.kymaiaAccent)

                    Button {
                        ChapterExplainerPlayer.shared.playTwoVoiceDialogue(for: activeChapter)
                    } label: {
                        Label("2-Voice Briefing", systemImage: "person.2.wave.2.fill")
                            .font(.kymaiaCaption.weight(.semibold))
                    }
                    .buttonStyle(.bordered)
                    .tint(Color.kymaiaPrimary)

                    StandardThemeMenu()
                }
            }
        ) {
            ChapterExplainerMiniBar()

            // 1. 16-Chapter Strip across 4 Volumes
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Spacing.xs) {
                    ForEach(store.pack.chapters) { ch in
                        StandardFilterChip("Ch \(ch.number) · \(ch.title)", isSelected: store.activeMovingWorldChapter == ch.number) {
                            store.activeMovingWorldChapter = ch.number
                        }
                    }
                }
            }

            if readerMode == "web" {
                JournalCard {
                    VStack(alignment: .leading, spacing: Spacing.sm) {
                        HStack {
                            JournalBadge(text: "Offline Interactive Web Edition", tone: .accent)
                            Text("Includes all 45+ embedded WebGL/Canvas simulations & margin equations")
                                .font(.kymaiaCaption)
                                .foregroundStyle(Color.kymaiaMutedInk)
                            Spacer()
                        }
                        MovingWorldWebBookView(chapterNumber: activeChapter.number, store: store)
                            .frame(minHeight: 680)
                            .clipShape(RoundedRectangle(cornerRadius: CornerRadius.md, style: .continuous))
                    }
                }
            } else if readerMode == "stories" {
                JournalSection(
                    title: "95 Historical & Everyday Physics Stories",
                    subtitle: "Portraits of Galileo, Newton, Faraday, Maxwell, Bhaskara, Raman & C.V. Boys alongside Mumbai everyday physics"
                ) {
                    HStack(spacing: Spacing.sm) {
                        StandardFilterChip("All (\(store.pack.stories.count))", isSelected: storyFilter == "all") { storyFilter = "all" }
                        StandardFilterChip("Physicist Portraits", isSelected: storyFilter == "portrait") { storyFilter = "portrait" }
                        StandardFilterChip("Everyday & Deep Topics", isSelected: storyFilter == "topic") { storyFilter = "topic" }
                    }

                    LazyVGrid(
                        columns: [GridItem(.flexible(), spacing: Spacing.md), GridItem(.flexible(), spacing: Spacing.md)],
                        spacing: Spacing.md
                    ) {
                        ForEach(filteredStories) { story in
                            JournalCard {
                                VStack(alignment: .leading, spacing: Spacing.xs) {
                                    HStack {
                                        JournalBadge(
                                            text: story.kind == "portrait" ? "Portrait" : "Deep Dive",
                                            tone: story.kind == "portrait" ? .accent : .neutral
                                        )
                                        Spacer()
                                    }
                                    Text(story.title)
                                        .font(.kymaiaHeadline)
                                        .foregroundStyle(Color.kymaiaInk)
                                    Text(story.excerpt)
                                        .font(.kymaiaReadingBody)
                                        .foregroundStyle(Color.kymaiaMutedInk)
                                        .lineLimit(5)
                                }
                            }
                        }
                    }
                }
            } else {
                // Native Apple Journal Reader Mode
                // Key Terms & Linked Simulations Bar
                JournalCard {
                    VStack(alignment: .leading, spacing: Spacing.sm) {
                        HStack {
                            JournalBadge(text: activeChapter.volumeTitle, tone: .accent)
                            Spacer()
                            Button {
                                store.updateChapterProgress(chapterNumber: activeChapter.number, fraction: 1.0, addCheck: true)
                            } label: {
                                Label("Mark Chapter Read", systemImage: "checkmark.circle.fill")
                                    .font(.kymaiaCaption.weight(.semibold))
                            }
                            .buttonStyle(BrassButtonStyle())
                        }

                        if !activeChapter.keyTerms.isEmpty {
                            Text("Key Concepts & Vocabulary")
                                .font(.kymaiaCaption.weight(.semibold))
                                .foregroundStyle(Color.kymaiaMutedInk)
                            FlowLayout(spacing: Spacing.xs) {
                                ForEach(activeChapter.keyTerms, id: \.self) { term in
                                    JournalBadge(text: term, tone: .neutral)
                                }
                            }
                        }

                        let chapterWidgets = store.pack.widgets.filter { $0.chapter == activeChapter.number }
                        if !chapterWidgets.isEmpty {
                            Divider()
                            Text("Interactive Simulations in Chapter \(activeChapter.number)")
                                .font(.kymaiaCaption.weight(.semibold))
                                .foregroundStyle(Color.kymaiaSecondary)
                            FlowLayout(spacing: Spacing.xs) {
                                ForEach(chapterWidgets) { widget in
                                    Button {
                                        store.activeWidgetId = widget.id
                                        store.selectedRoom = .labsExplorers
                                    } label: {
                                        Label(widget.title, systemImage: widget.is3D ? "cube.transparent.fill" : "slider.horizontal.3")
                                            .font(.kymaiaCaption.weight(.semibold))
                                    }
                                    .buttonStyle(.bordered)
                                }
                            }
                        }
                    }
                }

                // Chapter Sections
                JournalSection(
                    title: "Chapter \(activeChapter.number) Narrative Sections",
                    subtitle: "First-principles explanations grounded in Mumbai observations and classical experiments"
                ) {
                    VStack(spacing: Spacing.md) {
                        ForEach(activeChapter.sections) { sec in
                            JournalCard {
                                VStack(alignment: .leading, spacing: Spacing.sm) {
                                    Text(sec.heading)
                                        .font(.kymaiaTitle3)
                                        .foregroundStyle(Color.kymaiaInk)
                                    Text(sec.excerpt)
                                        .font(.kymaiaReadingBody)
                                        .foregroundStyle(Color.kymaiaInk)
                                }
                            }
                        }
                    }
                }

                // Interactive Callouts (:::predict, :::check, :::careful, :::school, :::five, :::try)
                if !activeChapter.callouts.isEmpty {
                    JournalSection(
                        title: "Predict First, Common Traps & 5-Minute Derivations",
                        subtitle: "Commit to a prediction before revealing the physical mechanism"
                    ) {
                        VStack(spacing: Spacing.md) {
                            ForEach(activeChapter.callouts) { callout in
                                let parts = callout.body.components(separatedBy: "???")
                                let promptPart = parts.first?.trimmingCharacters(in: .whitespacesAndNewlines) ?? callout.body
                                let answerPart = parts.count > 1 ? parts[1].trimmingCharacters(in: .whitespacesAndNewlines) : nil

                                JournalCard {
                                    VStack(alignment: .leading, spacing: Spacing.sm) {
                                        HStack {
                                            Label(callout.badgeText, systemImage: callout.symbolName)
                                                .font(.kymaiaCaption.weight(.bold))
                                                .foregroundStyle(Color.kymaiaPrimary)
                                            Spacer()
                                        }
                                        Text(callout.title)
                                            .font(.kymaiaHeadline)
                                            .foregroundStyle(Color.kymaiaInk)
                                        Text(promptPart)
                                            .font(.kymaiaReadingBody)
                                            .foregroundStyle(Color.kymaiaInk)

                                        if let ans = answerPart {
                                            if revealedCallouts.contains(callout.id) {
                                                Divider()
                                                Text(ans)
                                                    .font(.kymaiaReadingBody)
                                                    .foregroundStyle(Color.kymaiaSecondary)
                                            } else {
                                                Button("Commit Prediction & Reveal Explanation") {
                                                    revealedCallouts.insert(callout.id)
                                                    store.updateChapterProgress(
                                                        chapterNumber: activeChapter.number,
                                                        fraction: 0.5,
                                                        addPrediction: true
                                                    )
                                                }
                                                .buttonStyle(.bordered)
                                                .tint(Color.kymaiaPrimary)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

// MARK: - Offline WKWebView Wrapper for The Moving World Book

#if os(macOS)
struct MovingWorldWebBookView: NSViewRepresentable {
    let chapterNumber: Int
    let store: AppStore

    func makeCoordinator() -> MovingWorldBridgeController {
        MovingWorldBridgeController(store: store)
    }

    func makeNSView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.userContentController.addUserScript(MovingWorldBridgeController.injectedUserScript)
        config.userContentController.add(context.coordinator, name: MovingWorldBridgeController.handlerName)
        let webView = WKWebView(frame: .zero, configuration: config)
        Self.loadBook(in: webView, chapterNumber: chapterNumber)
        return webView
    }

    func updateNSView(_ webView: WKWebView, context: Context) {
        context.coordinator.store = store
        let js = "if (window.location.hash !== '#c\(chapterNumber)') { window.location.hash = '#c\(chapterNumber)'; }"
        webView.evaluateJavaScript(js, completionHandler: nil)
    }

    static func loadBook(in webView: WKWebView, chapterNumber: Int) {
        let candidates: [URL?] = [
            Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "MovingWorldBook"),
            URL(fileURLWithPath: "/Users/amarsukhi/src/MyCode/kym_physics/KymPhysics/KymPhysics/Resources/MovingWorldBook/index.html"),
            URL(fileURLWithPath: "/Users/amarsukhi/src/MyCode/kym_physics/index.html")
        ]
        for case let url? in candidates where FileManager.default.fileExists(atPath: url.path) {
            let dir = url.deletingLastPathComponent()
            webView.loadFileURL(url, allowingReadAccessTo: dir)
            return
        }
    }
}
#else
struct MovingWorldWebBookView: UIViewRepresentable {
    let chapterNumber: Int
    let store: AppStore

    func makeCoordinator() -> MovingWorldBridgeController {
        MovingWorldBridgeController(store: store)
    }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.userContentController.addUserScript(MovingWorldBridgeController.injectedUserScript)
        config.userContentController.add(context.coordinator, name: MovingWorldBridgeController.handlerName)
        let webView = WKWebView(frame: .zero, configuration: config)
        if let url = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "MovingWorldBook") {
            webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
        }
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        context.coordinator.store = store
        let js = "if (window.location.hash !== '#c\(chapterNumber)') { window.location.hash = '#c\(chapterNumber)'; }"
        webView.evaluateJavaScript(js, completionHandler: nil)
    }
}
#endif
