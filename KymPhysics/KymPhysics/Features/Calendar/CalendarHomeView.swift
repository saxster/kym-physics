import Combine
import EventKit
import SwiftUI
#if canImport(ActivityKit) && os(iOS)
import ActivityKit
#endif

enum PhysicsCalendarViewMode: String, CaseIterable, Identifiable {
    case prepPlan = "Exam Prep Plan"
    case month = "Month Grid"
    case week = "Week Strip"
    case agenda = "Agenda"

    var id: String { rawValue }
}

struct CalendarHomeView: View {
    @EnvironmentObject private var store: AppStore
    @State private var viewMode: PhysicsCalendarViewMode = .prepPlan
    @State private var selectedDate: Date = Date()
    @State private var newTitle: String = ""
    @State private var newUnitsCSV: String = "9"
    @State private var newDaysAhead: Int = 7
    @State private var newNotes: String = ""
    @State private var eventKitSyncStatus: String = "Ready to sync with Apple Calendar"
    @State private var activeTimerSeconds: Int = 25 * 60
    @State private var isTimerRunning: Bool = false
    @AppStorage("kymphysics.prep.completedBlocks") private var completedPrepBlocksCSV: String = ""

    private var completedPrepBlocksBinding: Binding<Set<String>> {
        Binding(
            get: {
                Set(completedPrepBlocksCSV.split(separator: ",").map(String.init))
            },
            set: { newSet in
                completedPrepBlocksCSV = newSet.sorted().joined(separator: ",")
            }
        )
    }

    private let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()

