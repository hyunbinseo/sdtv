## 0

```sql
select "id", (select json_array("user_id") as "data" from (select * from "profile" "userTable_profile" where "userTable_profile"."user_id" = "userTable"."id" limit ?) "userTable_profile") as "profile", (select coalesce(json_group_array(json_array("role")), json_array()) as "data" from "role" "userTable_roles" where ("userTable_roles"."user_id" = "userTable"."id" and "userTable_roles"."revoked_at" is null)) as "roles" from "user" "userTable" where "userTable"."id" = ? limit ?
```

```
┌─────────┬────┬────────┬─────────┬───────────────────────────────────────────────────────────────────────────────┐
│ (index) │ id │ parent │ notused │ detail                                                                        │
├─────────┼────┼────────┼─────────┼───────────────────────────────────────────────────────────────────────────────┤
│ 0       │ 5  │ 0      │ 39      │ 'SEARCH userTable USING COVERING INDEX sqlite_autoindex_user_1 (id=?)'        │
│ 1       │ 13 │ 0      │ 0       │ 'CORRELATED SCALAR SUBQUERY 2'                                                │
│ 2       │ 16 │ 13     │ 0       │ 'CO-ROUTINE userTable_profile'                                                │
│ 3       │ 22 │ 16     │ 39      │ 'SEARCH userTable_profile USING INDEX sqlite_autoindex_profile_1 (user_id=?)' │
│ 4       │ 36 │ 13     │ 17      │ 'SCAN userTable_profile'                                                      │
│ 5       │ 46 │ 0      │ 0       │ 'CORRELATED SCALAR SUBQUERY 3'                                                │
│ 6       │ 52 │ 46     │ 62      │ 'SEARCH userTable_roles USING INDEX idx_role_user_id (user_id=?)'             │
└─────────┴────┴────────┴─────────┴───────────────────────────────────────────────────────────────────────────────┘
```

## 1

```sql
select "session_id" from "session_ban" "sessionBanTable" where ("sessionBanTable"."session_id" = ? and "sessionBanTable"."banned_at" < 1700000000) limit ?
```

```
┌─────────┬────┬────────┬─────────┬────────────────────────────────────────────────────────────────────────────────────┐
│ (index) │ id │ parent │ notused │ detail                                                                             │
├─────────┼────┼────────┼─────────┼────────────────────────────────────────────────────────────────────────────────────┤
│ 0       │ 6  │ 0      │ 39      │ 'SEARCH sessionBanTable USING INDEX sqlite_autoindex_session_ban_1 (session_id=?)' │
└─────────┴────┴────────┴─────────┴────────────────────────────────────────────────────────────────────────────────────┘
```

## 2

```sql
select "id", 1700000000, '', '' from "session" where ("session"."id" <> ? and "session"."user_id" = ? and "session"."expires_at" > 1700000000)
```

```
┌─────────┬────┬────────┬─────────┬──────────────────────────────────────────────────────────────┐
│ (index) │ id │ parent │ notused │ detail                                                       │
├─────────┼────┼────────┼─────────┼──────────────────────────────────────────────────────────────┤
│ 0       │ 3  │ 0      │ 62      │ 'SEARCH session USING INDEX idx_session_user_id (user_id=?)' │
└─────────┴────┴────────┴─────────┴──────────────────────────────────────────────────────────────┘
```

## 3

```sql
select "id", 1700000000 as "banned_at", '' as "banned_by", '' as "ip" from "session" where ("session"."user_id" in (?) and "session"."expires_at" > 1700000000)
```

```
┌─────────┬────┬────────┬─────────┬──────────────────────────────────────────────────────────────┐
│ (index) │ id │ parent │ notused │ detail                                                       │
├─────────┼────┼────────┼─────────┼──────────────────────────────────────────────────────────────┤
│ 0       │ 3  │ 0      │ 62      │ 'SEARCH session USING INDEX idx_session_user_id (user_id=?)' │
└─────────┴────┴────────┴─────────┴──────────────────────────────────────────────────────────────┘
```

## 4

```sql
select "user"."id", "user"."contact", "profile"."surname", "profile"."given_name", GROUP_CONCAT(DISTINCT "role"."role") from "user" inner join "profile" on "profile"."user_id" = "user"."id" inner join "role" on ("role"."user_id" = "user"."id" and "role"."revoked_at" is null) where ("user"."deactivated_at" is null and "user"."id" <> ?) group by "user"."id"
```

