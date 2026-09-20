# Migration: Kamatera → one.com VPS

Goal: stand up the full stack on the new one.com VPS at `dev.livslusths.se`,
verify parity with the live Kamatera site, then cut DNS over to the new host
and decommission Kamatera. No changes to the live `livslusths.se` site until
Phase 6.

- **Current (live) host:** Kamatera, `root@45.248.37.221`, deploy dir
  `/opt/livlust`, deployed via `.github/workflows/deploy.yml` on push to `main`.
- **New host:** one.com VPS `vps-6627.onecom-cloud.one`, `85.190.107.67`,
  Ubuntu 26.04, users `administrator` (password) and `eric` (SSH key, see
  [one_host.md](one_host.md)).
- **DNS:** managed at simply.com (see [simply.com_DNS_API_keys.md](simply.com_DNS_API_keys.md)).

---

## Phase 0 — Urgent: fix a live DNS problem (do this first, today)

A `dig` check just now showed:

| Host | Resolves to |
|---|---|
| `livslusths.se` (apex) | `45.248.37.221` only — OK |
| `www.livslusths.se` | **both** `85.190.107.67` **and** `45.248.37.221` |
| `newsletter.livslusths.se` | **both** `85.190.107.67` **and** `45.248.37.221` |
| `dev.livslusths.se` | `85.190.107.67` only — OK, no live traffic depends on this |

