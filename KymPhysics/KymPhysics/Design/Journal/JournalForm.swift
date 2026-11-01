import SwiftUI

extension View {
    /// A settings-style form in the Journal style: grouped sections on the page colour instead
    /// of the system's grey, with the accent for toggles and pickers. Give each section's header
    /// `.journalFormHeader()`.
    ///
    ///     Form {
    ///         Section {
    ///             Toggle("Daily reminder", isOn: $reminder)
    ///         } header: {
    ///             Text("Study reminders").journalFormHeader()
    ///         }
    ///     }
    ///     .journalForm()
    func journalForm() -> some View {
        formStyle(.grouped)
            .scrollContentBackground(.hidden)
            .background(KymaiaBackground())
            .tint(Color.kymaiaPrimary)
    }

    /// A form section's header: small, semibold and muted, in sentence case.
    func journalFormHeader() -> some View {
        font(.kymaiaCaption.weight(.semibold))
            .foregroundStyle(Color.kymaiaMutedInk)
            .textCase(nil)
            .accessibilityAddTraits(.isHeader)
    }
}
