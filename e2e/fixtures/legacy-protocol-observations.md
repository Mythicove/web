# Older Java client protocol acceptance

Recorded from the real Bridge/Isles endpoints in
`D:/Temp/isles-paper-live-2H77qQ`: Purpur 1.21.1/2329, Java 21, Windows,
ViaVersion 5.12.2, ViaBackwards 5.12.2 (Modrinth `1xHfYAKG`), ViaRewind 4.2.0
(`EPLCoxMK`). The JSON preserves both provider protocol lists and the online
player observations; generated binding timestamps were removed.

Mineflayer clients 1.12.2 and 1.8.8 spawned, sent the real `/mythic link` command,
and were observed as `1.12.2` and `1.8.x` respectively. Membership identity matched
the UUID in each protocol login response. The server then restarted with the
upstream ViaVersion `block-protocols: [47]` configuration. The next provider list
excluded `1.8.x`, retained 1.12.2, and a new 1.8.8 connection received the explicit
blocked-protocol disconnect message.

ViaVersion + ViaBackwards without ViaRewind was separately exercised in
`D:/Temp/isles-paper-live-FKESr4` with the real 1.12.2 client. ViaVersion-only
`D:/Temp/isles-paper-live-YpI3jY` did not advertise 1.12 and rejected a 1.12.2
connection (transport reset before spawn). No old-client branch is injected
into production code; the source of version support remains ViaVersion's public
API. Plugin binaries stay outside Git and acquisition verifies publisher SHA-512.

The browser replays these records at the external Bridge HTTP boundary while
running production Web/BFF/Isles, including server-specific one-time binding,
private player version, administrator-only range/provider metadata, offline
clearing and configured-block updates. The list also contains 1.7 and other
provider-advertised versions that were not connected in this scenario. Actual
acceptance is limited to 1.12.2/1.8.8 login, spawn and binding on an offline-mode
loopback server, not full gameplay, historical height/item fidelity, online
authentication, proxy routing or Compass preflight compatibility.
