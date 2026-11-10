# Crossplay provider recording

`crossplay-observations.json` contains unchanged version/player rows from
`mythic-isles/bridge/paper/test/live.mjs`, recorded 2026-11-11: Geyser 2.8.3 b941,
Floodgate 2.2.5 b141, ViaVersion 5.12.2, Purpur 1.21.1/2329, Java 21 and
bedrock-protocol 3.49.0 using Bedrock 1.21.100.

The native scenario uses a loopback-only server with unsigned Bedrock proxy
connections enabled. Its offline fixture has XUID zero, hence the all-zero Bukkit
UUID. This is real Geyser/Floodgate protocol handling, not an Xbox authentication
or provider-side linked-Java-account acceptance test. The production integration
does not change Geyser authentication settings or collect XUID/session tokens.

The client received `start_game`, sent its initialization and the actual `/mythic
link` command, and the scenario checked both private observations and the native
whitelist file's Bukkit UUID. Java connections were not labeled Bedrock. UDP
RakNet reachability was separately probed by the real Isles service.

The browser scenario replays only this external game-provider boundary while
keeping the production BFF, ownership checks and Isles processes. Run the native
scenario with `ISLES_TEST_PLUGIN_FILTER=Geyser-Spigot.jar,floodgate-spigot.jar,ViaVersion.jar`
to refresh these rows from its `crossplay-observations.json` artifact.
