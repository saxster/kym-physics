import SwiftUI
import WidgetKit
#if canImport(ActivityKit) && os(iOS)
import ActivityKit
#endif

struct KymPhysicsWidgetSnapshot: Codable {
    let updatedAt: Date
    let dueCardsCount: Int
    let provenQuestionsCount: Int
    let totalQuestionsCount: Int
    let nextDeadlineTitle: String
    let nextDeadlineDate: Date?
    let activeUnitTitle: String
    let activeChapterTitle: String
}

struct KymPhysicsWidgetEntry: TimelineEntry {
    let date: Date
    let dueCardsCount: Int
    let activeUnitTitle: String
    let activeChapterTitle: String
    let provenRatioText: String
    let nextDeadlineTitle: String
}

struct KymPhysicsTimelineProvider: TimelineProvider {
    private func defaultEntry() -> KymPhysicsWidgetEntry {
        KymPhysicsWidgetEntry(
            date: Date(),
            dueCardsCount: 8,
            activeUnitTitle: "Unit 9: Magnetism",
            activeChapterTitle: "Ch 13 · Magnets and motors",
            provenRatioText: "14/45 Proven",
            nextDeadlineTitle: "Unit 9 Magnetism Check"
        )
    }

    func placeholder(in context: Context) -> KymPhysicsWidgetEntry {
        defaultEntry()
    }

    func getSnapshot(in context: Context, completion: @escaping (KymPhysicsWidgetEntry) -> Void) {
        completion(loadEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<KymPhysicsWidgetEntry>) -> Void) {
        let entry = loadEntry()
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 30, to: Date()) ?? Date()
        completion(Timeline(entries: [entry], policy: .after(nextUpdate)))
    }

    private func loadEntry() -> KymPhysicsWidgetEntry {
        let defaults = UserDefaults(suiteName: "group.com.kymaia.science") ?? .standard
        if let data = defaults.data(forKey: "kymphysics.system.snapshot.v1"),
           let decoded = try? JSONDecoder().decode(KymPhysicsWidgetSnapshot.self, from: data) {
            return KymPhysicsWidgetEntry(
                date: decoded.updatedAt,
                dueCardsCount: decoded.dueCardsCount,
                activeUnitTitle: "Unit 9: \(decoded.activeUnitTitle)",
                activeChapterTitle: decoded.activeChapterTitle,
                provenRatioText: "\(decoded.provenQuestionsCount)/\(decoded.totalQuestionsCount) Proven",
                nextDeadlineTitle: decoded.nextDeadlineTitle
            )
        }
        return defaultEntry()
    }
}

struct KymPhysicsDailyGlanceWidgetView: View {
    var entry: KymPhysicsTimelineProvider.Entry

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Label("KymPhysics", systemImage: "gyroscope")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(Color(red: 0.34, green: 0.25, blue: 0.68))
                Spacer()
                Text(entry.provenRatioText)
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(.secondary)
            }

            Text(entry.activeUnitTitle)
                .font(.subheadline.weight(.bold))
                .lineLimit(1)

            Text("\(entry.activeChapterTitle) · \(entry.nextDeadlineTitle)")
                .font(.caption)
                .foregroundStyle(.secondary)
                .lineLimit(2)

            Spacer(minLength: 0)

            HStack {
                Label("\(entry.dueCardsCount) cards due", systemImage: "rectangle.stack.fill")
                    .font(.caption2.weight(.semibold))
                Spacer()
                Text("Open Lab →")
                    .font(.caption2.weight(.bold))
                    .foregroundStyle(Color(red: 0.34, green: 0.25, blue: 0.68))
            }
        }
        .padding(12)
        .containerBackground(.fill.tertiary, for: .widget)
    }
}

@main
struct KymPhysicsWidgetsBundle: WidgetBundle {
    var body: some Widget {
        KymPhysicsDailyGlanceWidget()
    }
}

struct KymPhysicsDailyGlanceWidget: Widget {
    let kind: String = "KymPhysicsDailyGlanceWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: KymPhysicsTimelineProvider()) { entry in
            KymPhysicsDailyGlanceWidgetView(entry: entry)
        }
        .configurationDisplayName("KymPhysics Daily Study Glance")
        .description("Shows your upcoming Cambridge Science 8 Physics unit, due FSRS memory cards, and Question Proof count.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