```
┌─────────┬────┬────────┬─────────┬─────────────────────────────────────────────────────────────────────┐
│ (index) │ id │ parent │ notused │ detail                                                              │
├─────────┼────┼────────┼─────────┼─────────────────────────────────────────────────────────────────────┤
│ 0       │ 11 │ 0      │ 224     │ 'SCAN user USING INDEX sqlite_autoindex_user_1'                     │
│ 1       │ 18 │ 0      │ 47      │ 'SEARCH profile USING INDEX sqlite_autoindex_profile_1 (user_id=?)' │
│ 2       │ 26 │ 0      │ 62      │ 'SEARCH role USING INDEX idx_role_user_id (user_id=?)'              │
│ 3       │ 69 │ 0      │ 0       │ 'USE TEMP B-TREE FOR group_concat(DISTINCT)'                        │
└─────────┴────┴────────┴─────────┴─────────────────────────────────────────────────────────────────────┘
```

## 5

```sql
select "user"."id", "user"."contact", "profile"."surname", "profile"."given_name" from "user" inner join "profile" on "profile"."user_id" = "user"."id" left join "role" on "role"."user_id" = "user"."id" where (not exists (select "id", "user_id", "role", "assigned_by", "revoked_at", "revoked_by" from "role" where ("role"."user_id" = "user"."id" and "role"."revoked_at" is null)) and "profile"."given_name" LIKE ? COLLATE NOCASE and "user"."deactivated_at" is null and "user"."id" <> ?) group by "user"."id"
```

```
┌─────────┬────┬────────┬─────────┬───────────────────────────────────────────────────────────────────────────┐
│ (index) │ id │ parent │ notused │ detail                                                                    │
├─────────┼────┼────────┼─────────┼───────────────────────────────────────────────────────────────────────────┤
│ 0       │ 10 │ 0      │ 223     │ 'SCAN user USING INDEX sqlite_autoindex_user_1'                           │
│ 1       │ 18 │ 0      │ 0       │ 'CORRELATED SCALAR SUBQUERY 1'                                            │
│ 2       │ 23 │ 18     │ 62      │ 'SEARCH role USING INDEX idx_role_user_id (user_id=?)'                    │
│ 3       │ 35 │ 0      │ 47      │ 'SEARCH profile USING INDEX sqlite_autoindex_profile_1 (user_id=?)'       │
│ 4       │ 43 │ 0      │ 54      │ 'SEARCH role USING COVERING INDEX idx_role_user_id (user_id=?) LEFT-JOIN' │
└─────────┴────┴────────┴─────────┴───────────────────────────────────────────────────────────────────────────┘
```

## 6

```sql
update "role" set "revoked_at" = 1700000000, "revoked_by" = ? where ("role"."user_id" = ? and "role"."role" = 'admin' and "role"."revoked_at" is null)
```

```
┌─────────┬────┬────────┬─────────┬────────────────────────────────────────────────────────┐
│ (index) │ id │ parent │ notused │ detail                                                 │
├─────────┼────┼────────┼─────────┼────────────────────────────────────────────────────────┤
│ 0       │ 5  │ 0      │ 62      │ 'SEARCH role USING INDEX idx_role_user_id (user_id=?)' │
└─────────┴────┴────────┴─────────┴────────────────────────────────────────────────────────┘
```

## 7

```sql
select "user"."id", "user"."contact", "user"."deactivated_at", "profile"."given_name", "profile"."surname" from "user" left join "profile" on "profile"."user_id" = "user"."id" where ("user"."deactivated_at" is null and "user"."id" <> ?) order by "user"."deactivated_at" desc, "profile"."given_name" ASC NULLS LAST, "profile"."surname" asc
```

```
┌─────────┬────┬────────┬─────────┬───────────────────────────────────────────────────────────────────────────────┐
│ (index) │ id │ parent │ notused │ detail                                                                        │
├─────────┼────┼────────┼─────────┼───────────────────────────────────────────────────────────────────────────────┤
│ 0       │ 5  │ 0      │ 216     │ 'SCAN user'                                                                   │
│ 1       │ 11 │ 0      │ 47      │ 'SEARCH profile USING INDEX sqlite_autoindex_profile_1 (user_id=?) LEFT-JOIN' │
│ 2       │ 37 │ 0      │ 0       │ 'USE TEMP B-TREE FOR LAST 2 TERMS OF ORDER BY'                                │
└─────────┴────┴────────┴─────────┴───────────────────────────────────────────────────────────────────────────────┘
```

## 8

```sql
update "user" set "deactivated_at" = 1700000000, "deactivated_by" = ? where (false and "user"."deactivated_at" is null)
```

```
┌─────────┬────┬────────┬─────────┬─────────────┐
│ (index) │ id │ parent │ notused │ detail      │
├─────────┼────┼────────┼─────────┼─────────────┤
│ 0       │ 5  │ 0      │ 216     │ 'SCAN user' │
└─────────┴────┴────────┴─────────┴─────────────┘
```

