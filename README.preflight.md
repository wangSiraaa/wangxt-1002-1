# Trae Preflight

This folder is prepared for `wangxt-1002-1`.

Use `.env` for stable local ports and compose project identity:

- APP_PORT: 18302
- API_PORT: 19302
- WEB_PORT: 20302
- DB_PORT: 21302
- REDIS_PORT: 22302

Smoke entry:

```bash
bash scripts/smoke.sh
```

The preflight files are environment scaffolding only. The generated business
project can replace or extend them when needed.
