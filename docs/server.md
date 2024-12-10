```yaml
#cloud-config

disable_root: false
ssh_pwauth: false

system_info:
  default_user:
    name: root
    shell: /bin/bash

write_files:
  - path: /root/.bashrc
    append: true
    content: |

      # fnm
      FNM_PATH="/.local/share/fnm"
      if [ -d "$FNM_PATH" ]; then
        export PATH="$FNM_PATH:$PATH"
        eval "`fnm env`"
      fi
      export FNM_COREPACK_ENABLED="true"
      eval "$(fnm env --use-on-cd)"

runcmd:
  - curl -fsSL https://fnm.vercel.app/install | bash
```

```shell
fnm install --lts
# Installing Node v22.12.0 (x64)

fnm default 22 # use the version logged above
```
