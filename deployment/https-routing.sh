#!/bin/sh
set -eu
chain=EDUARD_SITE_HTTPS
case "${1:-}" in
 start)
  /usr/sbin/nginx -t
  /usr/sbin/iptables -t nat -N "$chain" 2>/dev/null || true
  /usr/sbin/iptables -t nat -C "$chain" -p tcp --dport 443 -j REDIRECT --to-ports 8443 2>/dev/null || /usr/sbin/iptables -t nat -A "$chain" -p tcp --dport 443 -j REDIRECT --to-ports 8443
  /usr/sbin/iptables -t nat -C PREROUTING -p tcp --dport 443 -m addrtype --dst-type LOCAL -j "$chain" 2>/dev/null || /usr/sbin/iptables -t nat -I PREROUTING 1 -p tcp --dport 443 -m addrtype --dst-type LOCAL -j "$chain"
 ;;
 stop)
  while /usr/sbin/iptables -t nat -C PREROUTING -p tcp --dport 443 -m addrtype --dst-type LOCAL -j "$chain" 2>/dev/null; do /usr/sbin/iptables -t nat -D PREROUTING -p tcp --dport 443 -m addrtype --dst-type LOCAL -j "$chain"; done
  /usr/sbin/iptables -t nat -F "$chain" 2>/dev/null || true
  /usr/sbin/iptables -t nat -X "$chain" 2>/dev/null || true
 ;;
 *) exit 2;;
esac
