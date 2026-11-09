// 由 scripts/gen-api.mjs 从 api/specs/mirror.openapi.yaml 生成，请勿手改。
export interface paths {
    "/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 根 meta 端点
         * @description 返回服务元信息，供客户端发现签名公钥与皮肤域名。
         */
        get: operations["getMeta"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/authserver/authenticate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 启动器认证（玩家名 + 独立密码）
         * @description Yggdrasil 协议登录。username 是**玩家名**、password 是该玩家的**启动器独立密码** （ADR-0012）：网站主密码在此不被接受，邮箱也不能作用户名。因此管理员关闭主密码登录后 启动器照常工作。玩家没有独立密码时一律 403——需先到网站的账号页生成一条。 响应里的 availableProfiles/selectedProfile 只有认证到的那一个玩家： 一条独立密码只证明它所属玩家的身份。 403 的 errorMessage 可能是稳定错误码 `binding_required` （管理员强制绑定第三方而该账号尚未绑定）。
         */
        post: operations["authenticate"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/authserver/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 刷新访问令牌 */
        post: operations["refresh"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/authserver/validate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 校验访问令牌 */
        post: operations["validate"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/authserver/invalidate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 使令牌失效 */
        post: operations["invalidate"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/authserver/signout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 退出登录（玩家名 + 独立密码）
         * @description 校验玩家名与该玩家的独立密码，成功后销毁**该玩家**的游戏会话。 协议原文是"注销该账号所有令牌"，但凭证属于单个玩家， 用一条玩家凭证去销毁同账号其他玩家的会话并不合理，故只清这一个玩家的； 网站会话（player_id 为空）不受影响。
         */
        post: operations["signout"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/sessionserver/session/minecraft/join": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 记录 serverId 会话 */
        post: operations["join"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/sessionserver/session/minecraft/hasJoined": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 服务端换取玩家资料 */
        get: operations["hasJoined"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/sessionserver/session/minecraft/profile/{uuid}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 按 UUID 取 profile */
        get: operations["getProfile"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/profiles/minecraft": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 批量 name → UUID 查询 */
        post: operations["queryProfiles"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/skin/{name}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 按玩家名下载皮肤 */
        get: operations["getSkin"];
        put?: never;
        /** 上传皮肤（PNG 原始字节） */
        post: operations["uploadSkin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/cape/{name}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 按玩家名下载披风 */
        get: operations["getCape"];
        put?: never;
        /** 上传披风（PNG 原始字节） */
        post: operations["uploadCape"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/textures/{key}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 按存储键取纹理原图 */
        get: operations["getTexture"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/avatars/{uuid}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** crafatar 兼容 2D 头像 */
        get: operations["getAvatar"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/avatars/by-name/{name}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 按玩家名出 2D 头像（列表/评论等仅有名字的场景） */
        get: operations["getAvatarByName"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/renders/head/{uuid}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 2D 头部渲染 */
        get: operations["getHeadRender"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/renders/body/{uuid}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 2D 全身渲染 */
        get: operations["getBodyRender"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/usm/{uuid}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** USM（统一皮肤材质）端点 */
        get: operations["getUSM"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/MinecraftSkins/{name}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 旧版皮肤直链（兼容 CSL 等） */
        get: operations["getLegacySkin"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/MinecraftCloaks/{name}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 旧版披风直链（兼容 CSL 等） */
        get: operations["getLegacyCape"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
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
    "/account/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 注册账号（发送验证邮件） */
        post: operations["register"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/account/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * web 登录（邮箱 + 主密码）
         * @description 供 web BFF（`/api/auth/login` 路由处理器）调用，不是浏览器直接端点。
         *     与 Yggdrasil 的 /authserver/authenticate 的区别：这里校验的是**网站主密码**，
         *     且 `MIRROR_CAPTCHA_SCOPES` 含 login 时强制校验 captchaToken；
         *     启动器请走 /authserver/authenticate（玩家名 + 独立密码，永不强制验证码）。
         *     与 /authserver/authenticate、/oauth2/login/accept 共用按 IP 的 "auth" 限流桶。
         *
         *     管理员在后台关掉「密码登录」后：账号密码注册立即关闭，主密码登录只对
         *     **尚未绑定第三方**的历史账号放行（宽限），已绑定的账号返回 403
         *     且 `error` 为稳定错误码 `password_login_disabled`。
         *     纯密码账号归零后主密码登录自然完全失效，无需再翻第二个开关。
         *
         *     网站会话不代表任何玩家，故响应不含 profile 段；
         *     前端要显示/操作哪个玩家，从 GET /account/players 里选。
         */
        post: operations["accountLogin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/account/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 用邮件中的 token 验证邮箱 */
        post: operations["verifyEmail"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/account/forgot-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 发送密码重置邮件（不泄露账号是否存在） */
        post: operations["forgotPassword"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/account/reset-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 用重置 token 设置新密码 */
        post: operations["resetPassword"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/account/players": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 当前账号名下玩家列表 */
        get: operations["listPlayers"];
        put?: never;
        /** 为当前账号添加玩家名 */
        post: operations["addPlayer"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/account/players/{name}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * 删除玩家（连同其会话与服务器绑定）
         * @description 账号至少保留一个玩家，删除唯一玩家返回 409。
         */
        delete: operations["deletePlayer"];
        options?: never;
        head?: never;
        /**
         * 玩家改名
         * @description 离线 UUID 由名字派生，改名会同时更换 uuid，并使该玩家的游戏会话与服务器绑定失效
         *     （启动器需重新登录）。已绑定微软正版的玩家（名字来自 Mojang）返回 409。
         */
        patch: operations["renamePlayer"];
        trace?: never;
    };
    "/account/players/{name}/credentials": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 列出该玩家的启动器独立密码
         * @description 只返回元数据（名称/创建时间/最近使用），永不返回哈希或明文。最近使用的排在前面。
         */
        get: operations["listPlayerCredentials"];
        put?: never;
        /**
         * 为该玩家新增一条启动器独立密码
         * @description 启动器登录（/authserver/authenticate）只认玩家名 + 独立密码，故玩家至少要有一条才能进服。
         *     一个玩家至多 3 条（`account.MaxCredentialsPerPlayer`）：登录时要对候选哈希逐条做
         *     Argon2id，条数直接放大失败尝试的成本，而"每台设备一条"用不到更多。
         *     密码由用户自己输入，故响应不回显明文。
         *     可以与主密码相同——两者互不影响，启动器只会匹配到独立密码。
         */
        post: operations["createPlayerCredential"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/account/players/{name}/credentials/{credentialId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * 撤销一条启动器独立密码
         * @description 由该凭证建立的启动器会话经外键级联一并销毁（立刻掉线，不是等 24 小时过期）。
         */
        delete: operations["deletePlayerCredential"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/account/identities": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 当前账号的第三方绑定与站点的强制绑定策略
         * @description `required` 来自管理员策略（PUT /api/admin/auth-policy）：为 true 且 identities 为空时，
         *     该账号不能用皮肤/皮肤库/启动器登录/SSO，前端据此弹绑定引导。
         *     绑定由第三方登录自动写入（首次按邮箱匹配到既有账号即完成绑定），本站不提供解绑：
         *     解绑会让"强制绑定"策略变成死锁。
         */
        get: operations["listIdentities"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/account/players/{name}/premium": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * 解除微软正版绑定
         * @description 清空该玩家的 premium_uuid，回到离线身份：此后可以本地改名，贴图不再回退 Mojang。
         *     幂等——未绑定时同样返回 204。
         */
        delete: operations["unbindPremium"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/oauth/{provider}/auth": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 跳转到第三方 OAuth 授权页 */
        get: operations["oauthAuth"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/oauth/{provider}/callback": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * OAuth 回调（state 为 URL 时 302 回跳，query 携带一次性 oauth_code）
         * @description 回跳不再在 URL fragment 里携带会话令牌（令牌会留在浏览历史且落地页脚本可读）。
         *     改为发放一次性、短时效（60s、单次消费）的 `oauth_code`，由 web 的服务端路由
         *     调 `POST /account/exchange-code` 兑换会话并直接落 httpOnly cookie。
         *     失败时回跳带 `?oauth=error`。
         */
        get: operations["oauthCallback"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/account/exchange-code": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * 用一次性换取码兑换会话
         * @description 调用方是 web 的服务端路由（BFF），不是浏览器。换取码单次消费，重放返回 401。
         *     返回的 accessToken 由调用方写入 httpOnly cookie，不回浏览器 URL。
         */
        post: operations["exchangeOAuthCode"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/mojang/oauth/auth": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 获取 Microsoft 正版绑定授权 URL */
        get: operations["mojangOauthAuth"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/mojang/oauth/callback": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Microsoft 正版绑定回调 */
        get: operations["mojangOauthCallback"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/mojang/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 正版账号验证 */
        post: operations["mojangVerify"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/skinlib": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 皮肤库列表（搜索/排序/分页） */
        get: operations["listSkinlib"];
        put?: never;
        /** 把玩家当前皮肤发布到皮肤库 */
        post: operations["publishSkin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/skinlib/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 皮肤库条目详情 */
        get: operations["getSkinlibItem"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/skinlib/{id}/comments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 条目评论列表（时间升序） */
        get: operations["listSkinComments"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/skinlib/{id}/apply": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 把皮肤库条目应用到自己名下的玩家 */
        post: operations["applySkin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/skinlib/{id}/like": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 点赞皮肤 */
        post: operations["likeSkin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/skinlib/{id}/comment": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 评论皮肤 */
        post: operations["commentSkin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/register-requirements": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 注册前置要求（邀请码/验证码开关），前端据此渲染控件 */
        get: operations["registerRequirements"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/login-methods": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 登录方式注册表（供前端渲染登录按钮） */
        get: operations["getLoginMethods"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/announcement": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 站点公告 */
        get: operations["getAnnouncement"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/brand": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 品牌图标配置（哪些变体被自定义 + 缓存版本号） */
        get: operations["getBrand"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/brand/logo/{variant}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 自定义品牌图标字节（未自定义时 404，前端回落内置默认图） */
        get: operations["getBrandLogo"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/site": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 站点身份文本 + 自定义资产是否存在（前端据此挂 link/script 与渲染备案/版权） */
        get: operations["getSite"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/site/custom.css": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 自定义 CSS（同源文件下发以兼容 CSP；未设置 404） */
        get: operations["getSiteCustomCSS"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/site/custom.js": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 自定义 JS（同源文件下发以兼容 CSP；未设置 404） */
        get: operations["getSiteCustomJS"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/users": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 用户列表 */
        get: operations["adminListUsers"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/users/{id}": {
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
        /** 更新用户角色/状态 */
        patch: operations["adminUpdateUser"];
        trace?: never;
    };
    "/api/admin/login-methods": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 登录方式（管理视图） */
        get: operations["adminGetLoginMethods"];
        /**
         * 保存登录方式开关/顺序
         * @description `password` 开关是**强制生效**的（此前只是给前端渲染按钮用的装饰）：关闭后
         *     /account/login、/oauth2/login/accept 拒绝主密码，账号密码注册一并关闭，
         *     前端登录页不再渲染密码表单。未绑定第三方的历史账号仍可用主密码登录（宽限），
         *     直到它们绑定第三方或消失——见 GET /api/admin/auth-policy 的 password_only_users。
         */
        put: operations["adminSetLoginMethods"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/auth-policy": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 认证策略 + 纯密码账号计数
         * @description `password_only_users` 是"还有多少历史纯密码账号"（有主密码、无第三方绑定、
         *     已验证且状态正常）。它只是给管理员做决策的提示：关闭主密码登录后这些账号
         *     仍可登录（宽限），归零即代表主密码登录已自然失效，不需要再翻第二个开关。
         *     计数只在打开面板时算（走 `users_password_only` 部分索引），不进登录热路径——
         *     热路径上的判定是"这个账号自己有没有绑定"，登录时本来就要读用户行。
         */
        get: operations["adminGetAuthPolicy"];
        /**
         * 保存认证策略（强制绑定 / 玩家数上限）
         * @description 主密码开关不在此处：它归 login_methods，一个开关只留一个入口， 避免"面板关了但策略还开着"。请求体里的 password_login 字段会被忽略。
         */
        put: operations["adminSetAuthPolicy"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/announcement": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 公告（管理视图） */
        get: operations["adminGetAnnouncement"];
        /** 设置公告 */
        put: operations["adminSetAnnouncement"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/registration": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 注册与验证策略（关注册/仅邀请/邮箱白名单/验证码范围） */
        get: operations["adminGetRegistration"];
        /** 设置注册与验证策略（唯一来源；旧环境变量已废弃，仅升级时播种） */
        put: operations["adminSetRegistration"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/brand": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 品牌图标配置（管理视图） */
        get: operations["adminGetBrand"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/brand/logo/{variant}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** 上传自定义品牌图标（请求体为原始 PNG 字节，≤1MiB） */
        put: operations["adminSetBrandLogo"];
        post?: never;
        /** 移除自定义品牌图标（回落内置默认图） */
        delete: operations["adminDeleteBrandLogo"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/site": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 站点信息与自定义资产（管理视图） */
        get: operations["adminGetSite"];
        /** 设置站点信息与自定义 CSS/JS */
        put: operations["adminSetSite"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/invite-codes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 生成邀请码（1–100 个） */
        post: operations["adminGenerateInviteCodes"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/skinlib/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** 删除皮肤库条目（审核） */
        delete: operations["adminDeleteSkinlibItem"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/comments/{cid}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** 删除皮肤库评论（审核） */
        delete: operations["adminDeleteComment"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/audit": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 管理操作审计日志（时间倒序） */
        get: operations["adminListAudit"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/reports": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 举报皮肤条目或评论（登录用户；同一目标仅一次） */
        post: operations["createReport"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/reports": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 举报列表（pending 优先；status 过滤 pending|dismissed|acted，空=全部） */
        get: operations["adminListReports"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/reports/{id}/resolve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 标记举报处理结果（删除目标内容复用 skinlib/comments DELETE 端点） */
        post: operations["adminResolveReport"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/skins": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 管理端皮肤列表（status 过滤 listed|under_review|unlisted，空=全部） */
        get: operations["adminListSkins"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/skins/{id}/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 设置皮肤条目状态（批准上架/下架/退回审核） */
        post: operations["adminSetSkinStatus"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/oauth-clients": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * 列出 OIDC 客户端
         * @description 返回存储态客户端，含 `secret_hash`（sha256 hex，非明文）与 `first_party` 标记。
         *     读取者即能创建/轮换客户端的管理员，故不构成额外提权；但客户端密钥应使用高熵随机值，
         *     以免哈希被离线爆破。
         */
        get: operations["adminListOAuthClients"];
        put?: never;
        /**
         * 新建或更新 OIDC 客户端（按 id upsert，整个对象覆盖）
         * @description 按 `id` upsert：命中则**整条替换**，故更新时必须带上不想丢失的字段
         *     （包括 `secret_hash`；省略即视为清空/转 public）。
         *     `public: true` 时服务端强制清空 `secret_hash`。
         *     `first_party: true` 的客户端授权时跳过前端同意页（用于同部署自有服务，如 Hoard）。
         */
        post: operations["adminSaveOAuthClient"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/oauth-clients/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** 删除 OIDC 客户端 */
        delete: operations["adminDeleteOAuthClient"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/batch-import": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 批量导入用户（随机密码，需管理员 token） */
        post: operations["adminBatchImport"];
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
        RegisterRequest: {
            /** Format: email */
            email: string;
            password: string;
            nickname?: string;
            playerName: string;
            captchaToken?: string;
            inviteCode?: string;
        };
        LoginRequest: {
            /** Format: email */
            email: string;
            password: string;
            /** @description login scope 启用时必填；其余场景忽略 */
            captchaToken?: string;
        };
        SkinLibItem: {
            id: string;
            owner_user_id: string;
            player_name: string;
            texture_key: string;
            description: string;
            /** @enum {string} */
            model: "default" | "slim";
            likes: number;
            /** @enum {string} */
            status: "listed" | "under_review" | "unlisted";
            /** @description RFC3339 时间戳 */
            created_at: string;
        };
        Report: {
            id: string;
            reporter_user_id: string;
            reporter_name: string;
            /** @enum {string} */
            target_type: "skin" | "comment";
            target_id: string;
            reason: string;
            /** @enum {string} */
            status: "pending" | "dismissed" | "acted";
            reviewed_by: string;
            /** @description RFC3339 时间戳 */
            created_at: string;
            /** @description RFC3339 时间戳（未处理时缺省） */
            reviewed_at?: string;
        };
        SkinLibPage: {
            items: components["schemas"]["SkinLibItem"][];
            /** Format: int64 */
            total: number;
            offset: number;
            limit: number;
        };
        SkinComment: {
            id: string;
            item_id: string;
            user_id: string;
            author_name: string;
            content: string;
            /** @description RFC3339 时间戳 */
            created_at: string;
        };
        AuditEntry: {
            id: string;
            /** @description "token" 或 "user:<id>" */
            actor: string;
            actor_ip: string;
            action: string;
            target: string;
            detail: string;
            /** @description RFC3339 时间戳 */
            created_at: string;
        };
        AdminUser: {
            id: string;
            email: string;
            nickname: string;
            /** @enum {string} */
            role: "user" | "admin";
            /** @enum {string} */
            status: "active" | "banned" | "suspended";
            verified: boolean;
            created_at: string;
            player_names: string[];
        };
        RegisterRequirements: {
            registrationDisabled: boolean;
            inviteOnly: boolean;
            /** @description turnstile | recaptcha | hcaptcha | cap | 空串（不启用） */
            captcha: string;
            captchaSiteKey: string;
            /** @description cap driver 的 Standalone 实例公网地址（前端加载控件用）；其余 driver 为空串 */
            captchaCapUrl: string;
            /** @description 验证码保护范围（register | login）；前端据此决定注册/登录页是否渲染控件。验证码未生效时为空数组 */
            captchaScopes: string[];
            /** @description 密码最小长度（与后端 account.MinPasswordLength 同源） */
            minPasswordLength: number;
            /** @description 允许的邮箱域名；空数组表示不限制 */
            emailDomains: string[];
        };
        OAuthClient: {
            id: string;
            name: string;
            /** @description 客户端密钥的 sha256 hex；public 客户端为空。服务端不存也不回传明文 */
            secret_hash?: string;
            redirect_uris: string[];
            grant_types: string[];
            scopes: string[];
            public: boolean;
            /** @description 同部署第一方服务（如 Hoard）；授权时免前端同意页 */
            first_party?: boolean;
        };
        LoginMethod: {
            id: string;
            /** @enum {string} */
            type: "password" | "oauth";
            label: string;
            enabled: boolean;
            order: number;
        };
        /** @description web 登录（主密码）的结果。网站会话不代表任何玩家，故没有 profile 段； 前端要显示/操作哪个玩家，从 GET /account/players 里选。 */
        LoginSession: {
            /** @description 网站会话令牌；由 BFF 写入 httpOnly cookie，不回浏览器脚本。 */
            accessToken: string;
            clientToken: string;
        };
        /** @description 一条启动器独立密码的元数据。哈希与明文永不出现在任何响应里。 */
        PlayerCredential: {
            id: string;
            /** @description 区分多条凭证的标签（如"台式机"），不参与认证 */
            name: string;
            /** Format: date-time */
            created_at: string;
            /**
             * Format: date-time
             * @description 最近一次用它登录启动器的时间；从未使用则省略
             */
            last_used_at?: string;
        };
        Identity: {
            /** @description 第三方来源，如 github */
            provider: string;
            /** @description provider 侧的唯一标识 */
            subject: string;
            email?: string;
            /** Format: date-time */
            created_at: string;
        };
        BindingState: {
            identities: components["schemas"]["Identity"][];
            /** @description 站点是否强制绑定第三方；为 true 且 identities 为空时功能受限 */
            required: boolean;
        };
        /** @description 管理员可调的认证策略。主密码开关不在这里——它归 login_methods 的 `password` 项， 一个开关只留一个入口。 */
        AuthPolicy: {
            /** @description 为 true 时未绑定第三方的账号不能用皮肤/皮肤库/启动器登录/SSO */
            require_third_party_binding?: boolean;
            /**
             * @description 单账号可创建的玩家数上限（存量超额账号不回收，只是不能再加）
             * @default 1
             */
            max_players: number;
        };
        AuthPolicyView: components["schemas"]["AuthPolicy"] & {
            /** @description 还有多少历史纯密码账号（有主密码、无第三方绑定、已验证且状态正常）。 关闭主密码登录后它们仍可登录（宽限），归零即代表主密码登录已自然失效。 只服务管理面板的决策提示，不在登录热路径上计算。 */
            password_only_users: number;
        };
        Announcement: {
            title: string;
            body: string;
            enabled: boolean;
        };
        BrandConfig: {
            /** @description 浅色图标是否被自定义 */
            light: boolean;
            /** @description 深色图标是否被自定义 */
            dark: boolean;
            /** @description 变更版本号，前端用作缓存击穿查询串 */
            version: number;
        };
        SiteInfo: {
            name: string;
            description: string;
            copyright: string;
            /** @description 备案展示文本（中国部署） */
            icp: string;
        };
        SiteAssets: {
            customCss: string;
            customJs: string;
        };
        SitePublic: {
            name: string;
            description: string;
            copyright: string;
            icp: string;
            customCss: boolean;
            customJs: boolean;
        };
        SiteAdmin: {
            info: components["schemas"]["SiteInfo"];
            assets: components["schemas"]["SiteAssets"];
        };
        RegistrationPolicy: {
            disableRegistration: boolean;
            inviteOnly: boolean;
            /** @description 允许的邮箱域名；空数组=不限制 */
            emailDomainWhitelist: string[];
            /** @description 验证码保护范围（register | login）；空数组=不保护 */
            captchaScopes: string[];
        };
        Meta: {
            meta?: {
                serverName?: string;
                implementationName?: string;
                implementationVersion?: string;
            };
            skinDomains?: string[];
            /** @description base64 编码的 PEM 公钥 */
            signaturePublickey?: string;
        };
        AuthenticateRequest: {
            /** @description **玩家名**（不是邮箱）。启动器登录按玩家名定位玩家。 */
            username: string;
            /** @description 该玩家的**启动器独立密码**（见 /account/players/{name}/credentials）；网站主密码在此无效。 */
            password: string;
            clientToken?: string;
            /** @default false */
            requestUser: boolean;
            agent?: {
                /** @default Minecraft */
                name: string;
                version?: number;
            };
        };
        Profile: {
            id: string;
            name: string;
            properties?: components["schemas"]["Property"][];
        };
        Property: {
            name: string;
            /** @description base64 编码的 textures JSON */
            value: string;
            /** @description base64 编码的 RSA 签名 */
            signature?: string;
        };
        /** @description textures 属性的解码结构 */
        Textures: {
            /** Format: int64 */
            timestamp?: number;
            profileId?: string;
            profileName?: string;
            textures?: {
                SKIN?: {
                    url?: string;
                    metadata?: {
                        /** @enum {string} */
                        model?: "slim" | "default";
                    };
                };
                CAPE?: {
                    url?: string;
                };
            };
        };
        Player: {
            id?: string;
            name?: string;
            legacy?: boolean;
            demo?: boolean;
            /** @description 是否已绑定微软正版（绑定后不可本地改名） */
            premium?: boolean;
        };
        AuthenticateResponse: {
            accessToken: string;
            clientToken: string;
            availableProfiles: components["schemas"]["Player"][];
            selectedProfile?: components["schemas"]["Player"];
            user?: {
                id?: string;
                properties?: components["schemas"]["Property"][];
            };
        };
        RefreshRequest: {
            accessToken: string;
            clientToken: string;
            selectedProfile?: {
                id?: string;
                name?: string;
            };
        };
        RefreshResponse: {
            accessToken?: string;
            clientToken?: string;
            selectedProfile?: components["schemas"]["Player"];
            user?: {
                id?: string;
            };
        };
        ValidateRequest: {
            accessToken?: string;
            clientToken?: string;
        };
        InvalidateRequest: {
            accessToken: string;
            clientToken: string;
        };
        SignoutRequest: {
            /** @description **玩家名**（不是邮箱） */
            username: string;
            /** @description 该玩家的启动器独立密码；主密码在此无效 */
            password: string;
        };
        JoinRequest: {
            accessToken: string;
            selectedProfile: string;
            serverId: string;
        };
        Error: {
            /** @example ForbiddenOperationException */
            error: string;
            errorMessage?: string;
            cause?: string;
        };
    };
    responses: {
        /** @description 通用错误响应 */
        Error: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Error"];
            };
        };
    };
    parameters: {
        ID: string;
        /** @description 玩家名（当前账号名下） */
        PlayerName: string;
    };
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    getMeta: {
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
                    "application/json": components["schemas"]["Meta"];
                };
            };
        };
    };
    authenticate: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AuthenticateRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthenticateResponse"];
                };
            };
            403: components["responses"]["Error"];
        };
    };
    refresh: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RefreshRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RefreshResponse"];
                };
            };
            403: components["responses"]["Error"];
        };
    };
    validate: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ValidateRequest"];
            };
        };
        responses: {
            /** @description 令牌有效 */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            403: components["responses"]["Error"];
        };
    };
    invalidate: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["InvalidateRequest"];
            };
        };
        responses: {
            /** @description OK */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            403: components["responses"]["Error"];
        };
    };
    signout: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SignoutRequest"];
            };
        };
        responses: {
            /** @description OK */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    join: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["JoinRequest"];
            };
        };
        responses: {
            /** @description OK */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            403: components["responses"]["Error"];
        };
    };
    hasJoined: {
        parameters: {
            query: {
                username: string;
                serverId: string;
                ip?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 已加入，返回带签名的 profile */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Profile"];
                };
            };
            /** @description 尚未加入 */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getProfile: {
        parameters: {
            query?: {
                unsigned?: boolean;
            };
            header?: never;
            path: {
                uuid: string;
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
                    "application/json": components["schemas"]["Profile"];
                };
            };
            /** @description 无此 profile */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    queryProfiles: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": string[];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Player"][];
                };
            };
        };
    };
    getSkin: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                name: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 皮肤 PNG */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "image/png": string;
                };
            };
            404: components["responses"]["Error"];
        };
    };
    uploadSkin: {
        parameters: {
            query?: {
                model?: "default" | "slim";
            };
            header?: never;
            path: {
                name: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "image/png": string;
            };
        };
        responses: {
            /** @description 已保存 */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["Error"];
            /** @description 超出存储配额（QuotaExceededException） */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getCape: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                name: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 披风 PNG */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "image/png": string;
                };
            };
            404: components["responses"]["Error"];
        };
    };
    uploadCape: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                name: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "image/png": string;
            };
        };
        responses: {
            /** @description 已保存 */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["Error"];
        };
    };
    getTexture: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                key: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description PNG */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "image/png": string;
                };
            };
            404: components["responses"]["Error"];
        };
    };
    getAvatar: {
        parameters: {
            query?: {
                /** @description 头像边长（像素） */
                size?: number;
            };
            header?: never;
            path: {
                uuid: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 头像 PNG */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "image/png": string;
                };
            };
            404: components["responses"]["Error"];
        };
    };
    getAvatarByName: {
        parameters: {
            query?: {
                size?: number;
            };
            header?: never;
            path: {
                name: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 头像 PNG */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "image/png": string;
                };
            };
            404: components["responses"]["Error"];
        };
    };
    getHeadRender: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                uuid: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description PNG */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "image/png": string;
                };
            };
            404: components["responses"]["Error"];
        };
    };
    getBodyRender: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                uuid: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description PNG */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "image/png": string;
                };
            };
            404: components["responses"]["Error"];
        };
    };
    getUSM: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                uuid: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description PNG */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "image/png": string;
                };
            };
            404: components["responses"]["Error"];
        };
    };
    getLegacySkin: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                name: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 皮肤 PNG */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "image/png": string;
                };
            };
            404: components["responses"]["Error"];
        };
    };
    getLegacyCape: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                name: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 披风 PNG */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "image/png": string;
                };
            };
            404: components["responses"]["Error"];
        };
    };
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
    register: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RegisterRequest"];
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
            400: components["responses"]["Error"];
            403: components["responses"]["Error"];
            409: components["responses"]["Error"];
        };
    };
    accountLogin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LoginSession"];
                };
            };
            400: components["responses"]["Error"];
            403: components["responses"]["Error"];
            503: components["responses"]["Error"];
        };
    };
    verifyEmail: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    token: string;
                };
            };
        };
        responses: {
            /** @description 已验证 */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: components["responses"]["Error"];
        };
    };
    forgotPassword: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    email: string;
                };
            };
        };
        responses: {
            /** @description OK */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    resetPassword: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    token: string;
                    password: string;
                };
            };
        };
        responses: {
            /** @description OK */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: components["responses"]["Error"];
        };
    };
    listPlayers: {
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
                    "application/json": components["schemas"]["Player"][];
                };
            };
            401: components["responses"]["Error"];
        };
    };
    addPlayer: {
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
                    "application/json": components["schemas"]["Player"];
                };
            };
            401: components["responses"]["Error"];
            409: components["responses"]["Error"];
        };
    };
    deletePlayer: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 玩家名（当前账号名下） */
                name: components["parameters"]["PlayerName"];
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
            401: components["responses"]["Error"];
            404: components["responses"]["Error"];
            /** @description 不能删除账号下唯一的玩家 */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    renamePlayer: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 玩家名（当前账号名下） */
                name: components["parameters"]["PlayerName"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @description 新名字 */
                    name: string;
                };
            };
        };
        responses: {
            /** @description 已改名 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Player"];
                };
            };
            400: components["responses"]["Error"];
            401: components["responses"]["Error"];
            404: components["responses"]["Error"];
            /** @description 新名字已被占用，或该玩家已绑定正版 */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listPlayerCredentials: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 玩家名（当前账号名下） */
                name: components["parameters"]["PlayerName"];
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
                    "application/json": {
                        credentials: components["schemas"]["PlayerCredential"][];
                    };
                };
            };
            401: components["responses"]["Error"];
            404: components["responses"]["Error"];
        };
    };
    createPlayerCredential: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 玩家名（当前账号名下） */
                name: components["parameters"]["PlayerName"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @description 用于在列表里区分多条凭证的标签（如"台式机"），不参与认证 */
                    name: string;
                    password: string;
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
                    "application/json": components["schemas"]["PlayerCredential"];
                };
            };
            400: components["responses"]["Error"];
            401: components["responses"]["Error"];
            404: components["responses"]["Error"];
            /** @description 条数已达上限 */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    deletePlayerCredential: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 玩家名（当前账号名下） */
                name: components["parameters"]["PlayerName"];
                credentialId: string;
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
            401: components["responses"]["Error"];
            404: components["responses"]["Error"];
        };
    };
    listIdentities: {
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
                    "application/json": components["schemas"]["BindingState"];
                };
            };
            401: components["responses"]["Error"];
        };
    };
    unbindPremium: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 玩家名（当前账号名下） */
                name: components["parameters"]["PlayerName"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 已解绑（或本就未绑定） */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["Error"];
            404: components["responses"]["Error"];
        };
    };
    oauthAuth: {
        parameters: {
            query?: {
                /** @description 登录完成后的前端回跳 URL */
                state?: string;
            };
            header?: never;
            path: {
                provider: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 跳转到授权页 */
            302: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            404: components["responses"]["Error"];
        };
    };
    oauthCallback: {
        parameters: {
            query: {
                code: string;
                state?: string;
            };
            header?: never;
            path: {
                provider: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 无回跳 URL 时直接返回 token */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        accessToken?: string;
                    };
                };
            };
            /** @description 回跳前端（`?oauth_code=<一次性码>`，失败时 `?oauth=error`） */
            302: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    exchangeOAuthCode: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    code: string;
                };
            };
        };
        responses: {
            /** @description 兑换成功 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @description 网站会话令牌。会话不代表任何玩家，故不返回 profile/玩家字段。 */
                        accessToken: string;
                    };
                };
            };
            400: components["responses"]["Error"];
            /** @description 换取码无效、已过期或已被消费 */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    mojangOauthAuth: {
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
                    "application/json": {
                        url?: string;
                    };
                };
            };
            401: components["responses"]["Error"];
        };
    };
    mojangOauthCallback: {
        parameters: {
            query: {
                state: string;
                code: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 已绑定 */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: components["responses"]["Error"];
        };
    };
    mojangVerify: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["Error"];
        };
    };
    listSkinlib: {
        parameters: {
            query?: {
                /** @description 关键词（匹配玩家名/描述） */
                q?: string;
                sort?: "newest" | "likes";
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
                    "application/json": components["schemas"]["SkinLibPage"];
                };
            };
        };
    };
    publishSkin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    playerName: string;
                    description?: string;
                };
            };
        };
        responses: {
            /** @description 已发布 */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SkinLibItem"];
                };
            };
            401: components["responses"]["Error"];
            /** @description 玩家或皮肤不存在 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description 超出发布数量配额 */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getSkinlibItem: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["ID"];
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
                    "application/json": components["schemas"]["SkinLibItem"];
                };
            };
            404: components["responses"]["Error"];
        };
    };
    listSkinComments: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["ID"];
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
                    "application/json": components["schemas"]["SkinComment"][];
                };
            };
            404: components["responses"]["Error"];
        };
    };
    applySkin: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["ID"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    playerName: string;
                };
            };
        };
        responses: {
            /** @description 已应用 */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["Error"];
            404: components["responses"]["Error"];
        };
    };
    likeSkin: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["ID"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            404: components["responses"]["Error"];
        };
    };
    commentSkin: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["ID"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    content: string;
                };
            };
        };
        responses: {
            /** @description OK */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["Error"];
        };
    };
    registerRequirements: {
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
                    "application/json": components["schemas"]["RegisterRequirements"];
                };
            };
        };
    };
    getLoginMethods: {
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
                    "application/json": {
                        methods?: components["schemas"]["LoginMethod"][];
                    };
                };
            };
        };
    };
    getAnnouncement: {
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
                    "application/json": components["schemas"]["Announcement"];
                };
            };
        };
    };
    getBrand: {
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
                    "application/json": components["schemas"]["BrandConfig"];
                };
            };
        };
    };
    getBrandLogo: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                variant: "light" | "dark";
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description PNG 字节 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "image/png": string;
                };
            };
            404: components["responses"]["Error"];
        };
    };
    getSite: {
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
                    "application/json": components["schemas"]["SitePublic"];
                };
            };
        };
    };
    getSiteCustomCSS: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description CSS 文本 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/css": string;
                };
            };
            404: components["responses"]["Error"];
        };
    };
    getSiteCustomJS: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description JS 文本 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/javascript": string;
                };
            };
            404: components["responses"]["Error"];
        };
    };
    adminListUsers: {
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
                    "application/json": {
                        users?: components["schemas"]["AdminUser"][];
                        /** Format: int64 */
                        total?: number;
                    };
                };
            };
            403: components["responses"]["Error"];
        };
    };
    adminUpdateUser: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["ID"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @enum {string} */
                    role?: "user" | "admin";
                    /** @enum {string} */
                    status?: "active" | "banned" | "suspended";
                };
            };
        };
        responses: {
            /** @description OK */
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
    adminGetLoginMethods: {
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
                    "application/json": {
                        methods?: components["schemas"]["LoginMethod"][];
                    };
                };
            };
            403: components["responses"]["Error"];
        };
    };
    adminSetLoginMethods: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    methods: components["schemas"]["LoginMethod"][];
                };
            };
        };
        responses: {
            /** @description OK */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            403: components["responses"]["Error"];
        };
    };
    adminGetAuthPolicy: {
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
                    "application/json": components["schemas"]["AuthPolicyView"];
                };
            };
            403: components["responses"]["Error"];
        };
    };
    adminSetAuthPolicy: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AuthPolicy"];
            };
        };
        responses: {
            /** @description OK */
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
    adminGetAnnouncement: {
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
                    "application/json": components["schemas"]["Announcement"];
                };
            };
            403: components["responses"]["Error"];
        };
    };
    adminSetAnnouncement: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["Announcement"];
            };
        };
        responses: {
            /** @description OK */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            403: components["responses"]["Error"];
        };
    };
    adminGetRegistration: {
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
                    "application/json": components["schemas"]["RegistrationPolicy"];
                };
            };
            403: components["responses"]["Error"];
        };
    };
    adminSetRegistration: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RegistrationPolicy"];
            };
        };
        responses: {
            /** @description OK */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            403: components["responses"]["Error"];
        };
    };
    adminGetBrand: {
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
                    "application/json": components["schemas"]["BrandConfig"];
                };
            };
            403: components["responses"]["Error"];
        };
    };
    adminSetBrandLogo: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                variant: "light" | "dark";
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "image/png": string;
            };
        };
        responses: {
            /** @description OK */
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
    adminDeleteBrandLogo: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                variant: "light" | "dark";
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            403: components["responses"]["Error"];
        };
    };
    adminGetSite: {
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
                    "application/json": components["schemas"]["SiteAdmin"];
                };
            };
            403: components["responses"]["Error"];
        };
    };
    adminSetSite: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SiteAdmin"];
            };
        };
        responses: {
            /** @description OK */
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
    adminGenerateInviteCodes: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    count: number;
                };
            };
        };
        responses: {
            /** @description OK */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        codes?: string[];
                    };
                };
            };
            400: components["responses"]["Error"];
            403: components["responses"]["Error"];
        };
    };
    adminDeleteSkinlibItem: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["ID"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            403: components["responses"]["Error"];
        };
    };
    adminDeleteComment: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                cid: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            403: components["responses"]["Error"];
        };
    };
    adminListAudit: {
        parameters: {
            query?: {
                /** @description 按 action/actor/target 模糊过滤 */
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
                    "application/json": {
                        entries: components["schemas"]["AuditEntry"][];
                        /** Format: int64 */
                        total: number;
                    };
                };
            };
            403: components["responses"]["Error"];
        };
    };
    createReport: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @enum {string} */
                    targetType: "skin" | "comment";
                    targetID: string;
                    reason?: string;
                };
            };
        };
        responses: {
            /** @description 已受理 */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: components["responses"]["Error"];
            401: components["responses"]["Error"];
            /** @description 目标不存在 */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description 重复举报 */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    adminListReports: {
        parameters: {
            query?: {
                status?: string;
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
                    "application/json": {
                        reports: components["schemas"]["Report"][];
                        /** Format: int64 */
                        total: number;
                    };
                };
            };
            403: components["responses"]["Error"];
        };
    };
    adminResolveReport: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["ID"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @enum {string} */
                    status: "dismissed" | "acted";
                };
            };
        };
        responses: {
            /** @description 已处理 */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: components["responses"]["Error"];
            403: components["responses"]["Error"];
            404: components["responses"]["Error"];
        };
    };
    adminListSkins: {
        parameters: {
            query?: {
                status?: string;
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
                    "application/json": {
                        items: components["schemas"]["SkinLibItem"][];
                        /** Format: int64 */
                        total: number;
                    };
                };
            };
            403: components["responses"]["Error"];
        };
    };
    adminSetSkinStatus: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["ID"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @enum {string} */
                    status: "listed" | "unlisted" | "under_review";
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
            404: components["responses"]["Error"];
        };
    };
    adminListOAuthClients: {
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
                    "application/json": components["schemas"]["OAuthClient"][];
                };
            };
            403: components["responses"]["Error"];
        };
    };
    adminSaveOAuthClient: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["OAuthClient"];
            };
        };
        responses: {
            /** @description 已保存（回显存储态） */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OAuthClient"];
                };
            };
            400: components["responses"]["Error"];
            403: components["responses"]["Error"];
        };
    };
    adminDeleteOAuthClient: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: components["parameters"]["ID"];
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
        };
    };
    adminBatchImport: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    users: {
                        email?: string;
                        nickname?: string;
                        playerName?: string;
                    }[];
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        imported?: number;
                    };
                };
            };
            403: components["responses"]["Error"];
        };
    };
}
