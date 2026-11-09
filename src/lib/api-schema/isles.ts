// 由 scripts/gen-api.mjs 从 api/specs/isles.openapi.yaml 生成，请勿手改。
export interface paths {
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
        GameIdentity: {
            uuid: string;
            name: string;
            platform: string;
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
            /** Format: date-time */
            readonly receivedAt: string;
        };
        BridgeTask: {
            id: string;
            /** @enum {string} */
            kind: "whitelist" | "member";
            uuid: string;
            group?: string;
            grant: boolean;
            /** @enum {string} */
            status: "pending" | "applied" | "failed";
            error?: string;
            /** Format: date-time */
            createdAt: string;
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
            /** @description Verified game identities and own online-player data only */
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
                    platform: string;
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
            /** @description Up to 10 pending desired-state tasks, safe to replay before acknowledgement */
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
        };
    };
}