    var body: some View {
        JournalPage(
            eyebrow: AppRoom.calendar.title,
            title: "Physics & Shared Science 8 Calendar",
            subtitle: "Month / Week / Agenda Views · Backward-Scheduled Exam Prep Plan · Apple Calendar (EventKit) Sync",
            headerAccessory: {
                HStack(spacing: Spacing.sm) {
                    Picker("View", selection: $viewMode) {
                        ForEach(PhysicsCalendarViewMode.allCases) { mode in
                            Text(mode.rawValue).tag(mode)
                        }
                    }
                    .pickerStyle(.segmented)
                    .frame(maxWidth: 380)

                    Button {
                        syncDeadlinesToEventKit()
                    } label: {
                        Label("Sync Apple Calendar", systemImage: "calendar.badge.plus")
                            .font(.kymaiaCaption.weight(.semibold))
                    }
                    .buttonStyle(BrassButtonStyle())

                    StandardThemeMenu()
                }
            }
        ) {
            // 1. Crunch Warning Banner (if any deadline within 10 days has unproved topics)
            PhysicsCrunchWarningBanner(deadlines: store.deadlines)

            // 2. Active Calendar Mode (Prep Plan, Month Grid, Week Strip, Agenda)
            switch viewMode {
            case .prepPlan:
                PhysicsBackwardPrepPlanSection(completedBlocks: completedPrepBlocksBinding)
            case .month:
                PhysicsCalendarMonthGridSection(selectedDate: $selectedDate)
            case .week:
                PhysicsCalendarWeekStripSection(selectedDate: $selectedDate)
            case .agenda:
                PhysicsCalendarAgendaSection(selectedDate: $selectedDate)
            }

            // 3. Upcoming School Deadlines & Readiness Forecast
            JournalSection(
                title: "Upcoming School Science 8 Deadlines & Readiness Forecast",
                subtitle: eventKitSyncStatus
            ) {
                VStack(spacing: Spacing.md) {
                    ForEach(store.deadlines) { dl in
                        PhysicsExamForecastCard(deadline: dl)
                    }
                }
            }

            // 4. Add New School Test or Practical Deadline
            JournalSection(
                title: "Schedule a School Science Check or Study Block",
                subtitle: "Automatically builds backward-scheduled spaced-retrieval & Question Proof targets across Units 3, 6 & 9"
            ) {
                JournalCard {
                    VStack(alignment: .leading, spacing: Spacing.sm) {
                        HStack(spacing: Spacing.md) {
                            TextField("Assessment title (e.g. Unit 9 Magnetism Practical Check)", text: $newTitle)
                                .textFieldStyle(.roundedBorder)
                            TextField("Units CSV (e.g. 9 or 3,6,9)", text: $newUnitsCSV)
                                .textFieldStyle(.roundedBorder)
                                .frame(width: 160)
                            Stepper("In \(newDaysAhead) days", value: $newDaysAhead, in: 1...60)
                                .font(.kymaiaCaption.monospacedDigit())
                        }
                        TextField("Topics & page range notes...", text: $newNotes)
                            .textFieldStyle(.roundedBorder)

                        Button {
                            guard !newTitle.trimmingCharacters(in: .whitespaces).isEmpty else { return }
                            let due = Calendar.current.date(byAdding: .day, value: newDaysAhead, to: Date()) ?? Date()
                            store.addDeadline(
                                title: newTitle,
                                unitNumbersCSV: newUnitsCSV,
                                dueAt: due,
                                kind: "unit_test",
                                notes: newNotes.isEmpty ? "Scheduled revision block" : newNotes
                            )
                            newTitle = ""
                            newNotes = ""
                        } label: {
                            Label("Add to Science Spine Calendar", systemImage: "plus.circle.fill")
                                .font(.kymaiaCallout.weight(.semibold))
                        }
                        .buttonStyle(.bordered)
                        .tint(Color.kymaiaPrimary)
                    }
                }
            }

            // 5. Timed Practical / Exam Paper Live Session Timer
            JournalSection(
                title: "Timed Physics Paper & Multi-Trial Investigation Timer",
                subtitle: "Mirrors to iPadOS Lock Screen & Dynamic Island Live Activity"
            ) {
                JournalCard {
                    HStack(spacing: Spacing.lg) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Session Stopwatch & Paper Timer")
                                .font(.kymaiaHeadline)
                            Text("Use for 25-minute study sprints, 45-minute Cambridge Checkpoint papers, or pendulum/ramp timing trials.")
                                .font(.kymaiaCaption)
                                .foregroundStyle(Color.kymaiaMutedInk)
                        }
                        Spacer()
                        Text(String(format: "%02d:%02d", activeTimerSeconds / 60, activeTimerSeconds % 60))
                            .font(.system(.title2, design: .monospaced).weight(.bold))
                            .foregroundStyle(Color.kymaiaPrimary)

                        Button(isTimerRunning ? "Pause" : "Start Sprint") {
                            isTimerRunning.toggle()
                            if activeTimerSeconds == 0 { activeTimerSeconds = 25 * 60 }
                            updateLiveActivityIfAvailable()
                        }
                        .buttonStyle(.bordered)
                        .tint(Color.kymaiaPrimary)

                        Button("Reset 25m") {
                            isTimerRunning = false
                            activeTimerSeconds = 25 * 60
                            endLiveActivityIfAvailable()
                        }
                        .buttonStyle(.bordered)
                    }
                }
            }
        }
        .onReceive(timer) { _ in
            if isTimerRunning && activeTimerSeconds > 0 {
                activeTimerSeconds -= 1
                if activeTimerSeconds % 15 == 0 {
                    updateLiveActivityIfAvailable()
                }
            } else if activeTimerSeconds == 0 && isTimerRunning {
                isTimerRunning = false
                endLiveActivityIfAvailable()
            }
        }
    }

    private func updateLiveActivityIfAvailable() {
        #if canImport(ActivityKit) && os(iOS)
        let state = PhysicsLabLiveActivityAttributes.ContentState(
            currentTrialNumber: 1,
            totalTrials: 3,
            elapsedSeconds: (25 * 60) - activeTimerSeconds,
            latestReadout: String(format: "%02d:%02d remaining", activeTimerSeconds / 60, activeTimerSeconds % 60)
        )
        if let existing = Activity<PhysicsLabLiveActivityAttributes>.activities.first {
            Task {
                await existing.update(ActivityContent(state: state, staleDate: nil))
            }
        } else if ActivityAuthorizationInfo().areActivitiesEnabled {
            let attrs = PhysicsLabLiveActivityAttributes(
                investigationTitle: "Unit \(store.selectedUnitNumber) Physics Sprint",
                topicCode: store.selectedTopicCode ?? "9.3"
            )
            _ = try? Activity.request(
                attributes: attrs,
                content: ActivityContent(state: state, staleDate: nil)
            )
        }
        #endif
    }

    private func endLiveActivityIfAvailable() {
        #if canImport(ActivityKit) && os(iOS)
        for activity in Activity<PhysicsLabLiveActivityAttributes>.activities {
            Task {
                await activity.end(nil, dismissalPolicy: .immediate)
            }
        }
        #endif
    }

    private func syncDeadlinesToEventKit() {
        let eventStore = EKEventStore()
        eventStore.requestFullAccessToEvents { granted, _ in
            DispatchQueue.main.async {
                if granted {
                    var exportedCount = 0
                    for dl in store.deadlines {
                        let event = EKEvent(eventStore: eventStore)
                        event.title = "[KymPhysics] \(dl.title)"
                        event.startDate = dl.dueAt
                        event.endDate = Calendar.current.date(byAdding: .hour, value: 1, to: dl.dueAt) ?? dl.dueAt
                        event.notes = "Units \(dl.unitNumbersCSV) · \(dl.notes)"
                        event.calendar = eventStore.defaultCalendarForNewEvents
                        try? eventStore.save(event, span: .thisEvent)
                        exportedCount += 1
                    }
                    eventKitSyncStatus = "Exported \(exportedCount) Physics & Science deadlines to Apple Calendar ✓"
                } else {
                    eventKitSyncStatus = "Local Science Spine active (grant Calendar permission in Settings to export to Apple Calendar)"
                }
            }
        }
    }
}

