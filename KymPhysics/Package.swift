// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "KymPhysics",
    platforms: [
        .macOS(.v14),
        .iOS(.v17)
    ],
    products: [
        .executable(name: "KymPhysics", targets: ["KymPhysics"])
    ],
    dependencies: [
        .package(url: "https://github.com/groue/GRDB.swift.git", from: "6.24.0")
    ],
    targets: [
        .executableTarget(
            name: "KymPhysics",
            dependencies: [
                .product(name: "GRDB", package: "GRDB.swift")
            ],
            path: "KymPhysics",
            exclude: [
                "Info-iPad.plist",
                "KymPhysics.entitlements",
                "KymPhysics-iPad.entitlements"
            ],
            resources: [
                .copy("Resources/ContentPacks"),
                .copy("Resources/MovingWorldBook"),
                .copy("Resources/SoulDocuments")
            ]
        ),
        .testTarget(
            name: "KymPhysicsTests",
            dependencies: [
                "KymPhysics",
                .product(name: "GRDB", package: "GRDB.swift")
            ],
            path: "Tests"
        )
    ]
)
