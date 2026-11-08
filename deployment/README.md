# eduardkhamzin.ru

The website is the standalone root `index.html`. It has no external resources, JavaScript, framework, analytics or web fonts.

Target: Timeweb Cloud server `147.45.156.6`, SSH user `root`.

Serve `index.html` from `/var/www/eduardkhamzin.ru/` using the included Nginx configuration. Enable it only after inspecting existing virtual hosts, and run `nginx -t` before reloading.

REG.RU DNS remains on ns1.reg.ru / ns2.reg.ru. Set the `@` A record to `147.45.156.6`. If www is desired, set its A record to the same IP. Check for conflicting A/AAAA records first; preserve mail/TXT records.

Issue a Let's Encrypt certificate after the domain resolves to the server, using the existing certificate tooling or Certbot's Nginx integration. Verify HTTPS and automatic renewal.

## Live configuration

DNS A records for `@` and `www` point to `147.45.156.6`. Let's Encrypt covers both names. HTTP redirects to `https://eduardkhamzin.ru/` except ACME challenges. Renewal is scheduled by `certbot.timer`; a deploy hook reloads Nginx.

Amnezia already owns TCP/UDP 443. Its containers and configurations were left intact. Nginx listens on 8443 for TLS SNI routing: this domain goes to the loopback HTTPS site on 8444, and every other TLS name passes through to Amnezia on loopback 443. A dedicated IPv4 NAT rule routes new external TCP 443 connections to this dispatcher. UDP 443 remains untouched. Existing connections are not interrupted.

`eduard-site-https.service` restores this route at startup after Docker/Nginx. Its script uses a dedicated `EDUARD_SITE_HTTPS` chain. To revert ONLY website TLS routing and restore direct external TCP 443 access to Amnezia:

```sh
systemctl disable --now eduard-site-https.service
```

This stops website HTTPS routing; the static page and certificates remain on disk. Source configurations and the service/script are included in this directory.
