# Deployment

In this guide, [Cloudflare] and [Vultr] (Paid) will be used.

[Cloudflare]: https://www.cloudflare.com/
[Vultr]: https://www.vultr.com/

1. Generate an [SSH key] and add it to the ssh-agent.
2. Prepare a custom domain. Purchase one if needed.
3. [Add the domain to Cloudflare](https://developers.cloudflare.com/fundamentals/setup/manage-domains/add-site/) and [enforce HTTPS](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/always-use-https/).

```
# https://dash.cloudflare.com

Websites
├── [+ Add a domain]
└── <selected-domain>
    └── SSL/TLS
        ├── Overview
        │   └── Current encryption mode: Full (strict)
        └── Edge Certificates
            └── ✅ Always Use HTTPS
```

4. Deploy a new instance in Vultr. ($6/month~)

[SSH key]: https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent

<details>
   <summary>details</summary>

## Deploy a new instance in Vultr

- Create a new [firewall group](https://my.vultr.com/firewall/) with a 'SSH Only' description.
- Add the default rule to create the following inbound rules:

| Action | Protocol | Port (or range) | Source (IPv4) |
| ------ | -------- | --------------- | ------------- |
| accept | SSH      | 22              | 0.0.0.0/0     |

- Deploy a new [instance](https://my.vultr.com/deploy/) with the following options:

| Item                | Value                      |
| ------------------- | -------------------------- |
| Choose Type         | Cloud Compute - Shared CPU |
| Choose Image        | Rocky Linux 9 x64          |
| Choose Plan         | Lowest Tier ($6/month)     |
| Additional Features | ✅ Cloud-Init User-Data    |
| Firewall Group      | SSH Only                   |

- Add the following content into the Cloud-Init user data text field.
- Add your SSH public key(s) to the `ssh_authorized_keys` array.

```yaml
#cloud-config

disable_root: true
ssh_pwauth: false

users:
  - default
  - name: webadmin
    shell: /bin/bash
    lock_passwd: true
    sudo:
      - 'ALL=(ALL) NOPASSWD:/bin/cloudflared service install'
      - 'ALL=(ALL) NOPASSWD:/bin/systemctl * cloudflared'
      - 'ALL=(ALL) NOPASSWD:/bin/systemctl * nginx'
      - 'ALL=(ALL) NOPASSWD:/usr/sbin/nginx'
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

package_update: true
package_upgrade: true
package_reboot_if_required: true

packages:
  - cloudflared
  - nginx
  - yum-utils

write_files:
  - path: /etc/cloudflared/config.yml
    content: |
      url: http://localhost:8000
      tunnel: <Tunnel-UUID>
      credentials-file: /home/webadmin/.cloudflared/<Tunnel-UUID>.json

  - path: /etc/nginx/conf.d/default.conf
    content: |
      server {
        listen 8000;
        real_ip_header CF-Connecting-IP;

        location / {
          root /home/webadmin/static;
          try_files $uri @sveltekit;
          expires 30d;
        }

        location @sveltekit {
          proxy_pass http://localhost:3000;
          proxy_set_header X-Real-IP $remote_addr;
        }
      }

  - path: /home/webadmin/.bash_profile
    content: |
      if [ -f ~/.bashrc ]; then
        source ~/.bashrc
      fi

  - path: /home/webadmin/.bashrc
    append: true
    content: |

      # fnm
      export FNM_COREPACK_ENABLED="true"
      FNM_PATH="/home/webadmin/.local/share/fnm"
      if [ -d "$FNM_PATH" ]; then
        export PATH="$FNM_PATH:$PATH"
        eval "$(fnm env --use-on-cd)"
      fi

runcmd:
  - mkdir -p /home/webadmin/static
  - chown -R webadmin:webadmin /home/webadmin
  - chmod 750 /home/webadmin

  - setfacl -m u:webadmin:rw- /etc/cloudflared/config.yml

  - setfacl -m u:webadmin:rwx /etc/nginx/conf.d
  - setfacl -R -m u:webadmin:rw- /etc/nginx/conf.d/*
  - setfacl -d -m u:webadmin:rw- /etc/nginx/conf.d

  - setfacl -m u:webadmin:r-x /var/log/nginx
  - setfacl -R -m u:webadmin:r-- /var/log/nginx/*
  - setfacl -d -m u:webadmin:r-- /var/log/nginx

  - setfacl -m u:nginx:r-x /home/webadmin/static
  - setfacl -R -m u:nginx:r-- /home/webadmin/static/*
  - setfacl -d -m u:nginx:r-- /home/webadmin/static

  - setsebool -P httpd_can_network_connect 1
  - semanage port -a -t http_port_t -p tcp 8000

  - systemctl enable nginx
  - systemctl start nginx
```

</details>

5. Update the `.env.production.local` file:

```shell
EMAIL_API_KEY="" # required
EMAIL_SENDER="" # required

SERVER_ADDRESS="<vultr-instance-ip-address>" # required
SERVER_USERNAME="webadmin" # default value
SERVER_DIRECTORY="server" # default value
```

6. Build and send files to the server.

```shell
node --run deploy
```

7. SSH into the server.

```shell
# client
ssh webadmin@<vultr-instance-ip-address>
```

8. Setup [fnm], Node.js, [PM2], and [cloudflared].

[cloudflared]: https://github.com/cloudflare/cloudflared#readme
[fnm]: https://github.com/Schniz/fnm#readme
[PM2]: https://pm2.keymetrics.io/

```shell
# server

curl -fsSL https://fnm.vercel.app/install | bash -s -- --skip-shell
source ~/.bashrc

fnm install --lts # Installing Node v22.12.0
fnm default 22 # use the version logged above

corepack install --global pnpm

pnpm setup
source ~/.bashrc

pnpm add pm2@latest --global
pm2 install pm2-logrotate

cloudflared tunnel login
# 1. Visit the URL in the client browser.
# 2. Select a zone (domain) and authorize it.

cloudflared tunnel create <NAME>
# Copy the tunnel ID from the output:
# Created tunnel <NAME> with id <Tunnel-UUID>

nano /etc/cloudflared/config.yml
# Replace <Tunnel-UUID> with the above tunnel ID.

sudo cloudflared service install
sudo systemctl start cloudflared

sudo systemctl status cloudflared
# INF Registered tunnel connection connIndex=1
# INF Registered tunnel connection connIndex=2
# ...

cloudflared tunnel route dns <Tunnel-UUID> <hostname>
# Hostname is the desired domain. (e.g. example.com, sub.example.com)
# Hostname must match the domain authorized in the cloudflared login.
```

9. Start Node.js server using PM2

```shell
# server

cd ~/server
nano .env.production
# Update environment variables according to the comments.

pnpm i --prod
pnpm db:migrate@prod
pm2 start pm2.config.cjs
```
