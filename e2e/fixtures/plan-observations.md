# Plan provider recording

`plan-observations.json` is the unchanged aggregate from the real
`mythic-isles/bridge/paper/test/live.mjs` scenario on 2026-11-10: Purpur 1.21.1
build 2329, Java 21, Plan 5.9 build 3705 (Modrinth version `YYpJ8C6q`, SQLite),
Isles Paper Bridge 0.1.0. All UUIDs belong to a temporary test server and players.

The scenario recorded a bound player's session, then an unlinked guest's session.
Both sessions contribute to server totals; only the verified player's activity is
exported. The bound player's offline statistics also survived a game-server
restart. Durations are stored session milliseconds including AFK, not an online
counter or an estimate of unsaved playtime.

The browser scenario replays this external game-provider observation through the
real Bridge HTTP boundary. Web/BFF/Isles, identity authorization and storage remain
production implementations. Refresh the recording with the native scenario using
`ISLES_TEST_PLUGIN_FILTER=Plan.jar`, taking the `aggregate` field from its
`plan-observations.json` artifact.
