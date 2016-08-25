CREATE TABLE [dbo].[AuthCode](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[code] [varchar](100) NOT NULL,
	[grant_time] [datetime] NOT NULL,
	[expiration] [datetime] NOT NULL,
	[UserId] [varchar](100) NOT NULL,
	[client_id] [varchar](250) NOT NULL,
 CONSTRAINT [PK_AuthCode] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

CREATE UNIQUE INDEX [IX_AuthCode] ON [dbo].[AuthCode] ([code], [client_id])

GO

CREATE TABLE [dbo].[AuthConnectedApp](
	[client_id] [varchar](250) NOT NULL,
	[enabled] [bit] NULL,
	[name] [varchar](250) NOT NULL,
	[client_secret] [varchar](100) NOT NULL,
	[redirect_uri] [varchar](max) NOT NULL,
	[instance_url] [varchar](max) NULL,
	[rejectUnauthorized] [bit],
	[allow_reset_pswd] [bit] NOT NULL,
	[allow_create_new_user] [bit] NOT NULL,
	[ad_pswd_verify] [bit] NOT NULL,
	[ad_default_domain] [varchar](100) NULL,
	[ad_server_url] [varchar](max) NULL,
	[ad_domainDn] [varchar](250) NULL,
	[token_expiry_minutes] [int] NULL,
	[auth_code_expiry_minutes] [int] NULL,
	[func_is_user_signed_up_for_app] [varchar](250) NULL,
	[stp_auto_app_sign_up] [varchar](250) NULL,
 CONSTRAINT [PK_AuthConnectedApp] PRIMARY KEY CLUSTERED 
(
	[client_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO

CREATE TABLE [dbo].[AuthToken](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[token_type] [varchar](50) NOT NULL,
	[access_token] [varchar](250) NOT NULL,
	[grant_time] [datetime] NOT NULL,
	[token_expiration] [datetime] NULL,
	[refresh_token] [varchar](250) NULL,
	[UserId] [varchar](100) NOT NULL,
	[client_id] [varchar](250) NULL,
 CONSTRAINT [PK_OAuthToken] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

CREATE INDEX [IX_AuthToken] ON [dbo].[AuthToken] ([client_id], [token_type], [access_token])
GO

CREATE INDEX [IX_AuthToken_1] ON [dbo].[AuthToken] ([client_id], [refresh_token])
GO

CREATE TABLE [dbo].[AuthUser](
	[Id] [varchar](100) NOT NULL,
	[IsActive] [bit] NOT NULL,
	[username] [varchar](200) NOT NULL,
	[Email] [varchar](200) NOT NULL,
	[FirstName] [varchar](100) NOT NULL,
	[LastName] [varchar](100) NOT NULL,
	[CompanyName] [varchar](250) NULL,
	[MobilePhone] [varchar](50) NULL,
	[MarketPromotion] [bit] NULL,
	[PasswordExpiration] [datetime] NULL,
	[PasswordHash] [varchar](250) NULL,
	[CreatedDate] [datetime] NOT NULL,
	[CreatedById] [varchar](100) NOT NULL,
	[LastModifiedDate] [datetime] NOT NULL,
	[LastModifiedById] [varchar](100) NOT NULL,
 CONSTRAINT [PK_AuthUser] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

CREATE UNIQUE INDEX [IX_AuthUser] ON [dbo].[AuthUser] ([username])
GO

CREATE VIEW [dbo].[vAuthActiveConnectedApp]
as
select
[client_id]
,[name]
,[client_secret]
,[redirect_uri]
,[instance_url]
,[rejectUnauthorized]
,[allow_reset_pswd]
,[allow_create_new_user]
,[ad_pswd_verify]
,[ad_default_domain]
,[ad_server_url]
,[ad_domainDn]
,[token_expiry_minutes]
,[auth_code_expiry_minutes]
,[func_is_user_signed_up_for_app]
,[stp_auto_app_sign_up]
,[allow_auto_app_sign_up] = cast(iif([stp_auto_app_sign_up] is null, 0, 1) as bit)
from [dbo].[AuthConnectedApp] (nolock)
where
[enabled] = 1

GO

CREATE VIEW [dbo].[vAuthUser]
as
select
[id]=[Id]
,[username]
,[enabled]=[IsActive]
,[email]=[Email]
,[firstName]=[FirstName]
,[lastName]=[LastName]
,[displayName]=rtrim(ltrim(isnull([FirstName],'')+' '+isnull([LastName], '')))
,[companyName]=[CompanyName]
,[mobilePhone]=[MobilePhone]
,[marketPromotion]=[MarketPromotion]
,[passwordIsTemporary]=cast(IIF([PasswordExpiration] is null, 0, 1) as bit)
,[passwordExpired]=cast(IIF([PasswordExpiration] is null, 0 , IIF([PasswordExpiration]>getdate(), 0, 1)) as bit)
,[passwordHash]=[PasswordHash]
,[createdDate]=[CreatedDate]
,[createdById]=[CreatedById]
,[lastModifiedDate]=[LastModifiedDate]
,[lastModifiedById]=[LastModifiedById]
from [dbo].[AuthUser] (nolock)

GO

CREATE VIEW [dbo].[vAuthActiveUser]
as
select
*
from [dbo].[vAuthUser] (nolock)
where [enabled]=1

GO

CREATE PROCEDURE [dbo].[stp_AuthCreateAccess]
	@client_id varchar(250)
	,@UserId varchar(100)
	,@token_type varchar(50)
	,@access_token varchar(250)
	,@refresh_token varchar(250)
AS
BEGIN
	SET NOCOUNT ON;

	declare @id bigint

	insert into [dbo].[AuthToken]
	(
		[token_type]
		,[access_token]
		,[grant_time]
		,[token_expiration]
		,[refresh_token]
		,[UserId]
		,[client_id]
	)
	select
	[token_type]=@token_type
	,[access_token]=@access_token
	,[grant_time]=getdate()
	,[token_expiration]=dateadd(n,[token_expiry_minutes],getdate())
	,[refresh_token]=@refresh_token
	,[UserId]=@UserId
	,[client_id]
	from [dbo].[vAuthActiveConnectedApp]
	where
	[client_id]=@client_id

	set @id=@@IDENTITY

	select
	t.[token_type]
	,t.[access_token]
	,t.[refresh_token]
	,app.[instance_url]
	,app.[rejectUnauthorized]
	from [dbo].[AuthToken] t (nolock)
	inner join [dbo].[vAuthActiveConnectedApp] app
	on t.[client_id]=app.[client_id]
	where t.[id]=@id

END

GO

CREATE PROCEDURE [dbo].[stp_AuthGetConnectedApp]
	@client_id varchar(250)
	,@client_secret varchar(100) = null
	,@redirect_uri varchar(max) = null 
AS
BEGIN
	SET NOCOUNT ON;

	declare @id varchar(100)
	declare @secret varchar(100)
	declare @uri varchar(max)

	select
	@id=[client_id]
	,@secret=[client_secret]
	,@uri=[redirect_uri]
	from [dbo].[vAuthActiveConnectedApp]
	where
	[client_id]=@client_id

	if (@id is null)
	begin
		select error='invalid_client_id', error_description='client identifier invalid'
		return
	end

	if @client_secret is not null and @client_secret <> @secret
	begin
		select error='invalid_client', error_description='invalid client credentials'
		return
	end

	if @redirect_uri is not null and @redirect_uri <> @uri
	begin
		select error='redirect_uri_mismatch', error_description='redirect_uri must match configuration'
		return
	end

	select error=null, error_description=null

	select
	*
	from [dbo].[vAuthActiveConnectedApp]
	where
	[client_id]=@client_id
END

GO

CREATE PROCEDURE [dbo].[stp_AuthLogin]
    @client_id varchar(250)
	,@username varchar(200)
	,@passwordHash varchar(250)
	,@response_type varchar(10)
    ,@signUpUserForApp bit
	,@token_type varchar(50) = null
	,@access_token varchar(250) = null
	,@refresh_token varchar(250) = null
	,@code varchar(100) = null
AS
BEGIN
	SET NOCOUNT ON;

	-- verify user credential
	--=============================================================================================================================
	declare @UserId varchar(100)
	declare @pHash varchar(250)
	declare @passwordIsTemporary bit
	declare @passwordExpired bit

	select
	@UserId=[Id]
	,@pHash=[PasswordHash]
	,@passwordIsTemporary=[passwordIsTemporary]
	,@passwordExpired=[passwordExpired]
	from [dbo].[vAuthActiveUser] (nolock)
	where
	lower([username])=lower(@username)

	if @UserId is null
	begin
		select [error]='invalid_grant', [error_description]='authentication failure'
		return
	end

	if (@passwordHash is not null) -- need to verify password
	begin
		if @passwordIsTemporary = 1 -- a temporary password
		begin
			if @passwordExpired = 1
			begin
				select [error]='password_expired', [error_description]='password expired'
				return
			end
			else
			begin
				if (@pHash is not null and @passwordHash <> @pHash)
				begin
					select [error]='invalid_grant', [error_description]='authentication failure'
					return
				end
			end
		end
		else -- perminant password
		begin
			if (@pHash is not null and @passwordHash <> @pHash)
			begin
				select [error]='invalid_grant', [error_description]='authentication failure'
				return
			end
		end
	end
	--=============================================================================================================================

	--********************************************************
	-- user's credential is verified at this point
	-- need to verify user to sign up to the app
	--********************************************************

	--=============================================================================================================================
	declare @userSignedUpForApp int
	exec @userSignedUpForApp = [dbo].[stp_AuthIsUserSignedUpForApp] @userId=@UserId, @client_id=@client_id

	if @userSignedUpForApp = 0 and @signUpUserForApp = 1 -- user not yet signed up for all and request for a login + signup
	begin
		exec @userSignedUpForApp = [dbo].[stp_AuthAutoSignUpUserForApp] @userId=@UserId, @client_id=@client_id
	end

	if @userSignedUpForApp = 0
	begin
		select [error]='not_authorized', [error_description]='not authorized'
		return
	end
	--=============================================================================================================================

	select [error]=null, [error_description]=null

	select
	*
	from [dbo].[vAuthActiveUser]
	where [id]=@UserId

	if @response_type = 'token'
	begin
		exec [dbo].[stp_AuthCreateAccess] @client_id=@client_id, @UserId=@UserId, @token_type=@token_type, @access_token=@access_token, @refresh_token=@refresh_token
		return
	end

	if @response_type = 'code'
	begin
		declare @id bigint
		insert into [dbo].[AuthCode]
		(
			[code]
			,[grant_time]
			,[expiration]
			,[UserId]
			,[client_id]
		)
		select
		[code]=@code
		,[grant_time]=getdate()
		,[expiration]=dateadd(n,[auth_code_expiry_minutes],getdate())
		,[UserId]=@UserId
		,[client_id]
		from [dbo].[vAuthActiveConnectedApp]
		where
		[client_id]=@client_id

		set @id=@@IDENTITY

		select
		[code]
		from [dbo].[AuthCode] (nolock)
		where [id]=@id

		return
	end

END

GO

CREATE PROCEDURE [dbo].[stp_AuthGetAccessFromCode]
	@client_id varchar(250)
	,@code varchar(100)
	,@token_type varchar(50)
	,@access_token varchar(250)
	,@refresh_token varchar(250)
AS
BEGIN
	SET NOCOUNT ON;

	declare @UserId varchar(100)

    select
	@UserId=ac.[UserId]
	from [dbo].[AuthCode] ac
	inner join [dbo].[vAuthActiveUser] au
	on ac.[UserId]=au.[id]
	inner join [dbo].[vAuthActiveConnectedApp] app
	on ac.[client_id]=app.[client_id]
	where
	ac.[client_id]=@client_id
	and ac.[code]=@code

	if @UserId is null
	begin
		select error='not_authorized', error_description='not authorized'
		return
	end

	select error=null, error_description=null
	exec [dbo].[stp_AuthCreateAccess] @client_id=@client_id, @UserId=@UserId, @token_type=@token_type, @access_token=@access_token, @refresh_token=@refresh_token

END

GO

CREATE PROCEDURE [dbo].[stp_AuthVerifyAccessToken]
	@client_id varchar(250)
	,@token_type varchar(50)
	,@access_token varchar(250)
AS
BEGIN
	SET NOCOUNT ON;

	declare @UserId varchar(100)
	declare @token_expiration datetime

    select
	@UserId=at.[UserId]
	,@token_expiration=at.[token_expiration]
	from [dbo].[AuthToken] at
	inner join [dbo].[vAuthActiveUser] au
	on at.[UserId]=au.[id]
	inner join [dbo].[vAuthActiveConnectedApp] app
	on at.[client_id]=app.[client_id]
	where
	at.[client_id]=@client_id
	and at.[token_type]=@token_type
	and at.[access_token]=@access_token

	if @UserId is null
	begin
		select error='not_authorized', error_description='not authorized'
		return
	end

	if @token_expiration is not null and getdate() >= @token_expiration
	begin
		select error='invalid_session_id', error_description='session expired or invalid'
		return
	end

	select error=null, error_description=null

	select
	*
	from [dbo].[vAuthActiveUser]
	where [id]=@UserId

END

GO

CREATE PROCEDURE [dbo].[stp_AuthRefreshToken]
	@client_id varchar(250)
	,@refresh_token varchar(250)
	,@new_access_token varchar(250)
	,@new_refresh_token varchar(250)
AS
BEGIN
	SET NOCOUNT ON;

	declare @UserId varchar(100)
	declare @token_type varchar(50)

	select
	@UserId=at.[UserId]
	,@token_type=at.[token_type]
	from [dbo].[AuthToken] at
	inner join [dbo].[vAuthActiveUser] au
	on at.[UserId]=au.[id]
	inner join [dbo].[vAuthActiveConnectedApp] app
	on at.[client_id]=app.[client_id]
	where
	at.[client_id]=@client_id
	and at.[refresh_token]=@refresh_token

	if @UserId is null
	begin
		select error='not_authorized', error_description='not authorized'
		return
	end

	select error=null, error_description=null
	exec [dbo].[stp_AuthCreateAccess] @client_id=@client_id, @UserId=@UserId, @token_type=@token_type, @access_token=@new_access_token, @refresh_token=@new_refresh_token

END

GO

CREATE PROCEDURE [dbo].[stp_AuthAutoSignUpUserForApp]
	@userId varchar(100)
	,@client_id varchar(250)
AS
BEGIN
	SET NOCOUNT ON;

	declare @userSignedUpForApp int

	declare @allow_auto_app_sign_up bit
	declare @stp_auto_app_sign_up varchar(250)
	select
	@allow_auto_app_sign_up=[allow_auto_app_sign_up]
	,@stp_auto_app_sign_up=[stp_auto_app_sign_up]
	from [dbo].[vAuthActiveConnectedApp] (nolock) where [client_id] = @client_id
	if (@allow_auto_app_sign_up is null or @allow_auto_app_sign_up=0) -- auto sign up is NOT allowed for the app
		set @userSignedUpForApp=0
	else -- auto sign up is allowed for the app
	begin
		declare @sql nvarchar(500)
		declare @ParmDefinition nvarchar(500)
		set @ParmDefinition='@id varchar(100)'
		set @sql = 'exec ' + @stp_auto_app_sign_up + ' @userId=@id'
		exec [sys].[sp_executesql] @sql, @ParmDefinition, @id=@userId

		exec @userSignedUpForApp = [dbo].[stp_AuthIsUserSignedUpForApp] @userId = @userId, @client_id=@client_id
	end
	return @userSignedUpForApp
END

GO

CREATE PROCEDURE [dbo].[stp_AuthIsUserSignedUpForApp]
(
	@userId varchar(100)
	,@client_id varchar(250)
)
AS
BEGIN
	SET NOCOUNT ON;

	declare @func_is_user_signed_up_for_app varchar(250)
	select @func_is_user_signed_up_for_app=[func_is_user_signed_up_for_app] from [dbo].[vAuthActiveConnectedApp] (nolock) where [client_id] = @client_id
	if @func_is_user_signed_up_for_app is not null
	begin
		declare @sql nvarchar(500)
		declare @ParmDefinition nvarchar(500)
		set @ParmDefinition='@id varchar(100)'
		set @sql = 'select [signedUp]=' + @func_is_user_signed_up_for_app + '(@id)'
		declare @tmp table
		(
			[signedUp] bit
		)
		insert into @tmp
		exec [sys].[sp_executesql] @sql, @ParmDefinition, @id=@userId
		declare @signedUp bit
		select @signedUp=[signedUp] from @tmp
		return cast(@signedUp as int)
	end
	else
	begin
		RETURN 0
	end
END

GO