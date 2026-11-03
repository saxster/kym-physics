import os
import SwiftUI

@main
struct KymPhysicsApp: App {
    @StateObject private var store = AppStore.shared
    @AppStorage(CuratedColorScheme.storageKey) private var selectedSchemeRaw: String = CuratedColorScheme.defaultScheme.rawValue

    init() {
        CuratedColorScheme.registerAsKymaiaTheme()
        TutorConstitution.register(.kymPhysics)
        let policyLogger = Logger(subsystem: "com.kymaia.physics", category: "TutorPolicy")
        TutorPolicyLog.setHandler { level, message in
            switch level {
            case .error: policyLogger.error("\(message, privacy: .public)")
            case .warning: policyLogger.warning("\(message, privacy: .public)")
            }
        }
    }

    private var activeScheme: CuratedColorScheme {
        CuratedColorScheme(rawValue: selectedSchemeRaw) ?? .defaultScheme
    }

    var body: some Scene {
        WindowGroup {
            KymPhysicsRootShellView()
                .environmentObject(store)
                .environment(\.curatedColorScheme, activeScheme)
                .onOpenURL { url in
                    store.openDeepLink(url)
                }
        }
        .commands {
            CommandMenu("Rooms") {
                ForEach(Array(AppRoom.allCases.enumerated()), id: \.element.id) { idx, room in
                    Button(room.title) {
                        store.selectedRoom = room
                    }
                    .keyboardShortcut(KeyEquivalent(Character("\(idx + 1)")), modifiers: [.command])
                }
            }
        }
    }
}

struct KymPhysicsRootShellView: View {
    @EnvironmentObject private var store: AppStore
    @State private var showOmnisearch: Bool = false

    private var roomSelectionBinding: Binding<AppRoom?> {
        Binding(
            get: { store.selectedRoom },
            set: { if let room = $0 { store.selectedRoom = room } }
        )
    }

    var body: some View {
        NavigationSplitView {
            List(selection: roomSelectionBinding) {
                Section {
                    Button {
                        showOmnisearch = true
                    } label: {
                        HStack(spacing: Spacing.sm) {
                            Image(systemName: "magnifyingglass")
                                .foregroundStyle(Color.kymaiaPrimary)
                            Text("Omnisearch Physics…")
                                .font(.kymaiaCallout.weight(.medium))
                                .foregroundStyle(Color.kymaiaInk)
                            Spacer()
                            Text("⌘K")
                                .font(.kymaiaMonoCaption)
                                .foregroundStyle(Color.kymaiaMutedInk)
                        }
                        .padding(.vertical, 4)
                    }
                    .buttonStyle(.plain)
                    .keyboardShortcut("k", modifiers: [.command])
                }

                Section("KymPhysics · Grade 8") {
                    ForEach(AppRoom.allCases) { room in
                        NavigationLink(value: room) {
                            Label {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(room.title)
                                        .font(.kymaiaCallout.weight(.semibold))
                                        .foregroundStyle(Color.kymaiaInk)
                                    Text(room.subtitle)
                                        .font(.kymaiaCaption)
                                        .foregroundStyle(Color.kymaiaMutedInk)
                                        .lineLimit(1)
                                }
                            } icon: {
                                Image(systemName: room.symbol)
                                    .foregroundStyle(Color.kymaiaPrimary)
                            }
                        }
                    }
                }

                Section("Quick School Units") {
                    ForEach(store.pack.schoolTextbook.units(for: .physicsCore)) { unit in
                        Button {
                            store.selectedUnitNumber = unit.unitNumber
                            store.selectedTopicCode = unit.topics.first?.code
                            store.selectedRoom = .schoolScience
                        } label: {
                            HStack {
                                Text("Unit \(unit.unitNumber): \(unit.title)")
                                    .font(.kymaiaCaption.weight(.medium))
                                Spacer()
                                Text(unit.isCompletedInSchool ? "✓" : "Next")
                                    .font(.kymaiaCaption.weight(.bold))
                                    .foregroundStyle(unit.isCompletedInSchool ? Color.kymaiaSuccess : Color.kymaiaPrimary)
                            }
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
            .navigationTitle("KymPhysics")
        } detail: {
            VStack(spacing: 0) {
                if let safety = store.latestSafetyEscalation, let response = safety.supportiveResponse {
                    JournalCard {
                        VStack(alignment: .leading, spacing: Spacing.xs) {
                            HStack {
                                Image(systemName: "heart.text.square.fill")
                                    .foregroundStyle(Color.kymaiaError)
                                JournalBadge(text: "Safety & Wellbeing Support · Lesson Paused", tone: .warning)
                                Spacer()
                                Button("Dismiss") {
                                    store.latestSafetyEscalation = nil
                                }
                                .font(.kymaiaCaption)
                                .buttonStyle(.bordered)
                            }
                            Text(response)
                                .font(.kymaiaReadingBody)
                                .foregroundStyle(Color.kymaiaInk)
                        }
                    }
                    .padding(.horizontal, Spacing.lg)
                    .padding(.top, Spacing.sm)
                }

                switch store.selectedRoom {
                case .today:
                    TodayHomeView()
                case .schoolScience:
                    SchoolScienceHomeView()
                case .movingWorld:
                    MovingWorldHomeView()
                case .labsExplorers:
                    LabsExplorersHomeView()
                case .practiceExams:
                    PracticeExamsHomeView()
                case .labJournal:
                    LabJournalHomeView()
                case .coach:
                    PhysicsCoachHomeView()
                case .calendar:
                    CalendarHomeView()
                case .parentMentor:
                    ParentMentorDashboardView()
                }
            }
        }
        .sheet(isPresented: $showOmnisearch) {
            PhysicsOmnisearchSheet()
                .environmentObject(store)
        }
    }
}
