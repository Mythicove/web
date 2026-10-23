// 由 scripts/gen-api.mjs 从 api/specs/hoard.openapi.yaml 生成，请勿手改。
export interface paths {
    "/healthz": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 健康检查 */
        get: operations["healthz"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v2/search": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 全文 + facets 搜索（仅返回 listed 项目） */
        get: operations["search"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mods": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 项目列表/搜索（/v2/search 的别名，参数一致） */
        get: operations["listMods"];
        put?: never;
        /** 上传 mod/整合包（需管理员 token） */
        post: operations["uploadMod"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mods/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 按 id/slug 取项目（/v2/project/{id} 的别名） */
        get: operations["getMod"];
        put?: never;
        post?: never;
        /** 删除项目（需管理员 token） */
        delete: operations["deleteMod"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mods/{id}/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** 更新审核状态（需管理员 token） */
        patch: operations["setModStatus"];
        trace?: never;
    };
    "/api/mods/{id}/download": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 下载最新版本的主文件 */
        get: operations["downloadMod"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mods/{id}/version/{vid}/file/{fid}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 下载指定版本的指定文件 */
        get: operations["downloadModFile"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v2/project/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 按 id 或 slug 取项目 */
        get: operations["getProject"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v2/project/{id}/version": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 取项目的所有版本（含文件 URL） */
        get: operations["getProjectVersions"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v2/version/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 按 id 取版本 */
        get: operations["getVersion"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v2/project/{id}/version/{vid}/mrpack": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 生成 .mrpack 整合包（modrinth.index.json） */
        get: operations["getMrpack"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v2/tag/category": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 取分类名称列表 */
        get: operations["getCategories"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v2/tag/loader": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 取 loader 名称列表 */
        get: operations["getLoaders"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v2/tag/game_version": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 取游戏版本名称列表 */
        get: operations["getGameVersions"];
        put?: never;
        post?: never;
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
        HoardError: {
            error?: string;
        };
        SearchResponse: {
            hits: components["schemas"]["Project"][];
            offset: number;
            limit: number;
            /** Format: int64 */
            total_hits: number;
        };
        Project: {
            id: string;
            slug: string;
            title: string;
            description?: string;
            body?: string;
            project_type: string;
            client_side?: string;
            server_side?: string;
            /** @enum {string} */
            status?: "listed" | "under_review" | "rejected" | "archived";
            /** Format: int64 */
            downloads?: number;
            /** Format: int64 */
            follows?: number;
            /** @description RFC3339 时间戳；未发布时为空字符串 */
            published?: string;
            loaders?: string[];
            game_versions?: string[];
            categories?: string[];
        };
        Version: {
            id: string;
            project_id: string;
            name?: string;
            version_number: string;
            /** @enum {string} */
            version_type?: "release" | "beta" | "alpha";
            changelog?: string;
            loaders?: string[];
            game_versions?: string[];
            date_published?: string;
            files?: components["schemas"]["File"][];
        };
        File: {
            hashes?: {
                sha1?: string;
                sha512?: string;
            };
            url?: string;
            filename?: string;
            primary?: boolean;
            /** Format: int64 */
            size?: number;
        };
    };
    responses: {
        /** @description 错误响应（纯文本或 JSON） */
        Error: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["HoardError"];
            };
        };
    };
    parameters: {
        /** @description 项目 id 或 slug */
        ProjectID: string;
    };
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    healthz: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    search: {
        parameters: {
            query?: {
                q?: string;
                /** @description JSON 编码的 facets 数组，如 [["categories:forge"],["versions:1.20.1"]] */
                facets?: string;
                /** @description 逗号分隔的 loader 列表 */
                loaders?: string;
                /** @description 逗号分隔的游戏版本列表 */
                game_versions?: string;
                /** @description 逗号分隔的分类列表 */
                categories?: string;
                /** @description 逗号分隔的项目类型列表 */
                project_type?: string;
                offset?: number;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SearchResponse"];
                };
            };
        };
    };
    listMods: {
        parameters: {
            query?: {
                q?: string;
                offset?: number;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SearchResponse"];
                };
            };
        };
    };
    uploadMod: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": {
                    /** Format: binary */
                    file: string;
                    title: string;
                    description?: string;
                    body?: string;
                    project_type?: string;
                    client_side?: string;
                    server_side?: string;
                    /** @description 逗号分隔 */
                    loaders?: string;
                    /** @description 逗号分隔 */
                    game_versions?: string;
                    /** @description 逗号分隔 */
                    categories?: string;
                    name?: string;
                    version_number?: string;
                    version_type?: string;
                    changelog?: string;
                };
            };
        };
        responses: {
            /** @description 已创建 */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Project"];
                };
            };
            400: components["responses"]["Error"];
            403: components["responses"]["Error"];
            413: components["responses"]["Error"];
        };
    };
    getMod: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 项目 id 或 slug */
                id: components["parameters"]["ProjectID"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Project"];
                };
            };
            404: components["responses"]["Error"];
        };
    };
    deleteMod: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 项目 id 或 slug */
                id: components["parameters"]["ProjectID"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 已删除 */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            403: components["responses"]["Error"];
            404: components["responses"]["Error"];
        };
    };
    setModStatus: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 项目 id 或 slug */
                id: components["parameters"]["ProjectID"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @enum {string} */
                    status: "listed" | "under_review" | "rejected" | "archived";
                };
            };
        };
        responses: {
            /** @description 已更新 */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: components["responses"]["Error"];
            403: components["responses"]["Error"];
        };
    };
    downloadMod: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 项目 id 或 slug */
                id: components["parameters"]["ProjectID"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 文件内容 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/octet-stream": string;
                };
            };
            404: components["responses"]["Error"];
        };
    };
    downloadModFile: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 项目 id 或 slug */
                id: components["parameters"]["ProjectID"];
                vid: string;
                fid: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 文件内容 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/octet-stream": string;
                };
            };
            404: components["responses"]["Error"];
        };
    };
    getProject: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 项目 id 或 slug */
                id: components["parameters"]["ProjectID"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Project"];
                };
            };
            404: components["responses"]["Error"];
        };
    };
    getProjectVersions: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 项目 id 或 slug */
                id: components["parameters"]["ProjectID"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Version"][];
                };
            };
            404: components["responses"]["Error"];
        };
    };
    getVersion: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Version"];
                };
            };
            404: components["responses"]["Error"];
        };
    };
    getMrpack: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 项目 id 或 slug */
                id: components["parameters"]["ProjectID"];
                vid: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description .mrpack（zip） */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/zip": string;
                };
            };
            404: components["responses"]["Error"];
        };
    };
    getCategories: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string[];
                };
            };
        };
    };
    getLoaders: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string[];
                };
            };
        };
    };
    getGameVersions: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string[];
                };
            };
        };
    };
}
