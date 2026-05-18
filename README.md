# Binance Futures Monitor

React + Fastify 的 Binance 合约账户监控面板。前端只展示数据和发起平仓请求；Binance API Key/Secret 只放在后端容器环境变量里。

## 内部接口部署方式

Docker Compose 中只有 `frontend` 对外暴露端口，`backend` 只在 Docker 内网中通过 `http://backend:8080` 被 Nginx 代理访问：

```text
browser -> http://server-ip:28473 -> frontend nginx -> /api/* -> backend:8080
```

后端不需要单独域名，也不需要映射公网端口。

## 启动

复制后端环境变量：

```bash
cp backend/.env.example backend/.env
```

默认是 mock 模式：

```bash
docker compose up --build -d
```

上线前必须修改 `backend/.env` 里的登录配置：

```env
ADMIN_USERNAME=你的登录用户名
ADMIN_PASSWORD=高强度密码
AUTH_TOKEN_SECRET=一串足够长的随机字符串
```

如果仍使用模板里的默认密码或默认 token secret，后端会拒绝启动。

访问：

```text
http://你的服务器IP:28473
```

检查后端：

```text
http://你的服务器IP:28473/api/health
```

## 切换真实 Binance Futures API

编辑 `backend/.env`：

```env
BINANCE_MODE=binance
BINANCE_API_KEY=你的key
BINANCE_API_SECRET=你的secret
BINANCE_HEDGE_MODE=false
```

MVP 建议使用 Binance 单向持仓模式。后端平仓会：

- 重新读取当前持仓
- 校验 `symbol`、`positionSide`、`quantity`
- LONG 平仓发送 `SELL MARKET reduceOnly`
- SHORT 平仓发送 `BUY MARKET reduceOnly`
- 拒绝数量超过当前持仓的请求

注意：Binance USD-M Futures 的 `reduceOnly` 在 Hedge Mode 下有限制，所以当前后端默认阻止 Hedge Mode 平仓，避免误开反向仓位。

## 当前 Binance REST 数据源

前端每 3 秒请求一次后端聚合接口：

```text
GET /api/futures/snapshot
```

真实模式下后端会调用这些 Binance USD-M Futures 官方接口：

```text
GET  /fapi/v3/account
GET  /fapi/v3/positionRisk
GET  /fapi/v1/openOrders
GET  /fapi/v1/income
GET  /fapi/v1/userTrades
GET  /fapi/v1/ticker/24hr
GET  /fapi/v1/premiumIndex
POST /fapi/v1/order
```

`POST /fapi/v1/order` 只用于已有仓位平仓，不提供开仓、新建普通订单、改杠杆或划转接口。

`MONITOR_SYMBOLS` 是可选项。留空时，行情监控会自动使用当前持仓和当前挂单里的交易对；只有你想额外固定监控某些交易对时才填写，例如 `BTCUSDT,ETHUSDT`。
