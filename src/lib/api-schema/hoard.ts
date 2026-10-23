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
    "/auth/oidc/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 发起 OIDC 登录（302 跳转 IdP 授权端点；state/nonce 存短期 httpOnly cookie） */
        get: operations["oidcLogin"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/oidc/callback": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** OIDC 回调（校验 state/nonce → 换 token → upsert 用户投影 → 设会话 cookie） */
        get: operations["oidcCallback"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 登出（删除服务端会话并清 cookie） */
        post: operations["logout"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 当前登录用户投影 */
        get: operations["me"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/team": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 创建团队（调用者成为 owner） */
        post: operations["createTeam"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/user/teams": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 我所在的团队 */
        get: operations["listMyTeams"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/team/{id}/members": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 团队成员列表（公开） */
        get: operations["listTeamMembers"];
        put?: never;
        /** 添加/变更成员（owner 或站点 admin） */
        post: operations["addTeamMember"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/team/{id}/members/{sub}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** 移除成员（owner/admin）或自己退出 */
        delete: operations["removeTeamMember"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/user/pats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 我的个人访问令牌（元数据，不含明文） */
        get: operations["listPATs"];
        put?: never;
        /** 创建 PAT；明文 token 仅在本次响应返回一次 */
        post: operations["createPAT"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/user/pats/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** 撤销 PAT（立即失效） */
        delete: operations["deletePAT"];
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
        User: {
            /** @description OIDC subject（Mirror 用户 ID） */
            sub: string;
            username: string;
            email: string;
            avatar_url: string;
            /** @enum {string} */
            role: "user" | "admin";
        };
        TeamMember: {
            team_id: string;
            user_sub: string;
            username: string;
            /** @enum {string} */
            role: "owner" | "member";
            created_at: string;
        };
        UserTeam: {
            team_id: string;
            name: string;
            /** @enum {string} */
            role: "owner" | "member";
            created_at: string;
        };
        PAT: {
            id: string;
            name: string;
            scopes: string[];
            expires_at?: string;
            last_used?: string;
            created_at: string;
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
            /** @description 归属团队 id（存量管理员上传为空） */
            team?: string;
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
        /** @description 团队 id */
        TeamID: string;
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
    oidcLogin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 跳转授权端点 */
            302: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 未配置 OIDC */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    oidcCallback: {
        parameters: {
            query?: {
                code?: string;
                state?: string;
                error?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 登录成功，跳回站点根 */
            302: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description state 不匹配或缺参 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 用户拒绝授权 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description token 交换或 ID token 校验失败 */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    logout: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 已登出 */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    me: {
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
                    "application/json": components["schemas"]["User"];
                };
            };
            /** @description 未登录 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    createTeam: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    name?: string;
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
                    "application/json": {
                        id?: string;
                    };
                };
            };
            /** @description 未登录 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    listMyTeams: {
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
                    "application/json": components["schemas"]["UserTeam"][];
                };
            };
            /** @description 未登录 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    listTeamMembers: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 团队 id */
                id: components["parameters"]["TeamID"];
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
                    "application/json": components["schemas"]["TeamMember"][];
                };
            };
            /** @description 团队不存在 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    addTeamMember: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 团队 id */
                id: components["parameters"]["TeamID"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    sub: string;
                    /**
                     * @default member
                     * @enum {string}
                     */
                    role?: "owner" | "member";
                };
            };
        };
        responses: {
            /** @description 已添加 */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 非 owner/admin */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 团队或用户不存在 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    removeTeamMember: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 团队 id */
                id: components["parameters"]["TeamID"];
                sub: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 已移除 */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 无权 */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 不存在 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    listPATs: {
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
                    "application/json": components["schemas"]["PAT"][];
                };
            };
            /** @description 未登录 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    createPAT: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    name: string;
                    scopes?: string[];
                    /** @description 省略或 0 表示永不过期 */
                    expires_in_days?: number;
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
                    "application/json": {
                        id?: string;
                        /** @description 明文（mhp_ 前缀），仅此一次 */
                        token?: string;
                    };
                };
            };
            /** @description name 缺失 */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 未登录 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    deletePAT: {
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
            /** @description 已撤销 */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 未登录 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 不存在或不属于当前用户 */
            404: {
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