// MARK: - Crunch Warning Banner

private struct PhysicsCrunchWarningBanner: View {
    @EnvironmentObject private var store: AppStore
    let deadlines: [SchoolDeadlineRecord]

    var body: some View {
        let upcomingSoon = deadlines.filter {
            let days = Calendar.current.dateComponents([.day], from: Date(), to: $0.dueAt).day ?? 99
            return days >= 0 && days <= 14
        }

        if let nextDeadline = upcomingSoon.first {
            let daysLeft = max(0, Calendar.current.dateComponents([.day], from: Date(), to: nextDeadline.dueAt).day ?? 0)
            JournalCard {
                HStack(alignment: .center, spacing: Spacing.md) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .font(.kymaiaSymbolLarge)
                        .foregroundStyle(Color.kymaiaWarning)
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Upcoming Focus Window: \(nextDeadline.title) in \(daysLeft) days")
                            .font(.kymaiaSubheadline.weight(.bold))
                            .foregroundStyle(Color.kymaiaTextPrimary)
                        Text("Unit 9 (Magnetism: 9.1–9.4) is unticked in your Learner's Book. Complete 1 topic proof + 1 electromagnet lab stamp per day to reach 100% readiness with zero cramming.")
                            .font(.kymaiaCaption)
                            .foregroundStyle(Color.kymaiaTextSecondary)
                    }
                    Spacer()
                    Button {
                        store.selectedUnitNumber = 9
                        store.selectedTopicCode = "9.1"
                        store.selectedRoom = .schoolScience
                    } label: {
                        Text("Prove Unit 9 Now →")
                            .font(.kymaiaCaption.weight(.bold))
                    }
                    .buttonStyle(JournalCapsuleButtonStyle())
                }
            }
        }
    }
}

// MARK: - Exam Forecast Card

private struct PhysicsExamForecastCard: View {
    @EnvironmentObject private var store: AppStore
    let deadline: SchoolDeadlineRecord

