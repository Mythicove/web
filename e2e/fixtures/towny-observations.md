# Towny provider recording

Rows in `towny-observations.json` were recorded unchanged by
`mythic-isles/bridge/paper/test/live.mjs` on 2026-11-10, using Towny 0.103.2.0
(Modrinth version `pra46LOM`), flatfile storage, Purpur 1.21.1/2329 and Java 21.
The server/world/players and government UUIDs are temporary scenario data.

The native scenario creates a town and nation with a real Mineflayer player,
observes mayor and king roles, adds an unlinked guest, transfers leadership, grants
assistant rank, restarts and checks offline membership, then kicks the verified
resident and checks that their old membership disappears. Only the verified UUID
is included in resident rows; town/nation counts include the guest. These rows are
from the first native run (public-spawn was true for the town).

The browser scenario replays the external provider observation at the Bridge HTTP
boundary while keeping Web/BFF/Isles and authorization real. Its separate
`townCount: 101` observation exercises list truncation reporting; it is protocol
coverage, not a claim that the native fixture created 101 towns. Rerun the native
scenario with `ISLES_TEST_PLUGIN_FILTER=Towny.jar` to obtain new observations.
