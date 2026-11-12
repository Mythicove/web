// 由 scripts/gen-api.mjs 从 api/specs/isles.openapi.yaml 生成，请勿手改。
export interface paths {
    "/healthz": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Process health; does not establish game-server or Bridge health */
        get: operations["getIslesHealth"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/metrics": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Private Prometheus Bridge snapshot gauges
         * @description Direct private Isles endpoint. When ISLES_METRICS_TOKEN is configured only that read-only token is accepted; otherwise the existing service token is required. Exposes configured server IDs, Bridge freshness/observation time and fresh TPS/MSPT/system CPU/GC only. Performance series are omitted after 90 seconds or when unknown. GC gauges retain provider-reset semantics. No player data or upstream calls on scrape. Use Prometheus for history; Web BFF does not expose this route.
         */
        get: operations["scrapeIslesMetrics"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/isles/catalog/modrinth/hash/{hash}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Identify a local file by its browser-computed SHA-512 digest
         * @description Queries the fixed Modrinth file index; no file content or name is uploaded. Only returned files with the exact publisher digest are exposed. Identification does not attest safety or installation compatibility. Uses the shared catalog cache and request budget.
         */
        get: operations["identifyModrinthFile"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/isles/catalog/modrinth/search": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["searchModrinthCatalog"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/isles/catalog/hangar/search": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["searchHangarCatalog"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/isles/catalog/modrinth/versions/{project}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listModrinthVersions"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/isles/catalog/hangar/versions/{owner}/{project}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listHangarVersions"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/isles/servers": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listServers"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/isles/servers/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
            };
            cookie?: never;
        };
        get: operations["getServer"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/isles/servers/{id}/status": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
            };
            cookie?: never;
        };
        get: operations["getGameStatus"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/isles/packs/{version}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["downloadPack"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/isles/admin/config": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getIslesConfig"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/isles/admin/servers/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
            };
            cookie?: never;
        };
        get?: never;
        put: operations["saveServer"];
        post?: never;
        delete: operations["deleteServer"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/isles/admin/connections/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
            };
            cookie?: never;
        };
        get?: never;
        put: operations["saveConnection"];
        post?: never;
        delete: operations["deleteConnection"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/isles/admin/connections/{id}/instances": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
            };
            cookie?: never;
        };
        get: operations["listPanelInstances"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/isles/admin/connections/{id}/metrics": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
            };
            cookie?: never;
        };
        get: operations["getExporterMetrics"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/isles/admin/servers/{id}/runtime": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
            };
            cookie?: never;
        };
        get: operations["getPanelRuntime"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/isles/admin/servers/{id}/actions/{action}": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
                action: "start" | "stop" | "restart" | "command";
            };
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["controlInstance"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/isles/admin/servers/{id}/logs": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
            };
            cookie?: never;
        };
        get: operations["getRecentLogs"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/isles/admin/servers/{id}/publish-pack": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
            };
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["publishPackwiz"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/isles/admin/servers/{id}/bridge-token": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
            };
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["rotateBridgeToken"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/isles/admin/servers/{id}/bridge": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
            };
            cookie?: never;
        };
        get: operations["getBridgeObservation"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/isles/admin/servers/{id}/identities": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
            };
            cookie?: never;
        };
        get: operations["listVerifiedGameIdentities"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/isles/admin/servers/{id}/tasks": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
            };
            cookie?: never;
        };
        get: operations["listBridgeTasks"];
        put?: never;
        post: operations["setGameMembership"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/isles/admin/servers/{id}/chunky": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
            };
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Queue one generation operation for a reported loaded world. Start accepts square/circle and a radius in blocks; it never overwrites paused work. Applied means the plugin accepted the operation, not that generation completed. */
        post: operations["controlChunkyGeneration"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/isles/admin/servers/{id}/coreprotect": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
            };
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Administrator-only exact-coordinate persisted history via CoreProtect API v12. Queues an asynchronous read; retrieve result from admin tasks. Each page is an independent read, newest first; new events can shift offsets. Returns up to 100 records, with hasMore derived from a 101st row. Read requests may replay after a lost acknowledgement. Does not modify game history or world state. */
        post: operations["queryCoreProtectHistory"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/isles/players/{player}/pair": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                player: components["parameters"]["player"];
            };
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Web BFF verifies website session and ownership; direct Isles calls require service token and X-Isles-Player. */
        post: operations["createGamePairing"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/isles/players/{player}/links": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                player: components["parameters"]["player"];
            };
            cookie?: never;
        };
        get: operations["listOwnGameLinks"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/isles/bridge/{id}/heartbeat": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
            };
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["observeGameBridge"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/isles/bridge/{id}/link": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
            };
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["verifyGamePairing"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/isles/bridge/{id}/identities": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
            };
            cookie?: never;
        };
        /** @description UUID allowlist for private offline statistics on this server; contains no website identities. Maximum 2000 verified identities; exceeding capacity fails explicitly. */
        get: operations["listBridgeVerifiedUUIDs"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/isles/bridge/{id}/tasks": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
            };
            cookie?: never;
        };
        get: operations["getPendingBridgeTasks"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/isles/bridge/{id}/tasks/{task}/claim": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
                task: string;
            };
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Persist at-most-once dispatch of a Chunky operation before invoking the provider. A lost claim or result response leaves dispatched with an uncertain outcome; no automatic replay occurs, including after restart. */
        post: operations["claimBridgeOperation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/isles/bridge/{id}/tasks/{task}": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
                task: string;
            };
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["acknowledgeBridgeTask"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        CatalogMatch: {
            /** @description Modrinth project ID reported for this file */
            projectId: string;
            version: components["schemas"]["CatalogVersion"];
        };
        CatalogFile: {
            name: string;
            /** Format: uri */
            url: string;
            hashes: {
                [key: string]: string;
            };
            /** Format: int64 */
            size: number;
            platform?: string;
        };
        CatalogVersion: {
            id: string;
            name: string;
            number: string;
            channel: string;
            gameVersions: string[];
            loaders: string[];
            files: components["schemas"]["CatalogFile"][];
        };
        CatalogProject: {
            id: string;
            slug: string;
            title: string;
            description?: string;
            projectType?: string;
            /** Format: uri */
            iconUrl?: string;
            /** @enum {string} */
            source: "modrinth" | "hangar";
            /** Format: uri */
            url: string;
            /** Format: int64 */
            downloads?: number;
            categories?: string[];
            loaders?: string[];
            gameVersions?: string[];
        };
        GameIdentity: {
            uuid: string;
            name: string;
            /** @enum {string} */
            platform: "java" | "bedrock";
            /** Format: date-time */
            linkedAt: string;
        };
        PlayerSnapshot: {
            uuid: string;
            name: string;
            group?: string;
            groups?: string[];
            values?: {
                [key: string]: string;
            };
            /** @description Protocol version observed by ViaVersion for this online player */
            clientVersion?: string;
            regions?: components["schemas"]["GameRegion"][];
            /** @description Additional matching regions were omitted */
            regionsTruncated?: boolean;
            economy?: components["schemas"]["GameEconomy"];
            connection?: components["schemas"]["GameConnection"];
            voicechat?: components["schemas"]["GameVoicechat"];
        };
        /** @description Owner/admin-only Simple Voice Chat API observation for an online player. Omitted when the provider or connection state is unavailable. Other addons may override connection state; this does not attest microphone capture, audio delivery, or public UDP reachability. */
        GameVoicechat: {
            /** @description Provider reports a compatible client handshake */
            installed: boolean;
            /** @description Provider-reported voice connection */
            connected: boolean;
            /** @description Provider reports that the player disabled voice sound */
            disabled: boolean;
        };
        /** @description Owner/admin-only live Bedrock observation from an installed provider. UUID remains the actual Bukkit identity; no Xbox IDs or account tokens are exported. Presence is not an independent Xbox authentication attestation. */
        GameConnection: {
            /** @enum {string} */
            edition: "bedrock";
            /** @enum {string} */
            provider: "geyser" | "floodgate";
            version: string;
            /** @description Provider-side Java-account linking; independent of this website's one-time game binding */
            linkedJavaAccount: boolean;
        };
        /** @description Administrator-only Geyser-supported versions; these are not a guarantee of proxy/authentication/mod compatibility. */
        CrossplaySnapshot: {
            javaVersion: string;
            bedrockVersions: string[];
        };
        GameEconomy: {
            provider: string;
            balance: number;
            formatted: string;
            currency: string;
        };
        GameRegion: {
            id: string;
            world: string;
            /** @enum {string} */
            role: "owner" | "member";
            centerX: number;
            centerY: number;
            centerZ: number;
        };
        /** @description Administrator-only spark GC counters since the provider's normal-operation baseline (startup activity excluded). Each unknown counter is omitted independently; zero is retained as reported. Counters reset with the provider/server, not a rolling interval or pause histogram. */
        GarbageCollectorStats: {
            /** Format: int64 */
            collections?: number;
            /**
             * Format: int64
             * @description Provider-reported accumulated collection time in milliseconds
             */
            timeMs?: number;
        };
        BridgeSnapshot: {
            platform: string;
            minecraft: string;
            plugins: {
                [key: string]: string;
            };
            groups: string[];
            players: components["schemas"]["PlayerSnapshot"][];
            tps?: number;
            mspt?: number;
            /** @description Fraction of system CPU usage */
            cpu?: number;
            /** @description GC statistics keyed by provider-reported collector name; absent when unavailable. Never exposed in the public directory or player profile. */
            garbageCollectors?: {
                [key: string]: components["schemas"]["GarbageCollectorStats"];
            };
            /** Format: date-time */
            readonly receivedAt: string;
            /** @description ViaVersion-supported protocols after configured blocks; does not guarantee proxy/modpack compatibility */
            protocolVersions?: string[];
            /** @description Administrator-only loaded worlds and Chunky task state; absent if unavailable */
            chunky?: components["schemas"]["ChunkyWorld"][];
            plan?: components["schemas"]["PlanSnapshot"];
            towny?: components["schemas"]["TownySnapshot"];
            crossplay?: components["schemas"]["CrossplaySnapshot"];
        };
        TownyReference: {
            /** @description Stable provider UUID */
            id: string;
            name: string;
        };
        TownyTown: {
            id: string;
            name: string;
            residents: number;
            /** @description Provider townblock count; not an assumed block area or map polygon */
            claimedTownBlocks: number;
            /** @description Towny open-join flag; not a website join action */
            open: boolean;
            /** @description Towny public-spawn flag; not permission to publish the town on this website */
            public: boolean;
            nation?: components["schemas"]["TownyReference"];
        };
        TownyNation: {
            id: string;
            name: string;
            towns: number;
            residents: number;
            open: boolean;
            /** @description Provider public-spawn flag */
            public: boolean;
        };
        /** @description Owner-only verified resident membership, including offline residents. Present without town means a known townless resident; absence means unavailable or unknown resident. */
        TownyResident: {
            uuid: string;
            mayor: boolean;
            king: boolean;
            townRanks: string[];
            nationRanks: string[];
            town?: components["schemas"]["TownyTown"];
            /** Format: date-time */
            observedAt: string;
        };
        /** @description Administrator-only provider towns/nations and verified resident rows. Lists retain at most 100 towns and 100 nations in UUID order; counts describe the complete provider lists, not the retained page. No resident directory or spawn coordinates are exported. */
        TownySnapshot: {
            townCount: number;
            nationCount: number;
            towns: components["schemas"]["TownyTown"][];
            nations: components["schemas"]["TownyNation"][];
            residents: components["schemas"]["TownyResident"][];
            /** Format: date-time */
            observedAt: string;
        };
        /** @description Stored Plan sessions for one verified UUID on the current game server; available while offline. Does not include an unsaved current session. */
        PlanActivity: {
            uuid: string;
            /** Format: int64 */
            sessions: number;
            /**
             * Format: int64
             * @description Stored session duration including AFK
             */
            playtimeMs: number;
            /** Format: int64 */
            afkMs: number;
            /**
             * Format: date-time
             * @description Earliest stored session start
             */
            firstSeen: string;
            /**
             * Format: date-time
             * @description Latest stored session end; not live presence
             */
            lastSeen: string;
            /** Format: date-time */
            observedAt: string;
        };
        /** @description Administrator-only Plan aggregate scoped by the provider's current server UUID. Individual rows include verified UUIDs only; absent when provider/query is unavailable. */
        PlanSnapshot: {
            serverUUID: string;
            /**
             * Format: int64
             * @description Distinct players with stored sessions on this server
             */
            recordedPlayers: number;
            /** Format: int64 */
            sessions: number;
            /** Format: int64 */
            playtimeMs: number;
            /** Format: int64 */
            afkMs: number;
            /** Format: date-time */
            observedAt: string;
            players: components["schemas"]["PlanActivity"][];
        };
        ChunkyWorld: {
            world: string;
            /**
             * @description Stopped means the saved terminal checkpoint cannot establish completion versus cancellation after a restart
             * @enum {string}
             */
            state: "idle" | "running" | "paused" | "completed" | "cancelled" | "stopped";
            selection?: {
                shape: string;
                centerX: number;
                centerZ: number;
                radiusX: number;
                radiusZ: number;
            };
            progress?: {
                /** Format: int64 */
                chunks: number;
                /** Format: int64 */
                total: number;
                percent: number;
                /** @description Plugin estimate in chunks per second; only available while running */
                rate?: number;
                /**
                 * Format: int64
                 * @description Plugin ETA while running; never completion elapsed time
                 */
                etaSeconds?: number;
            };
        };
        ChunkyOperation: {
            /** @description Loaded world reported by the Bridge */
            world: string;
            /** @enum {string} */
            action: "start" | "pause" | "continue" | "cancel";
            /**
             * @description Required for start
             * @enum {string}
             */
            shape?: "square" | "circle";
            /** @description Defaults to zero */
            centerX?: number;
            /** @description Defaults to zero */
            centerZ?: number;
            /** @description Required for start; blocks, also bounded by the server Chunky radius limit */
            radius?: number;
        };
        BridgeTask: {
            id: string;
            /** @enum {string} */
            kind: "whitelist" | "member" | "chunky" | "coreprotect";
            uuid: string;
            group?: string;
            grant: boolean;
            /**
             * @description Dispatched means claimed with no result yet; an interrupted operation is never automatically replayed
             * @enum {string}
             */
            status: "pending" | "dispatched" | "applied" | "failed";
            chunky?: components["schemas"]["ChunkyOperation"];
            coreprotect?: components["schemas"]["CoreProtectQuery"];
            coreprotectResult?: components["schemas"]["CoreProtectResult"];
            error?: string;
            /** Format: date-time */
            createdAt: string;
        };
        CoreProtectQuery: {
            world: string;
            x: number;
            /** @description Also checked against the actual loaded world height */
            y: number;
            z: number;
            seconds: number;
            offset: number;
        };
        CoreProtectResult: {
            hasMore: boolean;
            records: {
                /** @description Recorded actor name, not a verified website identity */
                player: string;
                /**
                 * Format: int64
                 * @description Unix milliseconds
                 */
                timestampMs: number;
                /** @description Original CoreProtect action string */
                action: string;
                /** @description Omitted when the provider cannot resolve material */
                material?: string;
                rolledBack: boolean;
            }[];
        };
        Link: {
            kind: string;
            /** Format: uri */
            url: string;
            label: string;
        };
        Server: {
            id: string;
            name: string;
            description: string;
            /** @description host:port, IPv6 enclosed in brackets */
            address: string;
            /** @enum {string} */
            edition: "java" | "bedrock";
            /** Format: uri */
            coverUrl?: string;
            links: components["schemas"]["Link"][];
            published: boolean;
            /** @description Admin only */
            connectionId?: string;
            /** @description Admin only */
            daemonId?: string;
            /** @description Admin only */
            instanceId?: string;
            /**
             * Format: uri
             * @description Admin only
             */
            packwizUrl?: string;
            readonly packVersion?: string;
            map?: components["schemas"]["WorldMap"];
        };
        WorldMap: {
            /** @enum {string} */
            kind: "bluemap" | "squaremap" | "dynmap";
            /**
             * Format: uri
             * @description Browser-facing map URL; may retain a saved camera-location fragment
             */
            url: string;
        };
        Connection: {
            id: string;
            name: string;
            /** @enum {string} */
            kind: "mcsm" | "pterodactyl" | "prometheus";
            /** Format: uri */
            url: string;
            readonly configured: boolean;
        };
        Config: {
            servers: components["schemas"]["Server"][];
            connections: components["schemas"]["Connection"][];
        };
        GameStatus: {
            reachable: boolean;
            /** Format: date-time */
            checkedAt: string;
            latencyMs: number;
            players?: number;
            maxPlayers?: number;
            version?: string;
            motd?: string;
            error?: string;
            /** @description Allowed protocol names from a Bridge heartbeat less than 90 seconds old. Omitted when unavailable or stale; does not establish modpack or authentication compatibility. */
            protocolVersions?: string[];
        };
        Instance: {
            id: string;
            name: string;
            daemonId?: string;
        };
        Runtime: {
            state: string;
            /** Format: date-time */
            checkedAt: string;
            cpuPercent?: number;
            memoryBytes?: number;
        };
    };
    responses: never;
    parameters: {
        player: string;
        id: string;
    };
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    getIslesHealth: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Isles process is serving requests */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/plain": string;
                };
            };
        };
    };
    scrapeIslesMetrics: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Prometheus text exposition 0.0.4, all series are gauges */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/plain": string;
                };
            };
            /** @description Configured metrics token required, or service token when no metrics token is configured; a per-server Bridge token is insufficient */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    identifyModrinthFile: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                hash: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Exact publisher-digest match; version.files contains only matching files */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CatalogMatch"];
                };
            };
            /** @description Invalid digest or query parameters */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description File hash not indexed by Modrinth */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Shared catalog request budget exhausted */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Source unavailable or returned no consistent file identity */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    searchModrinthCatalog: {
        parameters: {
            query: {
                q: string;
                loader?: string;
                game_version?: string;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Fixed-origin Modrinth project metadata; files are not mirrored. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CatalogProject"][];
                };
            };
            /** @description Invalid query */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Catalog upstream budget exhausted */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Upstream unavailable or invalid */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    searchHangarCatalog: {
        parameters: {
            query: {
                q: string;
                platform?: string;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Fixed-origin Hangar project metadata; files are not mirrored. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CatalogProject"][];
                };
            };
            /** @description Invalid query */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Catalog upstream budget exhausted */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Upstream unavailable or invalid */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    listModrinthVersions: {
        parameters: {
            query?: {
                loader?: string;
                game_version?: string;
                limit?: number;
            };
            header?: never;
            path: {
                project: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Versions with upstream-declared file hashes, download URLs and compatibility. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CatalogVersion"][];
                };
            };
            /** @description Invalid filters */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Catalog upstream budget exhausted */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Upstream unavailable or invalid */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    listHangarVersions: {
        parameters: {
            query?: {
                platform?: string;
                game_version?: string;
                limit?: number;
            };
            header?: never;
            path: {
                owner: string;
                project: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Versions and downloads on selected platforms; external-only artifacts have no direct download. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CatalogVersion"][];
                };
            };
            /** @description Invalid filters */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Catalog upstream budget exhausted */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Upstream unavailable or invalid */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    listServers: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Published servers only; panel bindings and packwiz source are omitted. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Server"][];
                };
            };
        };
    };
    getServer: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Published server */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Server"];
                };
            };
            /** @description Server unavailable */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getGameStatus: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Game probe observation, cached for 20 seconds. Latency is from Isles. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GameStatus"];
                };
            };
            /** @description Server unavailable */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    downloadPack: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                version: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Hash-addressed published pack */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/x-modrinth-modpack+zip": string;
                };
            };
            /** @description Not attached to a published server */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getIslesConfig: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Configuration without connection tokens */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Config"];
                };
            };
            /** @description Service token required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    saveServer: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["Server"];
            };
        };
        responses: {
            /** @description Saved server; packVersion is preserved by the server */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Server"];
                };
            };
            /** @description Invalid configuration */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service token required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    deleteServer: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Removed */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service token required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    saveConnection: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["Connection"] & {
                    /** @description Omit to preserve existing secret; an empty value clears it. */
                    token?: string;
                };
            };
        };
        responses: {
            /** @description Saved connection without token */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Connection"];
                };
            };
            /** @description Invalid connection */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service token required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    deleteConnection: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Removed */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service token required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Connection is bound to a server */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    listPanelInstances: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Panel instances */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Instance"][];
                };
            };
            /** @description Service token required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Panel unavailable or rejected request */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getExporterMetrics: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Selected server-level Prometheus metrics */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** Format: date-time */
                        checkedAt: string;
                        metrics: {
                            name: string;
                            labels: {
                                [key: string]: string;
                            };
                            value: number;
                        }[];
                    };
                };
            };
            /** @description Service token required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Exporter unavailable or invalid exposition */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getPanelRuntime: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Process status, separate from game reachability */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Runtime"];
                };
            };
            /** @description Service token required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description No bound panel instance */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Panel unavailable */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    controlInstance: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
                action: "start" | "stop" | "restart" | "command";
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    command?: string;
                };
            };
        };
        responses: {
            /** @description Accepted by the panel; poll runtime to confirm */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid action or command */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service token required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description No bound panel instance */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Panel rejected request */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getRecentLogs: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Last 64KB of MCSManager log */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        text: string;
                    };
                };
            };
            /** @description Service token required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Panel requires its WebSocket console */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Panel unavailable */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    publishPackwiz: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Verified immutable mrpack publication */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        version: string;
                        path: string;
                    };
                };
            };
            /** @description No configured source */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service token required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Source changed during publication */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Source unavailable */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    rotateBridgeToken: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Server-specific token shown only on creation; old token is immediately revoked. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        token: string;
                    };
                };
            };
            /** @description Administrator required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getBridgeObservation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Latest observation; fresh means received within 90 seconds. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        fresh: boolean;
                        snapshot: components["schemas"]["BridgeSnapshot"];
                    };
                };
            };
            /** @description Bridge has not connected */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    listVerifiedGameIdentities: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Verified website-player to game identities for this server */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        player: string;
                        identity: components["schemas"]["GameIdentity"];
                    }[];
                };
            };
        };
    };
    listBridgeTasks: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Durable desired-state task results */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BridgeTask"][];
                };
            };
        };
    };
    setGameMembership: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    player: string;
                    /** @enum {string} */
                    kind: "whitelist" | "member";
                    /** @description Existing group reported by the Bridge */
                    group?: string;
                    grant: boolean;
                };
            };
        };
        responses: {
            /** @description Queued, not yet applied */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BridgeTask"];
                };
            };
            /** @description Verified identity */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    controlChunkyGeneration: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ChunkyOperation"];
            };
        };
        responses: {
            /** @description Operation queued */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BridgeTask"];
                };
            };
            /** @description Invalid selection or unreported world */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Administrator required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bridge stale, provider unavailable, incompatible state or operation already pending */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Task capacity reached */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    queryCoreProtectHistory: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CoreProtectQuery"];
            };
        };
        responses: {
            /** @description Query queued */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BridgeTask"];
                };
            };
            /** @description Invalid coordinate or time window */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Administrator required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Current CoreProtect observation required */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Task capacity reached */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    createGamePairing: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                player: components["parameters"]["player"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    server: string;
                };
            };
        };
        responses: {
            /** @description One-time game linking code, valid for 10 minutes */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        code: string;
                        command: string;
                        /** Format: date-time */
                        expiresAt: string;
                    };
                };
            };
            /** @description Website-player ownership required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    listOwnGameLinks: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                player: components["parameters"]["player"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Verified game identities with own online-player observations and stored Plan activity only */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        server: string;
                        identity: components["schemas"]["GameIdentity"];
                        fresh: boolean;
                        player?: components["schemas"]["PlayerSnapshot"];
                        activity?: components["schemas"]["PlanActivity"];
                        towny?: components["schemas"]["TownyResident"];
                    }[];
                };
            };
        };
    };
    observeGameBridge: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BridgeSnapshot"];
            };
        };
        responses: {
            /** @description Observation received */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Server-specific Bridge token required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    verifyGamePairing: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    code: string;
                    uuid: string;
                    name: string;
                    /**
                     * @description Observed in the game server; never inferred from the player name
                     * @enum {string}
                     */
                    platform: "java" | "bedrock";
                };
            };
        };
        responses: {
            /** @description Verified and consumed */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Code expired */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Game identity belongs to another website player */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    listBridgeVerifiedUUIDs: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Verified game UUIDs belonging to this server */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string[];
                };
            };
            /** @description Server-specific token required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Verified identity capacity exceeded */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getPendingBridgeTasks: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Up to 10 pending tasks. Membership sets desired state; Chunky operations MUST be claimed before execution and must never be replayed after dispatch. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BridgeTask"][];
                };
            };
        };
    };
    claimBridgeOperation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
                task: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Dispatch persisted; this caller may execute once */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Server-specific Bridge token required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Already dispatched or not a claimable operation; do not execute */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    acknowledgeBridgeTask: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["id"];
                task: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    success: boolean;
                    error?: string;
                    coreprotectResult?: components["schemas"]["CoreProtectResult"];
                };
            };
        };
        responses: {
            /** @description Result persisted; repeated acknowledgement is idempotent */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Chunky operation must be claimed first */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
}
