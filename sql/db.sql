USE [UserAuthentication]
GO

/****** Object:  Table [dbo].[AuthAppUser]    Script Date: 7/26/2016 10:01:52 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

SET ANSI_PADDING ON
GO

CREATE TABLE [dbo].[AuthAppUser](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[UserId] [varchar](100) NOT NULL,
	[client_id] [varchar](250) NOT NULL,
	[time] [datetime] NOT NULL,
 CONSTRAINT [PK_AuthAppUser] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

SET ANSI_PADDING OFF
GO

USE [UserAuthentication]
GO

/****** Object:  Table [dbo].[AuthCode]    Script Date: 7/26/2016 10:02:53 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

SET ANSI_PADDING ON
GO

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

SET ANSI_PADDING OFF
GO

USE [UserAuthentication]
GO

/****** Object:  Table [dbo].[AuthConnectedApp]    Script Date: 7/26/2016 10:03:20 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

SET ANSI_PADDING ON
GO

CREATE TABLE [dbo].[AuthConnectedApp](
	[client_id] [varchar](250) NOT NULL,
	[enabled] [bit] NULL,
	[name] [varchar](250) NOT NULL,
	[client_secret] [varchar](100) NOT NULL,
	[redirect_uri] [varchar](max) NOT NULL,
	[instance_url] [varchar](max) NULL,
	[allow_reset_pswd] [bit] NOT NULL,
	[allow_create_new_user] [bit] NOT NULL,
	[ad_pswd_verify] [bit] NOT NULL,
	[ad_default_domain] [varchar](100) NULL,
	[ad_server_url] [varchar](max) NULL,
	[ad_domainDn] [varchar](250) NULL,
	[token_expiry_minutes] [int] NULL,
	[auth_code_expiry_minutes] [int] NULL,
 CONSTRAINT [PK_Auth2ConnectedApp] PRIMARY KEY CLUSTERED 
(
	[client_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO

SET ANSI_PADDING OFF
GO

USE [UserAuthentication]
GO

/****** Object:  Table [dbo].[AuthToken]    Script Date: 7/26/2016 10:03:47 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

SET ANSI_PADDING ON
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

SET ANSI_PADDING OFF
GO

USE [UserAuthentication]
GO

/****** Object:  Table [dbo].[AuthUser]    Script Date: 7/26/2016 10:04:16 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

SET ANSI_PADDING ON
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

SET ANSI_PADDING OFF
GO

USE [UserAuthentication]
GO

/****** Object:  View [dbo].[vAuthActiveConnectedApp]    Script Date: 7/26/2016 10:05:05 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO



CREATE VIEW [dbo].[vAuthActiveConnectedApp]
as
select
[client_id]
,[name]
,[client_secret]
,[redirect_uri]
,[instance_url]
,[allow_reset_pswd]
,[allow_create_new_user]
,[ad_pswd_verify]
,[ad_default_domain]
,[ad_server_url]
,[ad_domainDn]
,[token_expiry_minutes]
,[auth_code_expiry_minutes]
from [dbo].[AuthConnectedApp]
where
[enabled] = 1


GO

USE [UserAuthentication]
GO

/****** Object:  View [dbo].[vAuthActiveUser]    Script Date: 7/26/2016 10:06:02 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE view [dbo].[vAuthActiveUser] as
select
[id]=[Id]
,[username]
,[email]=[Email]
,[firstName]=[FirstName]
,[lastName]=[LastName]
,[displayName]=IIF([FirstName] is null, [LastName], [FirstName]+' '+[LastName])
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
where [IsActive]=1


GO

USE [UserAuthentication]
GO

/****** Object:  StoredProcedure [dbo].[stp_AuthCreateAccess]    Script Date: 7/26/2016 10:06:40 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
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
	from [dbo].[AuthToken] t (nolock)
	inner join [dbo].[vAuthActiveConnectedApp] app
	on t.[client_id]=app.[client_id]
	where t.[id]=@id

END

GO

USE [UserAuthentication]
GO

/****** Object:  StoredProcedure [dbo].[stp_AuthGetConnectedApp]    Script Date: 7/26/2016 10:07:13 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
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

USE [UserAuthentication]
GO

/****** Object:  StoredProcedure [dbo].[stp_AuthLogin]    Script Date: 7/26/2016 10:07:40 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
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

	if not exists (select [client_id] from [dbo].[vAuthActiveConnectedApp] (nolock) where [client_id] = @client_id)
	begin
		select error='invalid_client_id', error_description='client identifier invalid'
		return
	end

	if @signUpUserForApp=1 and not exists(select [id] from [dbo].[AuthAppUser] (nolock) where [UserId]=@UserId and [client_id]=@client_id)
	begin
		insert into [dbo].[AuthAppUser] ([UserId],[client_id],[time]) values (@UserId,@client_id,getdate())
	end 

	if not exists(select [id] from [dbo].[AuthAppUser] (nolock) where [UserId]=@UserId and [client_id]=@client_id)
	begin
		select error='not_authorized', error_description='not authorized'
		return
	end

	select [error]=null, [error_description]=null

	select
	[userId]=[id]
	,[userName]=[username]
	,[displayName]
	,[email]
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