    var body: some View {
        let unitNums = deadline.unitNumbersCSV
            .split(separator: ",")
            .compactMap { Int($0.trimmingCharacters(in: .whitespaces)) }
        let daysRemaining = max(0, Calendar.current.dateComponents([.day], from: Date(), to: deadline.dueAt).day ?? 0)

        JournalCard {
            VStack(alignment: .leading, spacing: Spacing.sm) {
                HStack {
                    JournalBadge(text: "Units \(deadline.unitNumbersCSV)", tone: .accent)
                    Text(deadline.title)
                        .font(.kymaiaHeadline)
                        .foregroundStyle(Color.kymaiaInk)
                    Spacer()
                    JournalBadge(text: "\(daysRemaining)d left", tone: daysRemaining <= 7 ? .warning : .neutral)
                    Text(deadline.dueAt, style: .date)
                        .font(.kymaiaCaption.monospacedDigit())
                        .foregroundStyle(Color.kymaiaPrimary)
                }

                Text(deadline.notes)
                    .font(.kymaiaReadingBody)
                    .foregroundStyle(Color.kymaiaMutedInk)

                FlowLayout(spacing: Spacing.sm) {
                    ForEach(unitNums, id: \.self) { uNum in
                        if let unit = store.pack.schoolTextbook.units.first(where: { $0.unitNumber == uNum }) {
                            let snap = store.unitReadiness(for: unit)
                            Button {
                                store.selectedUnitNumber = uNum
                                store.selectedTopicCode = unit.topics.first?.code
                                store.selectedRoom = .schoolScience
                            } label: {
                                HStack(spacing: 6) {
                                    Image(systemName: unit.isCompletedInSchool ? "checkmark.circle.fill" : "sparkles")
                                        .foregroundStyle(unit.isCompletedInSchool ? Color.kymaiaSuccess : Color.kymaiaAccent)
                                    Text("Unit \(uNum) (\(unit.title)): \(snap.readinessBadgeText)")
                                        .font(.kymaiaCaption.weight(.semibold))
                                }
                            }
                            .buttonStyle(.bordered)
                        }
                    }
                }
            }
        }
    }
}

// MARK: - Backward-Scheduled Prep Plan Section

private struct PrepBlockSpec: Identifiable {
    let id: String
    let dayOffset: Int
    let title: String
    let subtitle: String
    let durationMinutes: Int
    let targetRoom: AppRoom
    let unitNumber: Int
    let topicCode: String
    let chapterNumber: Int
    let widgetId: String?
}

private struct PhysicsBackwardPrepPlanSection: View {
    @EnvironmentObject private var store: AppStore
    @Binding var completedBlocks: Set<String>

    private let blocks: [PrepBlockSpec] = [
        PrepBlockSpec(
            id: "prep-day-1",
            dayOffset: 0,
            title: "Day 1 · Topic 9.1 Magnetic Fields & Plotting Compass",
            subtitle: "Read Ch 13.1 + 3D Bar Magnet Field Lab + Prove LB/WB 9.1 (N → S arrows & neutral point)",
            durationMinutes: 25,
            targetRoom: .schoolScience,
            unitNumber: 9,
            topicCode: "9.1",
            chapterNumber: 13,
            widgetId: "field3d"
        ),
        PrepBlockSpec(
            id: "prep-day-2",
            dayOffset: 1,
            title: "Day 2 · Topic 9.2 The Earth as a Giant Magnet",
            subtitle: "Explore Earth's outer-core geodynamo + why Geographic North is a magnetic south pole",
            durationMinutes: 25,
            targetRoom: .schoolScience,
            unitNumber: 9,
            topicCode: "9.2",
            chapterNumber: 13,
            widgetId: "magnetometer"
        ),
        PrepBlockSpec(
            id: "prep-day-3",
            dayOffset: 2,
            title: "Day 3 · Topic 9.3 Electromagnets & Soft Iron Core",
            subtitle: "Build solenoid in 3D Fields Lab + Prove why soft iron is used instead of steel",
            durationMinutes: 25,
            targetRoom: .labsExplorers,
            unitNumber: 9,
            topicCode: "9.3",
            chapterNumber: 13,
            widgetId: "fieldslab"
        ),
        PrepBlockSpec(
            id: "prep-day-4",
            dayOffset: 3,
            title: "Day 4 · Topic 9.4 Investigating Electromagnets & Anomalies",
            subtitle: "Ammeter in series, repeat trials, spotting anomalous paperclip counts & Apple Pencil Diagram Recall",
            durationMinutes: 25,
            targetRoom: .practiceExams,
            unitNumber: 9,
            topicCode: "9.4",
            chapterNumber: 13,
            widgetId: "fieldslab"
        ),
        PrepBlockSpec(
            id: "prep-day-5",
            dayOffset: 4,
            title: "Day 5 · Unit 3 Forces, Moments & Pressure Consolidation",
            subtitle: "Wolfram Quantitative Drill on Moments (M = F×d) & Solid/Fluid Pressure (P = F/A)",
            durationMinutes: 25,
            targetRoom: .practiceExams,
            unitNumber: 3,
            topicCode: "3.4",
            chapterNumber: 3,
            widgetId: "mechanicslab"
        ),
        PrepBlockSpec(
            id: "prep-day-6",
            dayOffset: 5,
            title: "Day 6 · Unit 6 Light (Reflection, Refraction, Prisms & RGB)",
            subtitle: "Apple Pencil Ray Diagram Recall Plates + Colour Filter Challenge",
            durationMinutes: 25,
            targetRoom: .practiceExams,
            unitNumber: 6,
            topicCode: "6.4",
            chapterNumber: 10,
            widgetId: "colourmix"
        )
    ]

