import SwiftUI

// MARK: - Interactive Uno R3 & Breadboard Tour

struct ArduinoBoardTourView: View {
    @State private var selectedLandmarkID: String = ArduinoMissionCatalog.boardLandmarks.first?.id ?? "usb"

    private let landmarks = ArduinoMissionCatalog.boardLandmarks

    private var activeLandmark: ArduinoBoardLandmark {
        landmarks.first(where: { $0.id == selectedLandmarkID }) ?? landmarks[0]
    }

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.medium) {
            HStack(alignment: .firstTextBaseline, spacing: Theme.Spacing.small) {
                Label("Interactive board & breadboard tour", systemImage: "cpu")
                    .font(.kymaiaCaption.weight(.semibold))
                    .foregroundStyle(Theme.Colors.accent)
                Spacer(minLength: Theme.Spacing.small)
                Text("7 landmarks")
                    .font(.kymaiaMonoCaption)
                    .foregroundStyle(Theme.Colors.secondaryText)
            }

            boardDiagramCanvas

            Text("Tap any numbered marker on the board diagram or choose a landmark pill below to trace its role.")
                .font(.kymaiaCaption)
                .foregroundStyle(Theme.Colors.secondaryText)

            landmarkSelectorStrip

            landmarkInspectorCard(activeLandmark)
        }
        .accessibilityElement(children: .contain)
        .accessibilityIdentifier("arduino.gallery.boardTour")
    }

    // MARK: - Canvas Diagram with Direct Hotspot Targets & Leader Lines

    private var boardDiagramCanvas: some View {
        ZStack(alignment: .topLeading) {
            Canvas { context, size in
                drawUnoPCB(context: &context, size: size)
                drawBreadboard(context: &context, size: size)
                drawLeaderLine(context: &context, size: size, active: activeLandmark)
                drawHotspots(context: &context, size: size, activeID: activeLandmark.id)
            }

            GeometryReader { geo in
                ForEach(Array(landmarks.enumerated()), id: \.element.id) { index, landmark in
                    let isSelected = landmark.id == activeLandmark.id
                    Button {
                        withKymaiaAnimation(.kymaiaSpring) {
                            selectedLandmarkID = landmark.id
                        }
                    } label: {
                        Color.clear
                            .frame(
                                width: Theme.Dimension.minimumTarget,
                                height: Theme.Dimension.minimumTarget
                            )
                            .contentShape(Circle())
                    }
                    .buttonStyle(.plain)
                    .kymaiaPointerHighlight(Circle())
                    .help("\(index + 1). \(landmark.shortLabel): \(landmark.subtitle)")
                    .position(
                        x: geo.size.width * landmark.anchorX,
                        y: geo.size.height * landmark.anchorY
                    )
                    .accessibilityLabel("Board landmark \(index + 1): \(landmark.title)")
                    .accessibilityHint(landmark.subtitle)
                    .accessibilityAddTraits(isSelected ? .isSelected : [])
                    .accessibilityIdentifier("arduino.boardTour.canvasSpot.\(landmark.id)")
                }
            }
        }
        .frame(height: 196)
        .frame(maxWidth: .infinity)
        .journalIllustrationSurface()
        .journalIllustrationClip()
    }

    private func drawUnoPCB(context: inout GraphicsContext, size: CGSize) {
        let pcbRect = CGRect(
            x: size.width * 0.04,
            y: size.height * 0.12,
            width: size.width * 0.56,
            height: size.height * 0.76
        )
        let pcbPath = Path(roundedRect: pcbRect, cornerRadius: Theme.Radius.small)
        context.fill(pcbPath, with: .color(Theme.Colors.accent.opacity(0.12)))
        context.stroke(pcbPath, with: .color(Theme.Colors.accent.opacity(0.45)), lineWidth: 1.5)

        let usbRect = CGRect(
            x: pcbRect.minX - 6,
            y: pcbRect.minY + pcbRect.height * 0.18,
            width: pcbRect.width * 0.18,
            height: pcbRect.height * 0.28
        )
        let usbPath = Path(roundedRect: usbRect, cornerRadius: Theme.Radius.xs)
        context.fill(usbPath, with: .color(Theme.Colors.secondaryText.opacity(0.22)))
        context.stroke(usbPath, with: .color(Theme.Colors.secondaryText.opacity(0.55)), lineWidth: 1)

        let topHeader = CGRect(
            x: pcbRect.minX + pcbRect.width * 0.22,
            y: pcbRect.minY + 6,
            width: pcbRect.width * 0.70,
            height: 10
        )
        context.fill(Path(roundedRect: topHeader, cornerRadius: Theme.Radius.xs), with: .color(Theme.Colors.primaryText.opacity(0.75)))

        let bottomPowerHeader = CGRect(
            x: pcbRect.minX + pcbRect.width * 0.18,
            y: pcbRect.maxY - 16,
            width: pcbRect.width * 0.30,
            height: 10
        )
        context.fill(Path(roundedRect: bottomPowerHeader, cornerRadius: Theme.Radius.xs), with: .color(Theme.Colors.error.opacity(0.65)))

        let bottomAnalogHeader = CGRect(
            x: pcbRect.minX + pcbRect.width * 0.54,
            y: pcbRect.maxY - 16,
            width: pcbRect.width * 0.36,
            height: 10
        )
        context.fill(Path(roundedRect: bottomAnalogHeader, cornerRadius: Theme.Radius.xs), with: .color(Theme.Colors.success.opacity(0.65)))

        let mcuRect = CGRect(
            x: pcbRect.minX + pcbRect.width * 0.36,
            y: pcbRect.minY + pcbRect.height * 0.44,
            width: pcbRect.width * 0.46,
            height: pcbRect.height * 0.22
        )
        context.fill(Path(roundedRect: mcuRect, cornerRadius: Theme.Radius.xs), with: .color(Theme.Colors.primaryText.opacity(0.82)))

        context.draw(
            Text("UNO R3").font(.kymaiaMonoCaption).foregroundColor(Theme.Colors.accent),
            at: CGPoint(x: pcbRect.minX + pcbRect.width * 0.26, y: pcbRect.minY + pcbRect.height * 0.30)
        )
    }

    private func drawBreadboard(context: inout GraphicsContext, size: CGSize) {
        let bbRect = CGRect(
            x: size.width * 0.65,
            y: size.height * 0.12,
            width: size.width * 0.31,
            height: size.height * 0.76
        )
        let bbPath = Path(roundedRect: bbRect, cornerRadius: Theme.Radius.small)
        context.fill(bbPath, with: .color(Theme.Colors.secondaryBackground))
        context.stroke(bbPath, with: .color(Theme.Colors.border), lineWidth: 1.5)

        let gapRect = CGRect(
            x: bbRect.midX - 4,
            y: bbRect.minY + 10,
            width: 8,
            height: bbRect.height - 20
        )
        context.fill(Path(roundedRect: gapRect, cornerRadius: Theme.Radius.xs), with: .color(Theme.Colors.border.opacity(0.6)))

        var plusLine = Path()
        plusLine.move(to: CGPoint(x: bbRect.minX + 8, y: bbRect.minY + 12))
        plusLine.addLine(to: CGPoint(x: bbRect.minX + 8, y: bbRect.maxY - 12))
        context.stroke(plusLine, with: .color(Theme.Colors.error.opacity(0.75)), lineWidth: 2)

        var minusLine = Path()
        minusLine.move(to: CGPoint(x: bbRect.maxX - 8, y: bbRect.minY + 12))
        minusLine.addLine(to: CGPoint(x: bbRect.maxX - 8, y: bbRect.maxY - 12))
        context.stroke(minusLine, with: .color(Theme.Colors.accent.opacity(0.75)), lineWidth: 2)

        let rowY = bbRect.minY + bbRect.height * 0.50
        let clipRect = CGRect(x: bbRect.minX + 16, y: rowY - 5, width: bbRect.width * 0.30, height: 10)
        context.fill(Path(roundedRect: clipRect, cornerRadius: Theme.Radius.xs), with: .color(Theme.Colors.warning.opacity(0.35)))
        context.stroke(Path(roundedRect: clipRect, cornerRadius: Theme.Radius.xs), with: .color(Theme.Colors.warning), lineWidth: 1.2)

        context.draw(
            Text("BREADBOARD").font(.kymaiaMonoCaption).foregroundColor(Theme.Colors.secondaryText),
            at: CGPoint(x: bbRect.midX, y: bbRect.minY + 18)
        )
    }

    private func drawLeaderLine(context: inout GraphicsContext, size: CGSize, active: ArduinoBoardLandmark) {
        let target = CGPoint(x: size.width * active.anchorX, y: size.height * active.anchorY)
        let badgeOrigin = CGPoint(x: size.width * 0.50, y: size.height - 14)
        let elbow = CGPoint(x: target.x, y: size.height - 14)

        var leader = Path()
        leader.move(to: target)
        leader.addLine(to: elbow)
        leader.addLine(to: badgeOrigin)

        context.stroke(
            leader,
            with: .color(Theme.Colors.accent),
            style: StrokeStyle(lineWidth: 1.5, dash: [4, 3])
        )
    }

    private func drawHotspots(context: inout GraphicsContext, size: CGSize, activeID: String) {
        for (idx, landmark) in landmarks.enumerated() {
            let center = CGPoint(x: size.width * landmark.anchorX, y: size.height * landmark.anchorY)
            let isSelected = landmark.id == activeID
            let radius: CGFloat = isSelected ? 11 : 8.5

            if isSelected {
                let halo = CGRect(x: center.x - 16, y: center.y - 16, width: 32, height: 32)
                context.fill(Path(ellipseIn: halo), with: .color(Theme.Colors.accent.opacity(0.22)))
            }

            let dotRect = CGRect(x: center.x - radius, y: center.y - radius, width: radius * 2, height: radius * 2)
            context.fill(
                Path(ellipseIn: dotRect),
                with: .color(isSelected ? Theme.Colors.accent : Theme.Colors.secondaryBackground)
            )
            context.stroke(
                Path(ellipseIn: dotRect),
                with: .color(Theme.Colors.accent),
                lineWidth: isSelected ? 2 : 1.4
            )

            context.draw(
                Text("\(idx + 1)")
                    .font(.kymaiaMonoCaption.weight(.bold))
                    .foregroundColor(isSelected ? .white : Theme.Colors.accent),
                at: center
            )
        }
    }

    // MARK: - Landmark Selector Pills

    private var landmarkSelectorStrip: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: Theme.Spacing.small) {
                ForEach(Array(landmarks.enumerated()), id: \.element.id) { index, landmark in
                    let isSelected = landmark.id == selectedLandmarkID
                    Button {
                        withKymaiaAnimation(.kymaiaSpring) {
                            selectedLandmarkID = landmark.id
                        }
                    } label: {
                        HStack(spacing: Theme.Spacing.xs) {
                            Text("\(index + 1)")
                                .font(.kymaiaMonoCaption.weight(.bold))
                                .padding(.horizontal, Theme.Spacing.xs)
                                .padding(.vertical, 2)
                                .background(
                                    isSelected
                                        ? Color.white.opacity(0.22)
                                        : Theme.Colors.accent.opacity(0.14),
                                    in: Capsule()
                                )
                            Image(systemName: landmark.symbol)
                                .font(.kymaiaCaption)
                            Text(landmark.shortLabel)
                                .font(.kymaiaCaption.weight(.semibold))
                        }
                        .padding(.horizontal, Theme.Spacing.medium)
                        .padding(.vertical, Theme.Spacing.small)
                        .frame(minHeight: Theme.Dimension.minimumTarget)
                        .foregroundStyle(isSelected ? Color.white : Theme.Colors.primaryText)
                        .background(
                            isSelected ? Theme.Colors.accent : Theme.Colors.secondaryBackground,
                            in: Capsule()
                        )
                        .overlay(
                            Capsule().strokeBorder(
                                isSelected ? Theme.Colors.accent : Theme.Colors.border,
                                lineWidth: Theme.Stroke.hairline
                            )
                        )
                        .contentShape(Capsule())
                    }
                    .buttonStyle(.plain)
                    .kymaiaPointerHighlight(Capsule())
                    .help("\(landmark.title) — \(landmark.subtitle)")
                    .accessibilityAddTraits(isSelected ? .isSelected : [])
                    .accessibilityIdentifier("arduino.boardTour.spot.\(landmark.id)")
                }
            }
        }
    }

    // MARK: - Selected Landmark Inspector

    private func landmarkInspectorCard(_ landmark: ArduinoBoardLandmark) -> some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.small) {
            HStack(alignment: .firstTextBaseline, spacing: Theme.Spacing.small) {
                Image(systemName: landmark.symbol)
                    .font(.kymaiaBody.weight(.semibold))
                    .foregroundStyle(Theme.Colors.accent)
                VStack(alignment: .leading, spacing: Theme.Spacing.xxs) {
                    Text(landmark.title)
                        .font(.kymaiaSubheadline)
                        .foregroundStyle(Theme.Colors.primaryText)
                    Text(landmark.subtitle)
                        .font(.kymaiaMonoCaption)
                        .foregroundStyle(Theme.Colors.accent)
                }
                Spacer(minLength: 0)
            }

            Text(landmark.detail)
                .font(.kymaiaBody)
                .foregroundStyle(Theme.Colors.primaryText)
                .fixedSize(horizontal: false, vertical: true)

            ArduinoSpecsGrid(specs: landmark.specs)
        }
        .padding(Theme.Spacing.medium)
        .frame(maxWidth: .infinity, alignment: .leading)
        .journalIllustrationSurface()
        .journalIllustrationClip()
        .accessibilityElement(children: .contain)
        .accessibilityIdentifier("arduino.boardTour.inspector.\(landmark.id)")
    }
}