`www` and `newsletter` each have a stray second A record pointing at the new,
not-yet-configured one.com host. DNS resolvers round-robin between the two,
so roughly half of real visitors to `www.livslusths.se` /
`newsletter.livslusths.se` right now may be hitting a server with nothing
listening on 80/443 for that domain (broken/timeout, not just "different
content").

- [x] In simply.com, remove the `85.190.107.67` A record from `www` and
      `newsletter` (or point it back to `45.248.37.221`), leaving only the
      Kamatera IP for both until Phase 6 cutover.
- [x] Leave `dev.livslusths.se → 85.190.107.67` as-is (or the wildcard
      `*.livslusths.se` record, whichever is doing it) — that's correct and
      is what the rest of this plan targets.
- [x] Re-run the `dig` check after the change to confirm `www` and
      `newsletter` return only the Kamatera IP again. Verified 2026-09-20
      against public resolvers (1.1.1.1, 8.8.8.8) and the authoritative
      nameserver (`ns3.simply.com`): `livslusths.se`, `www.livslusths.se`,
      `newsletter.livslusths.se` all → `45.248.37.221` only;
      `dev.livslusths.se` → `85.190.107.67` only.

---

## Phase 1 — Provision the new host — ✅ done 2026-09-20

- [x] Confirm SSH access. **Correction to the plan:** `eric`'s SSH key logs
      in fine, but `eric` has no known sudo password, so it can't run any
      privileged provisioning commands. `administrator` (password auth,
      password in `one_host.md`) turned out to have **passwordless sudo**,
      so `administrator` is now the account used for provisioning and
      deploys instead of `eric`. Both users were added to the `docker`
      group.
- [x] `apt update && apt upgrade -y` — already up to date, nothing to do.
- [x] Installed Docker Engine + Compose plugin from Docker's official apt
      repo (`docker-ce docker-ce-cli containerd.io docker-buildx-plugin
      docker-compose-plugin`) — `docker --version` → 29.8.1, `docker compose
      version` → v5.5.1.
- [x] Installed `nginx` (1.28.3), enabled and started.
- [x] Installed `certbot` (4.0.0) + `python3-certbot-nginx`.
- [x] Configured `ufw`: allowed OpenSSH (22), 80, 443, enabled. Verified SSH
      still reachable after enabling.
- [x] Generated a **new**, dedicated ed25519 keypair for GitHub Actions
      deploys to this host (local paths: `~/.ssh/livlust_onecom_ci_deploy`
      private / `.pub` public — **not** committed to the repo, not the same
      key as Kamatera's `github-actions-deploy@livslusths`). Public key
      installed into `administrator`'s `~/.ssh/authorized_keys` on the new
      host and verified working. This key becomes the `DEV_DEPLOY_SSH_KEY`
      / eventual `DEPLOY_SSH_KEY` GitHub secret in Phase 2/3/6.
- [x] Created `/opt/livlust` deploy directory, owned by `administrator`
      (same convention as Kamatera's `/opt/livlust`).

---

## Phase 2 — Make the deploy pipeline domain-aware — ✅ done 2026-09-20

The pipeline hardcoded `livslusths.se` in three places:
`.github/workflows/deploy.yml` (`DOMAIN=`), `deploy/nginx-livslust.conf`
(`server_name`), and `docker-compose.prod.yml` (`PUBLIC_URL`,
`CORS_ORIGIN`, `VITE_CMS_URL`).

- [x] `docker-compose.prod.yml`'s `PUBLIC_URL`/`CORS_ORIGIN`/`VITE_CMS_URL`
      were hardcoded literal strings, not `.env`-driven — parametrized all
      three as `${VAR:-https://livslusths.se/...}` so the **same** compose
      file now works for both hosts: unset on Kamatera → identical prod
      behavior (verified defaults match exactly what was there before);
      set in the dev host's `.env` → targets `dev.livslusths.se` instead.
      Documented the new optional overrides in `.env.example`.
- [x] Added [.github/workflows/deploy-dev.yml](.github/workflows/deploy-dev.yml),
      a second workflow, `workflow_dispatch`-only (never triggers on push
      to `main`, so it can't interfere with prod deploys), using new
      secrets `DEV_DEPLOY_HOST`, `DEV_DEPLOY_USER`, `DEV_DEPLOY_SSH_KEY`
      (added to the GitHub repo via `gh secret set` — `DEV_DEPLOY_USER` is
      `administrator`, not `eric`, per the Phase 1 correction). Same
      `/opt/livlust` deploy dir, `DOMAIN=dev.livslusths.se`, no separate
      `newsletter.` subdomain/cert (out of scope for dev — `/newsletter-api`
      still proxies under the main dev domain, same as prod).
- [x] Added [deploy/nginx-dev.conf](deploy/nginx-dev.conf): single
      `server_name dev.livslusths.se;` (no `www.`), same `/cms` and
      `/newsletter-api` proxy locations as prod so contact form + newsletter
      signup can be tested on dev too.
- [ ] Add `https://dev.livslusths.se/*` as an allowed HTTP referrer on the
      Google Calendar API key (same key used in prod, just add the referrer
      pattern — same as was done for apex + `www` earlier). **Still
      pending** — needs Google Cloud Console access.
- Committed locally (not yet pushed — pushing to `main` triggers the
      *existing* `deploy.yml` prod workflow too, so confirm with the user
      before pushing even though the compose-file change is
      backward-compatible). **Pushed and deployed 2026-09-20** — prod
      `deploy.yml` run succeeded, smoke-tested `https://www.livslusths.se`
      (homepage 200, `/cms/server/ping` 200) — no regression.

---

## Phase 3 — First deploy to dev.livslusths.se — ✅ done 2026-09-20

- [x] `DEV_DEPLOY_*` secrets added to the GitHub repo.
- [x] Pushed the Phase 2 commits to `main`; manually cloned the repo into
      `/opt/livlust` on the new host and uploaded a hand-built `.env`
      (fresh `DIRECTUS_KEY`/`DIRECTUS_SECRET`/DB/Listmonk passwords, real
      Google Calendar API key reused from prod, `PUBLIC_URL`/`CORS_ORIGIN`/
      `VITE_CMS_URL` all pointed at `https://dev.livslusths.se`).
- [x] **Bug found and fixed along the way** (same class of issue as the
      original Kamatera migration): `directus/seed.mjs`'s `waitForDirectus()`
      polled `/server/health`, which also reports the **email transport's**
      connection status — a false negative whenever SMTP auth fails, even
      though Directus itself is fully booted and the REST API works fine
      (matches the already-known local-dev quirk in repo memory). On the
      new host this hung the deploy forever, because Brevo's SMTP relay
      rejected the new one.com IP with `525 Unauthorized IP address` (not
      yet allowlisted). Fixed `waitForDirectus()` to poll `/server/info`
      instead (app+DB readiness only, no email dependency) — committed and
      pushed, benefits the existing prod pipeline too. User then
      authorized the new host's IP in Brevo's dashboard directly, so real
      email now also works from the new host (`/server/health` →
      `{"status":"ok"}` confirmed).
- [x] Nginx site + Certbot cert issued for `dev.livslusths.se` (verified:
      cert subject `CN=dev.livslusths.se`, valid to Dec 19 2026, auto-renews
      via the certbot systemd timer).
- [x] Confirmed all containers healthy: `db`, `directus`, `directus-init`
      (ran to completion — full schema + seed content created), `frontend`,
      `listmonk_db`, `listmonk`.
- [x] `https://dev.livslusths.se` loads (200), `/cms/server/health` → 200.
      Content at this point is `seed.mjs`'s default seed content, not the
      real migrated data — that's Phase 4.

---

## Phase 4 — Migrate data — ✅ done 2026-09-20

- [x] Ran the existing `.local-backups/backup.sh` (gitignored, in this
      repo's local working copy only) to pull a **fresh** Postgres dump for
      both `livlust_db` and `listmonk_db`, plus tarballs of the
      `livlust_directus_uploads` and `livlust_listmonk_uploads` volumes,
      straight from the live Kamatera host — read-only on the server, no
      prod downtime.
- [x] Copied the dump/tarballs to the new host via `scp` into `/tmp`.
- [x] Restored on the new host: stopped `directus` + `listmonk` (kept `db`/
      `listmonk_db`/`frontend` up), terminated active DB connections,
      `dropdb`/`createdb`, then piped each `.sql` dump into the matching
      empty database via `psql` — clean restore, no errors (dumps had no
      `--clean`/`--create` so the target DB had to be emptied first).
- [x] Restored both uploads volumes by clearing then untarring into the
      named volumes via a throwaway `alpine` container bind-mounting each
      volume + `/tmp`.
- [x] Restarted `directus` + `listmonk`; did **not** need to re-run
      `directus-init` since the dump already contains the exact schema
      `seed.mjs` produces (no drift at time of migration).
- [x] Verified real migrated content is being served (not `seed.mjs`'s
      default content): `/items/posts` returns real slugs
      (`vi-startar-livslust`, `var-webbplats-ar-har`,
      `internationella-dagen-forlorat-barn`, etc.) both directly on
      `127.0.0.1:8055` and through the public
      `https://dev.livslusths.se/cms/...` proxy; Listmonk root and
      `/newsletter-api/` both return 200.
- [x] Deleted the dump files/tarballs from `/tmp` on the host and removed
      the local timestamped backup folder afterward (dumps contain real
      subscriber/contact PII, shouldn't linger on disk anywhere).

---

## Phase 5 — Verify parity on dev.livslusths.se

Functional checklist (compare against the live Kamatera site):

- [ ] Homepage: all sections render (Header, Hero slideshow, About, Offer/
      events, Crisis, ContactForm, Footer), theme (`VITE_THEME`) correct
- [ ] Language toggle SV/EN
- [x] "Kommande aktiviteter" pulls from Google Calendar correctly (calendar
      API key referrer allows `dev.livslusths.se`) — hit a real bug here:
      dev showed "Inga kommande evenemang just nu" because the shared
      Calendar API key's HTTP-referrer restriction didn't yet include
      `dev.livslusths.se` (only `www.livslusths.se`/`livslusths.se`), so
      the browser fetch got a silent `403 API_KEY_HTTP_REFERRER_BLOCKED`
      and fell back to the empty state. User added
      `https://dev.livslusths.se/*` (+ `http://` and `localhost:3000`) to
      the key's website restrictions in Google Cloud Console — verified
      fixed via direct API call with a `dev.livslusths.se` Referer header,
      now returns 200 with real event data.
- [ ] Contact form submits → new `contact_submissions` row in Directus
- [ ] Newsletter signup (`/newsletter-api/api/public/subscription`) → new
      subscriber shows up in Listmonk admin
- [ ] Blog/news list (`BlogIndexPage`) and individual post pages
      (`BlogPostPage`) render migrated posts, including images
- [ ] Resources map (`ResourcesMap.tsx` / `resources.ts`) renders correctly
- [ ] Admin login (`AdminLogin`/`AdminDashboard`) works against the
      migrated Directus data
- [ ] Directus admin UI reachable at `/cms/admin`, login works
- [ ] Listmonk admin UI reachable, migrated lists/campaigns intact
- [ ] Run existing Playwright suite (`tests/blog.spec.js`,
      `tests/map.spec.js`) against `https://dev.livslusths.se`
- [ ] TLS cert valid, no browser warnings
- [ ] Spot-check resource usage under load (new host: 4 vCPU/8GB vs
      Kamatera's spec) — no swap thrashing, containers stay healthy

---

## Phase 6 — Cutover

- [ ] Take one final fresh backup on Kamatera and restore it to the new
      host, to capture any content changes made during the Phase 5 test
      window.
- [ ] Update the new host's `.env` / nginx config from `dev.livslusths.se`
      to the real domains: `PUBLIC_URL`/`CORS_ORIGIN`/`VITE_CMS_URL` →
      `https://livslusths.se`, nginx `server_name livslusths.se
      www.livslusths.se`.
- [ ] In simply.com, repoint `livslusths.se` (apex), `www.livslusths.se`,
      and `newsletter.livslusths.se` A records to `85.190.107.67` only
      (remove `45.248.37.221` from all three).
- [ ] Certbot issue prod certs on the new host for `livslusths.se`,
      `www.livslusths.se`, `newsletter.livslusths.se`.
- [ ] Update the **existing** `deploy.yml` workflow's `DEPLOY_HOST` /
      `DEPLOY_USER` / `DEPLOY_SSH_KEY` GitHub secrets to point at the new
      host, so future pushes to `main` deploy to one.com instead of
      Kamatera.
- [ ] Monitor DNS propagation and smoke-test `https://livslusths.se` from
      multiple networks/devices post-cutover.

---

## Phase 7 — Decommission Kamatera

- [ ] Keep the Kamatera host running untouched for a short grace period
      (1-2 weeks) as a rollback option.
- [ ] After confirming the new host is stable, cancel/downgrade the
      Kamatera subscription.
- [ ] Remove the old `github-actions-deploy@livslusths` key from GitHub
      secrets (replaced by the new host's CI key in Phase 6).
- [ ] Delete `kamatera.api.keys.md` once no longer needed (already
      gitignored, so this is just local cleanup).

---

## Security follow-ups (not blocking, but worth doing soon)

- [ ] `one_host.md` and `simply.com_DNS_API_keys.md` contained plaintext
      credentials (SSH private key, VPS password, DNS API login, one.com
      API JWT) and were **not** in `.gitignore` — added both to
      `.gitignore` just now. They were never actually committed
      (`git ls-files` confirms), so no history cleanup is needed, just keep
      them untracked going forward.
- [ ] The one.com `administrator` account uses password auth with the
      password stored in plaintext in the repo folder. As of Phase 1,
      `administrator` also has the new CI deploy key installed in its
      `authorized_keys` and key-based login is confirmed working. Once
      everything (manual admin access + CI deploys) is confirmed working
      key-only, disable password SSH auth (`PasswordAuthentication no` in
      `sshd_config`) on the host entirely.
- [ ] Longer-term: move these credentials into a real secrets manager
      instead of local `.md` files.