## 9

```sql
select "id", "code", (select json_array("contact") as "data" from (select * from "user" "loginTable_user" where "loginTable_user"."id" = "loginTable"."user_id" limit ?) "loginTable_user") as "user" from "login" "loginTable" where ("loginTable"."id" = ? and "loginTable"."code" = ? and "loginTable"."expires_at" > 1700000000 and "loginTable"."expired_at" is null) limit ?
```

```
┌─────────┬────┬────────┬─────────┬─────────────────────────────────────────────────────────────────────┐
│ (index) │ id │ parent │ notused │ detail                                                              │
├─────────┼────┼────────┼─────────┼─────────────────────────────────────────────────────────────────────┤
│ 0       │ 6  │ 0      │ 39      │ 'SEARCH loginTable USING INDEX sqlite_autoindex_login_1 (id=?)'     │
│ 1       │ 22 │ 0      │ 0       │ 'CORRELATED SCALAR SUBQUERY 2'                                      │
│ 2       │ 25 │ 22     │ 0       │ 'CO-ROUTINE loginTable_user'                                        │
│ 3       │ 31 │ 25     │ 39      │ 'SEARCH loginTable_user USING INDEX sqlite_autoindex_user_1 (id=?)' │
│ 4       │ 44 │ 22     │ 17      │ 'SCAN loginTable_user'                                              │
└─────────┴────┴────────┴─────────┴─────────────────────────────────────────────────────────────────────┘
```

## 10

```sql
select "id", (select coalesce(json_group_array(json_array("id")), json_array()) as "data" from "login" "userTable_logins" where ("userTable_logins"."user_id" = "userTable"."id" and ("userTable_logins"."expires_at" > 1700000000 and "userTable_logins"."expired_at" is null))) as "logins" from "user" "userTable" where ("userTable"."contact" = ? and "userTable"."deactivated_at" is null) order by "userTable"."id" desc limit ?
```

```
┌─────────┬────┬────────┬─────────┬─────────────────────────────────────────────────────────────────────┐
│ (index) │ id │ parent │ notused │ detail                                                              │
├─────────┼────┼────────┼─────────┼─────────────────────────────────────────────────────────────────────┤
│ 0       │ 7  │ 0      │ 224     │ 'SCAN userTable USING INDEX sqlite_autoindex_user_1'                │
│ 1       │ 16 │ 0      │ 0       │ 'CORRELATED SCALAR SUBQUERY 1'                                      │
│ 2       │ 22 │ 16     │ 62      │ 'SEARCH userTable_logins USING INDEX idx_login_user_id (user_id=?)' │
└─────────┴────┴────────┴─────────┴─────────────────────────────────────────────────────────────────────┘
```

## 11

```sql
update "login" set "expired_at" = 1700000000 where "login"."id" = ?
```

```
┌─────────┬────┬────────┬─────────┬────────────────────────────────────────────────────────────┐
│ (index) │ id │ parent │ notused │ detail                                                     │
├─────────┼────┼────────┼─────────┼────────────────────────────────────────────────────────────┤
│ 0       │ 5  │ 0      │ 39      │ 'SEARCH login USING INDEX sqlite_autoindex_login_1 (id=?)' │
└─────────┴────┴────────┴─────────┴────────────────────────────────────────────────────────────┘
```

## 12

```sql
update "login" set "expired_at" = 1700000000 where ("login"."id" = ? and "login"."expired_at" is null) returning "id", "user_id", "code", "expires_at"
```

```
┌─────────┬────┬────────┬─────────┬────────────────────────────────────────────────────────────┐
│ (index) │ id │ parent │ notused │ detail                                                     │
├─────────┼────┼────────┼─────────┼────────────────────────────────────────────────────────────┤
│ 0       │ 5  │ 0      │ 39      │ 'SEARCH login USING INDEX sqlite_autoindex_login_1 (id=?)' │
└─────────┴────┴────────┴─────────┴────────────────────────────────────────────────────────────┘
```

## 13

```sql
update "login" set "expired_at" = 1700000000 where ("login"."id" = ? and "login"."expired_at" is null) returning "id", "user_id", "otp", "expires_at"
```

```
┌─────────┬────┬────────┬─────────┬────────────────────────────────────────────────────────────┐
│ (index) │ id │ parent │ notused │ detail                                                     │
├─────────┼────┼────────┼─────────┼────────────────────────────────────────────────────────────┤
│ 0       │ 5  │ 0      │ 39      │ 'SEARCH login USING INDEX sqlite_autoindex_login_1 (id=?)' │
└─────────┴────┴────────┴─────────┴────────────────────────────────────────────────────────────┘
```
