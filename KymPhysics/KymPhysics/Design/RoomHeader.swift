import SwiftUI

/// A page's title block in The Standard: the editorial header (an uppercase tracked eyebrow, a
/// serif display title and a muted subtitle) when the page names an eyebrow, otherwise the muted
/// subtitle alone; then the page's own controls in one scrolling row.
struct RoomHeader<Accessory: View>: View {
    let eyebrow: String?
    let title: String
    let subtitle: String?
    let accessory: Accessory

    init(eyebrow: String?, title: String, subtitle: String?, @ViewBuilder accessory: () -> Accessory) {
        self.eyebrow = eyebrow
        self.title = title
        self.subtitle = subtitle
        self.accessory = accessory()
    }

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            if let eyebrow {
                EditorialHeader(eyebrow: eyebrow, title: title, subtitle: subtitle ?? "")
            } else if let subtitle {
                Text(subtitle)
                    .font(.kymaiaSubheadline)
                    .foregroundStyle(Color.kymaiaMutedInk)
                    .fixedSize(horizontal: false, vertical: true)
            }
            if Accessory.self != EmptyView.self {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: Spacing.sm) {
                        accessory
                    }
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

/// A page body under a `RoomHeader`, for the kit's page shells that take one content view.
struct RoomPageContent<Accessory: View, Inner: View>: View {
    let header: RoomHeader<Accessory>
    let content: Inner

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            header
            content
        }
    }
}
