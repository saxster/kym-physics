import SwiftUI

/// What a list or page shows before it has anything: the system's `ContentUnavailableView`
/// with the kit's type, ink and capsule buttons. Say what will appear here and how to get it.
struct JournalEmptyState<Actions: View>: View {
    let title: String
    let systemImage: String
    var message: String?
    @ViewBuilder let actions: Actions

    var body: some View {
        ContentUnavailableView {
            Label {
                Text(title)
                    .font(.kymaiaSectionTitle.weight(.bold))
                    .foregroundStyle(Color.kymaiaInk)
            } icon: {
                Image(systemName: systemImage)
                    .foregroundStyle(Color.kymaiaPrimary)
            }
        } description: {
            if let message {
                Text(message)
                    .font(.kymaiaBody)
                    .foregroundStyle(Color.kymaiaMutedInk)
            }
        } actions: {
            actions
                .buttonStyle(JournalCapsuleButtonStyle())
        }
    }
}

extension JournalEmptyState where Actions == EmptyView {
    init(title: String, systemImage: String, message: String? = nil) {
        self.init(title: title, systemImage: systemImage, message: message) {
            EmptyView()
        }
    }
}