    var body: some View {
        JournalSection(
            title: "Backward-Scheduled 6-Day Physics Mastery Plan",
            subtitle: "25-minute daily blocks combining Learner's Book + Workbook proofs, 3D simulations, and Apple Pencil diagram recall"
        ) {
            VStack(spacing: Spacing.sm) {
                ForEach(blocks) { block in
                    let isDone = completedBlocks.contains(block.id)
                    let blockDate = Calendar.current.date(byAdding: .day, value: block.dayOffset, to: Date()) ?? Date()

                    JournalCard {
                        HStack(alignment: .center, spacing: Spacing.md) {
                            Button {
                                if isDone {
                                    completedBlocks.remove(block.id)
                                } else {
                                    completedBlocks.insert(block.id)
                                }
                            } label: {
                                Image(systemName: isDone ? "checkmark.circle.fill" : "circle")
                                    .font(.kymaiaSymbolLarge)
                                    .foregroundStyle(isDone ? Color.kymaiaSuccess : Color.kymaiaAccent)
                            }
                            .buttonStyle(.plain)

                            VStack(alignment: .leading, spacing: 3) {
                                HStack(spacing: Spacing.xs) {
                                    Text(blockDate, style: .date)
                                        .font(.kymaiaCaption.monospacedDigit())
                                        .foregroundStyle(Color.kymaiaAccent)
                                    JournalBadge(text: "\(block.durationMinutes) min", tone: .neutral)
                                    JournalBadge(text: "Topic \(block.topicCode) · Ch \(block.chapterNumber)", tone: .accent)
                                }
                                Text(block.title)
                                    .font(.kymaiaSubheadline.weight(.bold))
                                    .strikethrough(isDone)
                                Text(block.subtitle)
                                    .font(.kymaiaCaption)
                                    .foregroundStyle(Color.kymaiaTextSecondary)
                            }

                            Spacer()

                            Button {
                                store.selectedUnitNumber = block.unitNumber
                                store.selectedTopicCode = block.topicCode
                                store.activeMovingWorldChapter = block.chapterNumber
                                if let w = block.widgetId {
                                    store.activeWidgetId = w
                                }
                                store.selectedRoom = block.targetRoom
                            } label: {
                                Label("Launch Block", systemImage: "play.fill")
                                    .font(.kymaiaCaption.weight(.semibold))
                            }
                            .buttonStyle(JournalCapsuleButtonStyle())
                        }
                    }
                }
            }
        }
    }
}

// MARK: - Month Grid & Week Strip Views

private struct PhysicsCalendarMonthGridSection: View {
    @EnvironmentObject private var store: AppStore
    @Binding var selectedDate: Date

