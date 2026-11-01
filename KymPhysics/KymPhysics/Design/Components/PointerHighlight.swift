import SwiftUI

extension View {
    /// Gives a control the system pointer highlight on iPad, clipped to the
    /// control's own shape.
    ///
    /// The highlight tints the control in place. It never lifts, scales or
    /// moves anything, so the "cards do not move on hover" rule still holds.
    /// macOS keeps its own native hover behaviour, so this does nothing there.
    func kymaiaPointerHighlight<S: Shape>(_ shape: S) -> some View {
        #if os(iOS)
        return self
            .contentShape(.hoverEffect, shape)
            .hoverEffect(.highlight)
        #else
        return self
        #endif
    }
}
