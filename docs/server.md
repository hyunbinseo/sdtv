```yaml
#cloud-config

disable_root: true
ssh_pwauth: false

users:
  - default
  - name: web-admin
    shell: /bin/bash
    lock_passwd: true
    sudo:
      - 'ALL=(ALL) NOPASSWD:/bin/cloudflared service install'
      - 'ALL=(ALL) NOPASSWD:/bin/systemctl * cloudflared'
      - 'ALL=(ALL) NOPASSWD:/bin/systemctl * nginx'
    ssh_authorized_keys:
      - ssh-rsa AAAAB3... # add actual key(s)

yum_repos:
  cloudflared-stable:
    # Reference https://pkg.cloudflare.com/index.html
    name: cloudflared-stable
    baseurl: https://pkg.cloudflare.com/cloudflared/rpm
    enabled: true
    type: rpm
    gpgcheck: true
    gpgkey: https://pkg.cloudflare.com/cloudflare-ascii-pubkey.gpg

  nginx-stable:
    # Reference http://nginx.org/en/linux_packages.html#RHEL
    name: nginx stable repo
    baseurl: http://nginx.org/packages/centos/$releasever/$basearch/
    enabled: true
    gpgcheck: true
    gpgkey: https://nginx.org/keys/nginx_signing.key
    module_hotfixes: true

write_files:
  - path: /etc/cloudflared/config.yml
    content: |
      url: http://localhost:8000
      tunnel: <Tunnel-UUID>
      credentials-file: /home/web-admin/.cloudflared/<Tunnel-UUID>.json

  - path: /etc/nginx/conf.d/default.conf
    content: |
      server {
        listen 8000;
        real_ip_header CF-Connecting-IP;

        location / {
          root /home/web-admin/static;
          try_files $uri @sveltekit;
          expires 30d;
        }

        location @sveltekit {
          proxy_pass http://localhost:3000;
          proxy_set_header X-Real-IP $remote_addr;
        }
      }

  - path: /home/web-admin/.bashrc
    append: true
    content: |

      # fnm
      export FNM_COREPACK_ENABLED="true"
      FNM_PATH="/home/web-admin/.local/share/fnm"
      if [ -d "$FNM_PATH" ]; then
        export PATH="$FNM_PATH:$PATH"
        eval "$(fnm env --use-on-cd)"
      fi

runcmd:
  - chmod 664 /etc/cloudflared/config.yml
  - chmod 664 /etc/nginx/conf.d/default.conf
  - chown root:web-admin /etc/cloudflared/config.yml
  - chown root:web-admin /etc/nginx/conf.d/default.conf
  - chown -R web-admin:web-admin /home/web-admin
  - semanage port -a -t http_port_t -p tcp 8000
  - yum install -y cloudflared nginx yum-utils
  - systemctl enable nginx
  - systemctl start nginx
```

```shell
curl -fsSL https://fnm.vercel.app/install | bash -s -- --skip-shell

fnm install --lts # Installing Node v22.12.0
fnm default 22 # use the version logged above

corepack install --global pnpm
pnpm setup

source /home/web-admin/.bashrc

pnpm add pm2@latest --global
pm2 install pm2-logrotate
```