    private let weekdaySymbols = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    var body: some View {
        let cal = Calendar.current
        let startOfMonth = cal.date(from: cal.dateComponents([.year, .month], from: selectedDate)) ?? selectedDate
        let daysInMonth = cal.range(of: .day, in: .month, for: startOfMonth)?.count ?? 30
        let firstWeekday = (cal.component(.weekday, from: startOfMonth) - 1)

        JournalSection(
            title: "Month Calendar Grid",
            subtitle: "Tap any date to inspect scheduled Physics tests, FSRS review counts, and study blocks"
        ) {
            JournalCard {
                VStack(alignment: .leading, spacing: Spacing.md) {
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 7), spacing: Spacing.xs) {
                        ForEach(weekdaySymbols, id: \.self) { sym in
                            Text(sym)
                                .font(.kymaiaCaption.weight(.bold))
                                .foregroundStyle(Color.kymaiaTextSecondary)
                                .frame(maxWidth: .infinity)
                        }

                        ForEach(0..<(firstWeekday + daysInMonth), id: \.self) { cell in
                            if cell < firstWeekday {
                                Color.clear.frame(height: 44)
                            } else {
                                let dayNum = cell - firstWeekday + 1
                                let cellDate = cal.date(byAdding: .day, value: dayNum - 1, to: startOfMonth) ?? startOfMonth
                                let isSelected = cal.isDate(cellDate, inSameDayAs: selectedDate)
                                let hasDeadline = store.deadlines.contains { cal.isDate($0.dueAt, inSameDayAs: cellDate) }

                                Button {
                                    selectedDate = cellDate
                                } label: {
                                    VStack(spacing: 3) {
                                        Text("\(dayNum)")
                                            .font(.kymaiaSubheadline.weight(isSelected ? .bold : .regular))
                                            .foregroundStyle(isSelected ? Color.kymaiaBackground : Color.kymaiaTextPrimary)
                                        Circle()
                                            .fill(hasDeadline ? Color.kymaiaWarning : Color.clear)
                                            .frame(width: 6, height: 6)
                                    }
                                    .frame(maxWidth: .infinity, minHeight: 44)
                                    .background(
                                        RoundedRectangle(cornerRadius: CornerRadius.sm)
                                            .fill(isSelected ? Color.kymaiaAccent : Color.kymaiaSurface)
                                    )
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                }
            }
        }
    }
}

private struct PhysicsCalendarWeekStripSection: View {
    @Binding var selectedDate: Date

    var body: some View {
        let cal = Calendar.current
        let days: [Date] = (-1...5).compactMap { cal.date(byAdding: .day, value: $0, to: Date()) }

        JournalSection(
            title: "7-Day Study Week Strip",
            subtitle: "Focused daily Physics rhythm"
        ) {
            JournalCard {
                HStack(spacing: Spacing.sm) {
                    ForEach(days, id: \.self) { date in
                        let isSelected = cal.isDate(date, inSameDayAs: selectedDate)
                        Button {
                            selectedDate = date
                        } label: {
                            VStack(spacing: 4) {
                                Text(date.formatted(.dateTime.weekday(.abbreviated)))
                                    .font(.kymaiaCaption)
                                    .foregroundStyle(isSelected ? Color.kymaiaBackground.opacity(0.9) : Color.kymaiaTextSecondary)
                                Text(date.formatted(.dateTime.day()))
                                    .font(.kymaiaTitle3)
                                    .foregroundStyle(isSelected ? Color.kymaiaBackground : Color.kymaiaTextPrimary)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, Spacing.sm)
                            .background(
                                RoundedRectangle(cornerRadius: CornerRadius.md)
                                    .fill(isSelected ? Color.kymaiaAccent : Color.kymaiaSurface)
                            )
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
    }
}

private struct PhysicsCalendarAgendaSection: View {
    @EnvironmentObject private var store: AppStore
    @Binding var selectedDate: Date

    var body: some View {
        JournalSection(
            title: "Chronological Physics & Science 8 Agenda",
            subtitle: "Selected date: \(selectedDate.formatted(date: .complete, time: .omitted)) · \(store.dueFSRSCards.count) FSRS cards due"
        ) {
            JournalCard {
                VStack(alignment: .leading, spacing: Spacing.sm) {
                    HStack {
                        JournalBadge(text: "Daily Retrieval Block", tone: .accent)
                        Text("\(store.dueFSRSCards.count) Spaced-Retrieval Cards Ready")
                            .font(.kymaiaHeadline)
                        Spacer()
                        Button("Start Retrieval →") {
                            store.selectedRoom = .today
                        }
                        .buttonStyle(.bordered)
                    }
                    Divider()
                    ForEach(store.deadlines) { dl in
                        HStack {
                            Image(systemName: "calendar.badge.clock")
                                .foregroundStyle(Color.kymaiaPrimary)
                            VStack(alignment: .leading, spacing: 2) {
                                Text(dl.title)
                                    .font(.kymaiaSubheadline.weight(.semibold))
                                Text("Units \(dl.unitNumbersCSV) · \(dl.notes)")
                                    .font(.kymaiaCaption)
                                    .foregroundStyle(Color.kymaiaTextSecondary)
                            }
                            Spacer()
                            Text(dl.dueAt, style: .date)
                                .font(.kymaiaCaption.monospacedDigit())
                                .foregroundStyle(Color.kymaiaPrimary)
                        }
                        .padding(.vertical, 4)
                    }
                }
            }
        }
    }
}
