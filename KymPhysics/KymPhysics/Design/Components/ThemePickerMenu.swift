import SwiftUI

/// Quick theme switcher menu & settings card. Defaults to `.journal` (Apple Journal lavender & white)
/// with 1-tap switching to `.botanical` (The Living World), `.monsoon` (Marine Drive), and 5 other
/// WCAG-audited themes.
struct ThemePickerMenu: View {
    @AppStorage(CuratedColorScheme.storageKey) private var selectedSchemeRaw = CuratedColorScheme.defaultScheme.rawValue
    var onThemeChanged: ((CuratedColorScheme) -> Void)?

    private var activeScheme: CuratedColorScheme {
        CuratedColorScheme(rawValue: selectedSchemeRaw) ?? .defaultScheme
    }

    var body: some View {
        Menu {
            Section("Palette") {
                ForEach(CuratedColorScheme.allCases) { scheme in
                    Button {
                        selectedSchemeRaw = scheme.rawValue
                        onThemeChanged?(scheme)
                    } label: {
                        HStack {
                            Text("\(scheme.displayName) — \(scheme.summary)")
                            if scheme == activeScheme {
                                Image(systemName: "checkmark")
                            }
                        }
                    }
                }
            }
        } label: {
            Label(activeScheme.displayName, systemImage: "paintpalette")
                .font(.kymaiaCaption.weight(.semibold))
                .padding(.horizontal, Spacing.sm + 2)
                .padding(.vertical, Spacing.xs + 2)
                .frame(minHeight: Theme.Dimension.minimumTarget)
                .contentShape(Rectangle())
        }
        .accessibilityLabel("Colour theme")
        .accessibilityValue(activeScheme.displayName)
        .accessibilityHint("Switch between Apple Journal lavender, Living World botanical and six other study palettes")
        .accessibilityIdentifier("toolbar.theme-picker")
    }
}

struct ThemeGallerySection: View {
    @AppStorage(CuratedColorScheme.storageKey) private var selectedSchemeRaw = CuratedColorScheme.defaultScheme.rawValue
    var onThemeChanged: ((CuratedColorScheme) -> Void)?

    private var activeScheme: CuratedColorScheme {
        CuratedColorScheme(rawValue: selectedSchemeRaw) ?? .defaultScheme
    }

    var body: some View {
        JournalSection(title: "Appearance and paper palette") {
            VStack(spacing: Spacing.sm) {
                ForEach(CuratedColorScheme.allCases) { scheme in
                    Button {
                        withKymaiaAnimation(.kymaiaQuick) {
                            selectedSchemeRaw = scheme.rawValue
                            onThemeChanged?(scheme)
                        }
                    } label: {
                        HStack(spacing: Spacing.md) {
                            HStack(spacing: 4) {
                                Circle()
                                    .fill(scheme.palette.background.light.color)
                                    .frame(width: 20, height: 20)
                                    .overlay(Circle().strokeBorder(Color.kymaiaHairline, lineWidth: 1))
                                Circle()
                                    .fill(scheme.palette.primary.light.color)
                                    .frame(width: 20, height: 20)
                                Circle()
                                    .fill(scheme.palette.secondary.light.color)
                                    .frame(width: 20, height: 20)
                            }
                            .accessibilityHidden(true)

                            VStack(alignment: .leading, spacing: 2) {
                                HStack(spacing: Spacing.xs) {
                                    Text(scheme.displayName)
                                        .font(.kymaiaBody.weight(.semibold))
                                        .foregroundStyle(Color.kymaiaInk)
                                    if scheme == .journal {
                                        JournalChip(text: "Default", tone: .accent)
                                    } else if scheme == .botanical {
                                        JournalChip(text: "Living World", tone: .good)
                                    }
                                }
                                Text(scheme.summary)
                                    .font(.kymaiaCaption)
                                    .foregroundStyle(Color.kymaiaMutedInk)
                            }
                            Spacer()
                            Image(systemName: scheme == activeScheme ? "checkmark.circle.fill" : "circle")
                                .font(.kymaiaTitle3)
                                .foregroundStyle(scheme == activeScheme ? Color.kymaiaPrimary : Color.kymaiaTertiaryInk)
                                .accessibilityHidden(true)
                        }
                        .padding(Spacing.md)
                        .background(
                            RoundedRectangle(cornerRadius: CornerRadius.medium, style: .continuous)
                                .fill(scheme == activeScheme ? Color.kymaiaSelectionFill : Color.kymaiaSurface)
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: CornerRadius.medium, style: .continuous)
                                .strokeBorder(scheme == activeScheme ? Color.kymaiaPrimary : Color.kymaiaHairline, lineWidth: scheme == activeScheme ? 2 : 1)
                        )
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel("\(scheme.displayName), \(scheme.summary)")
                    .accessibilityValue(scheme == activeScheme ? "Selected" : "Not selected")
                    .accessibilityIdentifier("settings.theme.\(scheme.rawValue)")
                }
            }
        }
    }
}
