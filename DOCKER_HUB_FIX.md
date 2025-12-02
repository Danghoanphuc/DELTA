# Fix Docker Hub Authentication Error

## Vấn đề

```
Error: Error response from daemon: Get "https://registry-1.docker.io/v2/": unauthorized: incorrect username or password
```

## Nguyên nhân

- GitHub Secrets `DOCKER_USERNAME` hoặc `DOCKER_PASSWORD` không đúng
- Password Docker Hub đã thay đổi
- Access Token đã hết hạn hoặc bị revoke

## Giải pháp

### Option 1: Cập nhật Docker Hub Credentials (Khuyến nghị)

#### Bước 1: Tạo Docker Hub Access Token

1. Đăng nhập https://hub.docker.com
2. Vào **Account Settings** → **Security** → **Access Tokens**
3. Click **New Access Token**
4. Đặt tên: `github-actions-printz`
5. Chọn quyền: **Read, Write, Delete**
6. Click **Generate**
7. **Copy token ngay** (chỉ hiện 1 lần!)

#### Bước 2: Cập nhật GitHub Secrets

1. Vào GitHub Repository: https://github.com/YOUR_USERNAME/YOUR_REPO
2. **Settings** → **Secrets and variables** → **Actions**
3. Cập nhật hoặc tạo mới:
   - `DOCKER_USERNAME`: Username Docker Hub (ví dụ: `hoanphuc`)
   - `DOCKER_PASSWORD`: Paste Access Token vừa tạo

#### Bước 3: Re-run Workflow

1. Vào **Actions** tab
2. Chọn workflow bị lỗi
3. Click **Re-run failed jobs**

---

### Option 2: Chuyển sang GitHub Container Registry (Không cần Docker Hub)

#### Ưu điểm:

- Không cần tạo account Docker Hub
- Tự động authenticate với `GITHUB_TOKEN`
- Miễn phí cho public repos
- Tích hợp tốt với GitHub

#### Cách chuyển:

**File: `.github/workflows/deploy.yml`**

Thay đổi phần login và image tags:

```yaml
# BEFORE (Docker Hub)
- name: Login to Docker Hub
  uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKER_USERNAME }}
    password: ${{ secrets.DOCKER_PASSWORD }}

- name: Build & Push (Customer)
  uses: docker/build-push-action@v5
  with:
    tags: hoanphuc/printz-customer-backend:${{ steps.env.outputs.TAG }}

# AFTER (GitHub Container Registry)
- name: Login to GitHub Container Registry
  uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}

- name: Build & Push (Customer)
  uses: docker/build-push-action@v5
  with:
    tags: ghcr.io/${{ github.repository_owner }}/printz-customer-backend:${{ steps.env.outputs.TAG }}
```

**Cập nhật Render.yaml để pull từ GHCR:**

```yaml
services:
  - type: web
    name: printz-customer-backend
    env: docker
    dockerfilePath: ./apps/customer-backend/Dockerfile
    dockerContext: .
    # Thay đổi image source
    image:
      url: ghcr.io/YOUR_USERNAME/printz-customer-backend:latest
```

---

### Option 3: Build trực tiếp trên Render (Không cần Registry)

Nếu không muốn dùng Docker registry, có thể để Render tự build:

**File: `render.yaml`**

```yaml
services:
  - type: web
    name: printz-customer-backend
    env: docker
    # Render sẽ tự build từ source
    dockerfilePath: ./apps/customer-backend/Dockerfile
    dockerContext: .
    # Bỏ phần image
```

**Ưu điểm:**

- Đơn giản nhất
- Không cần Docker Hub hay GHCR
- Render tự động build khi có push

**Nhược điểm:**

- Build chậm hơn (mỗi lần deploy đều phải build lại)
- Tốn tài nguyên Render

---

## Kiểm tra nhanh

### Test Docker login locally:

```bash
# Test với Access Token
echo "YOUR_ACCESS_TOKEN" | docker login -u YOUR_USERNAME --password-stdin

# Nếu thành công, push thử
docker tag test-image YOUR_USERNAME/test-image:latest
docker push YOUR_USERNAME/test-image:latest
```

### Verify GitHub Secrets:

```bash
# Trong workflow, thêm step debug (tạm thời):
- name: Debug Secrets
  run: |
    echo "Username length: ${#DOCKER_USERNAME}"
    echo "Password length: ${#DOCKER_PASSWORD}"
  env:
    DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
    DOCKER_PASSWORD: ${{ secrets.DOCKER_PASSWORD }}
```

## Khuyến nghị

**Cho Production:** Dùng **Option 1** (Docker Hub với Access Token)

- Ổn định, được support tốt
- Image có thể dùng ở nhiều nơi

**Cho Side Project:** Dùng **Option 2** (GitHub Container Registry)

- Miễn phí, tích hợp tốt
- Không cần quản lý thêm account

**Cho Testing:** Dùng **Option 3** (Build trực tiếp)

- Đơn giản nhất
- Phù hợp khi còn đang phát triển
