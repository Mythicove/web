# Chunky provider recording

`chunky-observations.json` contains the unmodified world rows recorded by
`mythic-isles/bridge/paper/test/live.mjs` on 2026-11-10: Purpur 1.21.1 build 2329,
Java 21, Chunky 1.4.40 (Modrinth version `P3y2MXnd`), Isles Paper Bridge 0.1.0.
Coordinates refer only to a generated temporary test world.

The real scenario generated square/circle selections, paused, restarted the game
server and resumed, cancelled both running and paused tasks, completed 25 chunks,
and restarted again. The last restart exposed Chunky 1.4.40's earlier zero-count
terminal checkpoint, which cannot distinguish completion from cancellation.

The browser test replays these rows at the external Bridge HTTP boundary. It uses
the production Web/BFF/Isles processes and real task claim/acknowledgement routes;
it does not substitute the owned task queue or represent this replay as a live
Minecraft renderer. To refresh the recording, run the real scenario with
`ISLES_TEST_PLUGIN_FILTER=Chunky.jar` and take its `chunky-observations.json`.
