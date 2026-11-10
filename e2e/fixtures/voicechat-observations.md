# Simple Voice Chat observations

Recorded by `mythic-isles/bridge/paper/test/live.mjs` from Simple Voice Chat
**2.6.25** (Modrinth `5OqsnSs7`) on Purpur **1.21.1 build 2329**, Java 21,
Windows. Native run: `D:/Temp/isles-paper-live-Zk0CxO`.

The JSON retains the three provider booleans returned through the production
Bridge and Isles owner API. The protocol-only test client completed compatibility
20 negotiation over Minecraft plugin messages, authenticated AES-128-GCM UDP,
received connection validation, toggled sound disabled/enabled, stopped replying
to keepalives, then left and rejoined without voice. No provider API setters or
fake Bukkit implementation were used. Game login was offline on loopback.

The browser replays these observations at the external Bridge HTTP boundary while
running the real Web/BFF/Isles composition. It does not capture microphones,
encode/decode Opus, play sound, or verify public UDP/proxy routing. Other voice
addons can override the official API's connection state. The first no-client
state has `disabled=false`; absence of a compatible client must not be inferred
from that flag.

Publisher SHA-512:
`2d756e38825428e5bcb00b4dd87773bff6d07ffb4c54d33b9f34de46bf517cc1951ffa0ef3732611753f9b1f9e17add3bec1cec5c113a4e903a0fbd10be2fcd6`
