# n8n-nodes-interactivebrokers

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for Interactive Brokers (IBKR), one of the world's largest electronic trading platforms serving professional traders and institutions. Access 160+ markets in 37 countries with stocks, options, futures, forex, bonds, and more through the Client Portal Web API.

![n8n](https://img.shields.io/badge/n8n-community--node-orange)
![Interactive Brokers](https://img.shields.io/badge/Interactive%20Brokers-API-red)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## Features

- **15 Resource Categories** with 75+ operations
- **Trading Operations**: Place, modify, and cancel orders with advanced order types
- **Market Data**: Real-time snapshots and historical data
- **Portfolio Management**: Positions, allocations, and performance tracking
- **Multi-Account Support**: Switch between accounts, FA support
- **Market Scanners**: Run custom market scans
- **Alert Management**: Create and manage MTA alerts
- **Watchlists**: Create and manage instrument watchlists
- **Session Management**: Authentication and session keepalive
- **Paper Trading**: Full support for paper trading accounts

## Installation

### Community Nodes (Recommended)

1. Open your n8n instance
2. Go to **Settings** > **Community Nodes**
3. Click **Install**
4. Search for `n8n-nodes-interactivebrokers`
5. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n installation directory
cd ~/.n8n

# Install the node
npm install n8n-nodes-interactivebrokers
```

### Development Installation

```bash
# 1. Extract the zip file
unzip n8n-nodes-interactivebrokers.zip
cd n8n-nodes-interactivebrokers

# 2. Install dependencies
npm install

# 3. Build the project
npm run build

# 4. Create symlink to n8n custom nodes directory
# For Linux/macOS:
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-interactivebrokers

# For Windows (run as Administrator):
# mklink /D %USERPROFILE%\.n8n\custom\n8n-nodes-interactivebrokers %CD%

# 5. Restart n8n
n8n start
```

## Prerequisites

### Client Portal Gateway

Interactive Brokers requires the Client Portal Gateway running locally for API access. The gateway handles OAuth session management and SSL/TLS.

1. Download the Client Portal Gateway from [Interactive Brokers](https://www.interactivebrokers.com/en/trading/ib-api.php)
2. Extract and configure the gateway
3. Start the gateway: `./bin/run.sh root/conf.yaml`
4. Authenticate via the gateway's web interface (default: https://localhost:5000)

### Gateway Configuration

The gateway runs on `https://localhost:5000` by default. For paper trading, use a paper trading account (accounts starting with `DU`).

## Credentials Setup

| Field | Description | Default |
|-------|-------------|---------|
| Account ID | Your IBKR account ID (e.g., U1234567 or DU1234567 for paper) | Required |
| Session Token | Session token from authenticated gateway session | Optional |
| Environment | Production or Paper trading | Production |
| Base URL | Client Portal Gateway URL | https://localhost:5000/v1/api |
| SSL Verification | Verify SSL certificates (disable for self-signed) | true |

## Resources & Operations

### Session
- **Authenticate**: Initiate authentication
- **Get Auth Status**: Check authentication status
- **Reauthenticate**: Re-authenticate session
- **Logout**: Terminate session
- **Tickle**: Keep session alive (heartbeat)
- **Validate SSO**: Validate SSO token

### Account
- **Get Accounts**: Get portfolio accounts
- **Switch Account**: Switch between accounts
- **Get Account Summary**: Get account summary
- **Get Account Ledger**: Get account ledger
- **Get Account Metadata**: Get account metadata
- **Get PnL Partitioned**: Get profit/loss by account

### Portfolio
- **Get Positions**: Get all positions
- **Get Position By Conid**: Get position for contract
- **Get Positions By Page**: Get paginated positions
- **Invalidate Position Cache**: Refresh position cache
- **Get Allocations**: Get portfolio allocations

### Orders
- **Place Order**: Place new order
- **Place Order Reply**: Confirm order (handle warnings)
- **Modify Order**: Modify existing order
- **Cancel Order**: Cancel order
- **Get Live Orders**: Get live orders
- **Get Order Status**: Get order status
- **Preview Order**: Preview order before execution
- **What-If Order**: Simulate order impact

### Trades
- **Get Trades**: Get executed trades
- **Get Trades By Days**: Get trades for date range

### Market Data
- **Get Snapshot**: Get market data snapshot
- **Get History**: Get historical market data
- **Unsubscribe**: Unsubscribe from market data
- **Unsubscribe All**: Unsubscribe all market data

### Contracts
- **Search Contracts**: Search for contracts by symbol
- **Get Contract Details**: Get contract details by conid
- **Get Contract Info**: Get detailed contract info
- **Get Contract Rules**: Get trading rules for contract
- **Get Security Definition**: Get security definition by conid
- **Get Futures By Symbol**: Get futures contracts
- **Get Stocks By Symbol**: Get stocks by symbol
- **Search Bond Filters**: Search bond filters
- **Get IB Algo Params**: Get IB algorithm parameters

### Scanner
- **Get Scanner Params**: Get scanner parameters
- **Run Scanner**: Run market scanner
- **Get HMDS Scanner Params**: Get HMDS scanner params

### Alerts
- **Get Alerts**: Get MTA alerts
- **Create Alert**: Create new alert
- **Modify Alert**: Modify alert
- **Delete Alert**: Delete alert
- **Get Alert Details**: Get alert details
- **Activate Alert**: Activate/deactivate alert

### Watchlists
- **Get Watchlists**: Get all watchlists
- **Create Watchlist**: Create watchlist
- **Get Watchlist**: Get watchlist by ID
- **Update Watchlist**: Update watchlist
- **Delete Watchlist**: Delete watchlist

### Fund/Banking
- **Get Transaction History**: Get transaction history
- **Get IRA Contributions**: Get IRA contributions
- **Get Cash Balances**: Get cash balances

### FA (Financial Advisor)
- **Get FA Accounts**: Get advisor accounts
- **Get FA Allocation**: Get allocation profiles
- **Set FA Allocation**: Set allocation

### Calendar
- **Get Trading Schedule**: Get trading schedule by asset
- **Get Holidays**: Get market holidays

### Performance
- **Get Performance**: Get account performance
- **Get Transaction History**: Get transaction history
- **Get Portfolio Summary**: Get portfolio summary

### Utility
- **Validate SSO**: Validate SSO
- **Ping**: API ping
- **Get Gateway Version**: Get gateway version
- **Search Symbol**: Symbol search

## Trigger Node

The Interactive Brokers Trigger node polls for trading events:

| Trigger | Description | Poll Interval |
|---------|-------------|---------------|
| New Order | New order placed | Configurable |
| Order Filled | Order executed | Configurable |
| Order Canceled | Order canceled | Configurable |
| Alert Triggered | MTA alert triggered | Configurable |
| Position Changed | Position updated | Configurable |

## Usage Examples

### Place a Market Order

```javascript
{
  "resource": "orders",
  "operation": "placeOrder",
  "conid": "265598",  // AAPL
  "side": "BUY",
  "quantity": 10,
  "orderType": "MKT",
  "tif": "DAY"
}
```

### Get Portfolio Positions

```javascript
{
  "resource": "portfolio",
  "operation": "getPositions"
}
```

### Search for Contracts

```javascript
{
  "resource": "contracts",
  "operation": "searchContracts",
  "symbol": "AAPL",
  "secType": "STK"
}
```

### Run Market Scanner

```javascript
{
  "resource": "scanner",
  "operation": "runScanner",
  "instrument": "STK",
  "type": "TOP_PERC_GAIN",
  "location": "STK.US.MAJOR"
}
```

## Key Concepts

| Concept | Description |
|---------|-------------|
| `conid` | Contract ID - unique instrument identifier |
| `acctId` | Account ID (e.g., DU1234567 for paper) |
| `side` | Order side: BUY or SELL |
| `orderType` | LMT, MKT, STP, STP_LIMIT, TRAIL, etc. |
| `tif` | Time in force: GTC, DAY, IOC, etc. |
| `outsideRTH` | Trade outside regular trading hours |
| `secType` | Security type: STK, OPT, FUT, CASH, etc. |

## Security Types

| Type | Description |
|------|-------------|
| STK | Stock |
| OPT | Option |
| FUT | Future |
| CASH | Forex |
| BOND | Bond |
| FUND | Mutual Fund |
| IND | Index |
| CFD | Contract for Difference |

## Order Types

| Type | Description |
|------|-------------|
| MKT | Market Order |
| LMT | Limit Order |
| STP | Stop Order |
| STP_LIMIT | Stop Limit Order |
| TRAIL | Trailing Stop |
| TRAIL_LIMIT | Trailing Stop Limit |
| MOC | Market on Close |
| LOC | Limit on Close |

## Error Handling

The node handles IBKR-specific error codes:

| Code | Description |
|------|-------------|
| 1100 | Connectivity lost |
| 1101 | Connectivity restored (data lost) |
| 1102 | Connectivity restored (data maintained) |
| 2100 | New account data requested |
| 2101 | Unable to subscribe to data |
| 2103 | Market data farm connection broken |

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use paper trading** for development and testing
3. **Implement rate limiting** (default: 10 requests/second)
4. **Monitor session status** and handle reconnection
5. **Validate order parameters** before submission
6. **Handle order confirmations** (warnings/errors)

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode for development
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## Support

- **Documentation**: [Interactive Brokers API Docs](https://www.interactivebrokers.com/api/doc.html)
- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-interactivebrokers/issues)
- **Commercial Support**: licensing@velobpa.com

## Acknowledgments

- Interactive Brokers for providing the Client Portal API
- n8n for the workflow automation platform
- The n8n community for node development patterns
