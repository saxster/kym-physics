import SwiftUI

extension View {
    /// Applies `.inline` navigation title display mode on iOS; a no-op on macOS,
    /// where that modifier does not exist. Collapses the per-call-site
    /// `#if os(iOS) … #endif` dance into one adaptive modifier.
    @ViewBuilder
    func inlineNavigationTitleDisplayMode() -> some View {
        #if os(iOS)
        self.navigationBarTitleDisplayMode(.inline)
        #else
        self
        #endif
    }
}
