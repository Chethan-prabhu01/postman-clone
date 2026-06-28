import json
from app.database import SessionLocal
from app.models import Collection, Folder, SavedRequest, Environment, EnvironmentVariable, RequestHistory


def seed_database():
    db = SessionLocal()
    try:
        # Only seed if empty
        if db.query(Collection).count() > 0:
            return

        # ── Environments ────────────────────────────────────────────────────────
        prod_env = Environment(name="Production", is_active=False)
        dev_env = Environment(name="Development", is_active=True)
        db.add_all([prod_env, dev_env])
        db.flush()

        dev_vars = [
            EnvironmentVariable(environment_id=dev_env.id, key="base_url", value="https://jsonplaceholder.typicode.com", enabled=True),
            EnvironmentVariable(environment_id=dev_env.id, key="user_id", value="1", enabled=True),
            EnvironmentVariable(environment_id=dev_env.id, key="api_token", value="dev-token-abc123", enabled=True, is_secret=True),
        ]
        prod_vars = [
            EnvironmentVariable(environment_id=prod_env.id, key="base_url", value="https://api.example.com", enabled=True),
            EnvironmentVariable(environment_id=prod_env.id, key="api_token", value="prod-token-xyz789", enabled=True, is_secret=True),
        ]
        db.add_all(dev_vars + prod_vars)
        db.flush()

        # ── Collections ─────────────────────────────────────────────────────────
        json_placeholder_col = Collection(
            name="JSONPlaceholder API",
            description="Sample requests for https://jsonplaceholder.typicode.com",
            color="#FF6C37",
        )
        httpbin_col = Collection(
            name="HTTPBin Tests",
            description="Test endpoints from httpbin.org",
            color="#10B981",
        )
        db.add_all([json_placeholder_col, httpbin_col])
        db.flush()

        # ── Folders ──────────────────────────────────────────────────────────────
        users_folder = Folder(name="Users", collection_id=json_placeholder_col.id)
        posts_folder = Folder(name="Posts", collection_id=json_placeholder_col.id)
        db.add_all([users_folder, posts_folder])
        db.flush()

        # ── Saved Requests ───────────────────────────────────────────────────────
        saved_requests = [
            # JSONPlaceholder - Users
            SavedRequest(
                name="Get All Users",
                method="GET",
                url="{{base_url}}/users",
                headers=json.dumps([{"key": "Accept", "value": "application/json", "enabled": True}]),
                params=json.dumps([]),
                body_type="none",
                auth_type="none",
                auth_data=json.dumps({}),
                collection_id=json_placeholder_col.id,
                folder_id=users_folder.id,
            ),
            SavedRequest(
                name="Get User by ID",
                method="GET",
                url="{{base_url}}/users/{{user_id}}",
                headers=json.dumps([{"key": "Accept", "value": "application/json", "enabled": True}]),
                params=json.dumps([]),
                body_type="none",
                auth_type="none",
                auth_data=json.dumps({}),
                collection_id=json_placeholder_col.id,
                folder_id=users_folder.id,
            ),
            SavedRequest(
                name="Create User",
                method="POST",
                url="{{base_url}}/users",
                headers=json.dumps([
                    {"key": "Content-Type", "value": "application/json", "enabled": True},
                    {"key": "Accept", "value": "application/json", "enabled": True},
                ]),
                params=json.dumps([]),
                body_type="raw",
                body_content=json.dumps({"name": "John Doe", "username": "johndoe", "email": "john@example.com"}, indent=2),
                auth_type="bearer",
                auth_data=json.dumps({"token": "{{api_token}}"}),
                collection_id=json_placeholder_col.id,
                folder_id=users_folder.id,
            ),
            # JSONPlaceholder - Posts
            SavedRequest(
                name="Get All Posts",
                method="GET",
                url="{{base_url}}/posts",
                headers=json.dumps([]),
                params=json.dumps([
                    {"key": "_limit", "value": "10", "enabled": True},
                    {"key": "_page", "value": "1", "enabled": True},
                ]),
                body_type="none",
                auth_type="none",
                auth_data=json.dumps({}),
                collection_id=json_placeholder_col.id,
                folder_id=posts_folder.id,
            ),
            SavedRequest(
                name="Create Post",
                method="POST",
                url="{{base_url}}/posts",
                headers=json.dumps([{"key": "Content-Type", "value": "application/json", "enabled": True}]),
                params=json.dumps([]),
                body_type="raw",
                body_content=json.dumps({"title": "Hello World", "body": "This is a test post.", "userId": 1}, indent=2),
                auth_type="none",
                auth_data=json.dumps({}),
                collection_id=json_placeholder_col.id,
                folder_id=posts_folder.id,
            ),
            SavedRequest(
                name="Update Post",
                method="PUT",
                url="{{base_url}}/posts/1",
                headers=json.dumps([{"key": "Content-Type", "value": "application/json", "enabled": True}]),
                params=json.dumps([]),
                body_type="raw",
                body_content=json.dumps({"id": 1, "title": "Updated Title", "body": "Updated body.", "userId": 1}, indent=2),
                auth_type="none",
                auth_data=json.dumps({}),
                collection_id=json_placeholder_col.id,
                folder_id=posts_folder.id,
            ),
            SavedRequest(
                name="Delete Post",
                method="DELETE",
                url="{{base_url}}/posts/1",
                headers=json.dumps([]),
                params=json.dumps([]),
                body_type="none",
                auth_type="none",
                auth_data=json.dumps({}),
                collection_id=json_placeholder_col.id,
                folder_id=posts_folder.id,
            ),
            # HTTPBin
            SavedRequest(
                name="Test GET",
                method="GET",
                url="https://httpbin.org/get",
                headers=json.dumps([{"key": "X-Custom-Header", "value": "postman-clone", "enabled": True}]),
                params=json.dumps([{"key": "test", "value": "true", "enabled": True}]),
                body_type="none",
                auth_type="none",
                auth_data=json.dumps({}),
                collection_id=httpbin_col.id,
            ),
            SavedRequest(
                name="Test POST JSON",
                method="POST",
                url="https://httpbin.org/post",
                headers=json.dumps([{"key": "Content-Type", "value": "application/json", "enabled": True}]),
                params=json.dumps([]),
                body_type="raw",
                body_content=json.dumps({"hello": "world", "foo": "bar"}, indent=2),
                auth_type="none",
                auth_data=json.dumps({}),
                collection_id=httpbin_col.id,
            ),
            SavedRequest(
                name="Test Bearer Auth",
                method="GET",
                url="https://httpbin.org/bearer",
                headers=json.dumps([]),
                params=json.dumps([]),
                body_type="none",
                auth_type="bearer",
                auth_data=json.dumps({"token": "my-secret-token"}),
                collection_id=httpbin_col.id,
            ),
            SavedRequest(
                name="Test Basic Auth",
                method="GET",
                url="https://httpbin.org/basic-auth/user/pass",
                headers=json.dumps([]),
                params=json.dumps([]),
                body_type="none",
                auth_type="basic",
                auth_data=json.dumps({"username": "user", "password": "pass"}),
                collection_id=httpbin_col.id,
            ),
        ]
        db.add_all(saved_requests)

        # ── History ──────────────────────────────────────────────────────────────
        history_entries = [
            RequestHistory(
                method="GET",
                url="https://jsonplaceholder.typicode.com/users",
                headers=json.dumps([]),
                params=json.dumps([]),
                body_type="none",
                auth_type="none",
                auth_data=json.dumps({}),
                response_status=200,
                response_time=142.5,
                response_size=5645,
                response_headers=json.dumps({"content-type": "application/json; charset=utf-8"}),
                response_body="[...]",
            ),
            RequestHistory(
                method="POST",
                url="https://jsonplaceholder.typicode.com/posts",
                headers=json.dumps([{"key": "Content-Type", "value": "application/json", "enabled": True}]),
                params=json.dumps([]),
                body_type="raw",
                body_content='{"title": "Test", "body": "Hello", "userId": 1}',
                auth_type="none",
                auth_data=json.dumps({}),
                response_status=201,
                response_time=88.3,
                response_size=65,
                response_headers=json.dumps({"content-type": "application/json; charset=utf-8"}),
                response_body='{"title": "Test", "body": "Hello", "userId": 1, "id": 101}',
            ),
            RequestHistory(
                method="GET",
                url="https://httpbin.org/get",
                headers=json.dumps([]),
                params=json.dumps([]),
                body_type="none",
                auth_type="none",
                auth_data=json.dumps({}),
                response_status=200,
                response_time=312.0,
                response_size=420,
                response_headers=json.dumps({"content-type": "application/json"}),
                response_body='{"args": {}, "headers": {}}',
            ),
        ]
        db.add_all(history_entries)
        db.commit()
        print("✅ Database seeded successfully")

    except Exception as e:
        db.rollback()
        print(f"❌ Seed failed: {e}")
    finally:
        db.close()
