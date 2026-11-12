# CoreProtect boundary recording

`coreprotect-observations.json` preserves the two rows read through the Isles task result after a real Mineflayer player placed and broke stone at `world / 0,101,0` on Purpur 1.21.1.

CoreProtect CE 24.1 was built without source edits from upstream tag v24.1, commit `0af209a0a05135216599113c0b5e2638ad3c704b`, with `-Dproject.branch=development` and Temurin 25.0.5+8; SQLite, server Java 21.0.8. The original successful run is `D:\Temp\isles-paper-live-eQntYu`, with query, page, and empty-coordinate observations in its `coreprotect-observation.json`.

The browser scenario replays this external plugin result into the production Web/BFF/Isles queue. It proves web authorization, request composition and display; the separate native run proves the actual provider query. The plain Maven API JAR disables itself because its release branch is unset and is not a successful runtime fixture.
