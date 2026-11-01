import SwiftUI

struct AdaptiveOptionPicker<Option: Hashable>: View {
    let title: String
    @Binding var selection: Option
    let options: [Option]
    let titleForOption: (Option) -> String
    let systemImageForOption: ((Option) -> String?)?

    @Environment(\.dynamicTypeSize) private var dynamicTypeSize
    @Environment(\.horizontalSizeClass) private var horizontalSizeClass

    init(
        _ title: String,
        selection: Binding<Option>,
        options: [Option],
        titleForOption: @escaping (Option) -> String,
        systemImageForOption: ((Option) -> String?)? = nil
    ) {
        self.title = title
        self._selection = selection
        self.options = options
        self.titleForOption = titleForOption
        self.systemImageForOption = systemImageForOption
    }

    var body: some View {
        Group {
            if usesMenuPresentation {
                Menu {
                    ForEach(options, id: \.self) { option in
                        Button {
                            selection = option
                        } label: {
                            optionLabel(for: option)
                        }
                    }
                } label: {
                    selectedLabel
                }
                .buttonStyle(.bordered)
            } else {
                Picker(title, selection: $selection) {
                    ForEach(options, id: \.self) { option in
                        Text(titleForOption(option)).tag(option)
                    }
                }
                .pickerStyle(.segmented)
            }
        }
        .accessibilityLabel(title)
        .accessibilityValue(titleForOption(selection))
        .frame(minHeight: 44)
        .contentShape(Rectangle())
    }

    private var usesMenuPresentation: Bool {
        horizontalSizeClass == .compact || dynamicTypeSize.isAccessibilitySize || options.count > 4
    }

    @ViewBuilder
    private var selectedLabel: some View {
        if let image = systemImageForOption?(selection) {
            Label(titleForOption(selection), systemImage: image)
        } else {
            Label(titleForOption(selection), systemImage: "line.3.horizontal.decrease.circle")
        }
    }

    @ViewBuilder
    private func optionLabel(for option: Option) -> some View {
        if let image = systemImageForOption?(option) {
            Label(titleForOption(option), systemImage: image)
        } else {
            Text(titleForOption(option))
        }
    }
}
