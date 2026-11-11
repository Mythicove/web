# spark garbage-collector observations

Recorded from the real Paper-compatible Bridge and Isles admin endpoint by
`mythic-isles/bridge/paper/test/live.mjs`, native run
`D:/Temp/isles-paper-live-B5507V`, Windows, Java 21.0.8 and Purpur 1.21.1/2329.
The provider is the spark service bundled with that pinned server, not a mocked
GC bean. `jcmd <owned-server-pid> GC.run` increased the old-generation collector
from 0 collections / 0 ms to 1 / 102 ms. Other collector counters were preserved.

The official spark API samples counters minus its normal-operation baseline,
excluding startup activity. These are neither rolling statistics nor JVM-lifetime
totals. A server/provider restart starts another baseline. `-1` provider values
are omitted independently by the Bridge. Collector time is provider-reported
accumulated collection time, not a stop-the-world pause histogram.

The browser replays the real before/after records through the external Bridge
HTTP boundary and production Web/BFF/Isles. Empty counters and baseline reset are
separate protocol cases; they do not claim this native run produced unknown GC
measurements or restarted the JVM. A separate run with built-in spark disabled
(`D:/Temp/isles-paper-live-vI5muL`) retained binding/whitelist functionality and
reported no GC observations.
