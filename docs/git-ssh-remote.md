## Git remotes, SSH keys, and host aliases (5‑minute guide)

### Why this matters
- **SSH keys** authenticate you to GitHub/GitLab without passwords.
- **Host aliases** let you pick which SSH key to use per repository/account.
- **Git remotes** tell your local repo where to push/pull.

### 1) Check your SSH keys
```bash
ls -la ~/.ssh
cat ~/.ssh/id_ed25519.pub   # or id_rsa.pub
```
Add the public key (.pub) to your Git provider account settings.

### 2) Create SSH host aliases (choose which key per account)
Edit `~/.ssh/config` and add entries like:
```sshconfig
Host github-personal
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519
  IdentitiesOnly yes
  AddKeysToAgent yes
  UseKeychain yes

Host github-work
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_rsa
  IdentitiesOnly yes
  AddKeysToAgent yes
  UseKeychain yes
```

macOS tip: `AddKeysToAgent yes` and `UseKeychain yes` let the key persist.

### 3) Verify which identity each alias uses
```bash
ssh -T git@github-personal
ssh -T git@github-work
```
You should see a greeting showing which GitHub/GitLab user is recognized.

### 4) Point your repo’s remote to the right alias
In your repo directory:
```bash
git remote -v
git remote set-url origin git@github-work:org-or-user/repo-name.git
```
From now on, `git push` will use the `github-work` alias and its key.

Switch HTTPS → SSH (optional):
```bash
git remote set-url origin git@github.com:org-or-user/repo-name.git
```

### 5) Ensure the correct key is loaded
```bash
ssh-add -D                    # clear agent keys
ssh-add ~/.ssh/id_rsa         # or ~/.ssh/id_ed25519
ssh -T git@github-work        # confirm greeting matches the right user
```

### 6) Per‑repo override (force a specific key without aliases)
```bash
git config core.sshCommand "ssh -i ~/.ssh/id_rsa -o IdentitiesOnly=yes"
```

### 7) Common errors and quick fixes
- **Permission denied to wrong user**: Remote uses the wrong alias/URL.
  - Fix: `git remote set-url origin git@github-work:org/repo.git`
- **Multiple keys, wrong one picked**: Agent has many keys.
  - Fix: `ssh-add -D && ssh-add ~/.ssh/id_...`
- **Repo cloned with HTTPS**: Push asks for username/token.
  - Fix: switch to SSH with `git remote set-url ...` (see above).
- **Key not added to account**: 401/permission errors persist.
  - Fix: Add `.pub` key to Git provider settings.

### 8) Minimal command cheat sheet
```bash
# show remotes
git remote -v

# set remote with alias
git remote set-url origin git@github-work:org/repo.git

# test SSH alias identity
ssh -T git@github-work

# push
git push
```

That’s it. With aliases + correct remotes, you can cleanly separate personal and work pushes.


