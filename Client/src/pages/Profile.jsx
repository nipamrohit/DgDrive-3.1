import { useState, useEffect } from "react";
import { ethers } from "ethers";
import ClipPath from "../assets/svg/ClipPath";
import { GradientLight } from "../components/design/Benefits";
import Section from "../components/Section";
import { notification2 } from "../assets/index";
import Button from "../components/Button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Area,
  AreaChart,
} from "recharts";
import {
  AiOutlineExport,
  AiOutlineLink,
  AiOutlineCopy,
  AiOutlineSwap,
  AiOutlineSend,
  AiOutlineHistory,
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineTrophy,
  AiOutlineRise,
  AiOutlineFall,
  AiOutlineInfoCircle,
  AiOutlineCloudUpload,
  AiOutlineShareAlt,
  AiOutlineDownload,
  AiOutlineFire,
} from "react-icons/ai";

const Profile = () => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [usdPrice, setUsdPrice] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [gasPrice, setGasPrice] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [portfolioData, setPortfolioData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [walletStats, setWalletStats] = useState({});
  const [priceChange, setPriceChange] = useState({ change: 0, percentage: 0 });
  
  // UI States
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const connectedAccounts = JSON.parse(sessionStorage.getItem("connectedAccounts")) || [];

  // Time period options for chart
  const timePeriods = [
    { label: '1D', value: '1d', days: 1 },
    { label: '1W', value: '7d', days: 7 },
    { label: '1M', value: '30d', days: 30 },
    { label: '3M', value: '90d', days: 90 },
    { label: '1Y', value: '365d', days: 365 },
  ];

  const connectWallet = async () => {
    if (!window.ethereum) return alert("MetaMask not detected!");
    setLoading(true);

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();

      setAccount(address);

      if (!connectedAccounts.includes(address)) {
        connectedAccounts.push(address);
        sessionStorage.setItem("connectedAccounts", JSON.stringify(connectedAccounts));
      }

      const bal = await provider.getBalance(address);
      setBalance(ethers.utils.formatEther(bal));

      const network = await provider.getNetwork();
      setNetworkInfo(network);

      const gas = await provider.getGasPrice();
      setGasPrice(ethers.utils.formatUnits(gas, "gwei"));

      await Promise.all([
        fetchEthPrice(),
        fetchChartData(selectedPeriod),
        fetchTransactions(address),
        fetchWalletStats(address),
        generateActivityData(),
      ]);

      generatePortfolioData(ethers.utils.formatEther(bal));
    } catch (err) {
      console.error("Connection Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEthPrice = async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true"
      );
      const data = await res.json();
      setUsdPrice(data.ethereum.usd);
      setPriceChange({
        change: data.ethereum.usd_24h_change || 0,
        percentage: data.ethereum.usd_24h_change || 0,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchChartData = async (period) => {
    try {
      const days = timePeriods.find(p => p.value === period)?.days || 7;
      const interval = days <= 1 ? 'hourly' : days <= 30 ? 'daily' : 'daily';
      
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=${days}&interval=${interval}`
      );
      const data = await res.json();
      
      const formattedData = data.prices.map((item, index) => {
        const date = new Date(item[0]);
        let timeLabel;
        
        if (days === 1) {
          timeLabel = date.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });
        } else if (days <= 30) {
          timeLabel = date.toLocaleDateString("en-US", { month: 'short', day: 'numeric' });
        } else {
          timeLabel = date.toLocaleDateString("en-US", { month: 'short', year: 'numeric' });
        }
        
        return {
          time: timeLabel,
          usd: item[1],
          volume: data.total_volumes[index] ? data.total_volumes[index][1] : 0,
        };
      });
      
      setChartData(formattedData);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTransactions = async (address) => {
    try {
      // Enhanced mock transaction data
      const mockTransactions = [
        {
          hash: "0x1234567890abcdef1234567890abcdef12345678",
          type: "Send",
          amount: "0.15 ETH",
          to: "0x742d...92d1",
          status: "Success",
          time: "2 hours ago",
          gasUsed: "21,000",
          fee: "0.001 ETH",
        },
        {
          hash: "0x9876543210fedcba9876543210fedcba98765432",
          type: "Receive",
          amount: "0.08 ETH",
          from: "0x8ba1...f62c",
          status: "Success",
          time: "6 hours ago",
          gasUsed: "21,000",
          fee: "0.0008 ETH",
        },
        {
          hash: "0x5678901234abcdef5678901234abcdef56789012",
          type: "Contract Interaction",
          amount: "0.02 ETH",
          to: "DgDrive Contract",
          status: "Success",
          time: "1 day ago",
          gasUsed: "85,000",
          fee: "0.003 ETH",
        },
        {
          hash: "0x3456789012bcdef03456789012bcdef0345678901",
          type: "Swap",
          amount: "0.5 ETH → 1250 USDC",
          to: "Uniswap V3",
          status: "Success",
          time: "2 days ago",
          gasUsed: "150,000",
          fee: "0.008 ETH",
        },
        {
          hash: "0x7890123456cdef787890123456cdef7890123456",
          type: "NFT Purchase",
          amount: "0.25 ETH",
          to: "OpenSea",
          status: "Success",
          time: "3 days ago",
          gasUsed: "120,000",
          fee: "0.005 ETH",
        },
      ];
      setTransactions(mockTransactions);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  const fetchWalletStats = async (address) => {
    try {
      // Mock comprehensive wallet statistics
      const stats = {
        totalTransactions: 247,
        totalVolume: "15.8 ETH",
        avgGasPrice: "25 Gwei",
        filesUploaded: 42,
        filesShared: 18,
        totalStorage: "2.3 GB",
        walletAge: "234 days",
        nftCount: 7,
        defiInteractions: 23,
        highestBalance: "2.45 ETH",
        totalFees: "0.234 ETH",
      };
      setWalletStats(stats);
    } catch (err) {
      console.error("Error fetching wallet stats:", err);
    }
  };

  const generateActivityData = () => {
    // Mock activity data for the last 7 days
    const activity = [
      { day: 'Mon', uploads: 3, downloads: 8, shares: 2 },
      { day: 'Tue', uploads: 1, downloads: 12, shares: 4 },
      { day: 'Wed', uploads: 5, downloads: 6, shares: 1 },
      { day: 'Thu', uploads: 2, downloads: 15, shares: 3 },
      { day: 'Fri', uploads: 4, downloads: 9, shares: 6 },
      { day: 'Sat', uploads: 6, downloads: 4, shares: 2 },
      { day: 'Sun', uploads: 2, downloads: 7, shares: 1 },
    ];
    setActivityData(activity);
  };

  const generatePortfolioData = (ethBalance) => {
    const ethValue = parseFloat(ethBalance) * (usdPrice || 2000);
    const portfolio = [
      { name: "ETH", value: ethValue, amount: `${ethBalance} ETH`, color: "#627EEA", percentage: 75 },
      { name: "USDC", value: ethValue * 0.2, amount: "1,250 USDC", color: "#2775CA", percentage: 15 },
      { name: "Files Storage", value: 25, amount: "42 Files", color: "#00D4FF", percentage: 7 },
      { name: "NFTs", value: ethValue * 0.05, amount: "7 NFTs", color: "#FF6B9D", percentage: 3 },
    ];
    setPortfolioData(portfolio);
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      alert("Address copied!");
    }
  };

  const openMetaMaskDashboard = () => {
  if (account) {
    // Direct to MetaMask Portfolio with the specific account
    const dashboardUrl = `https://portfolio.metamask.io/`;
    window.open(dashboardUrl, '_blank');
  } else {
    // Fallback to general MetaMask site
    window.open('https://metamask.io/', '_blank');
  }
};


  const openEtherscan = () => {
    const baseUrl = networkInfo?.chainId === 1 
      ? "https://etherscan.io" 
      : networkInfo?.chainId === 5 
      ? "https://goerli.etherscan.io"
      : "https://etherscan.io";
    window.open(`${baseUrl}/address/${account}`, '_blank');
  };

  const getNetworkName = (chainId) => {
    const networks = {
      1: "Ethereum Mainnet",
      5: "Goerli Testnet",
      11155111: "Sepolia Testnet",
      1337: "Hardhat Local",
      31337: "Hardhat Local"
    };
    return networks[chainId] || `Chain ID: ${chainId}`;
  };

  const getWalletHealthScore = () => {
    if (!walletStats.totalTransactions) return 0;
    
    const transactionScore = Math.min(walletStats.totalTransactions / 100, 1) * 30;
    const ageScore = Math.min(parseInt(walletStats.walletAge) / 365, 1) * 25;
    const balanceScore = balance > 0.1 ? 25 : (balance / 0.1) * 25;
    const activityScore = walletStats.filesUploaded > 10 ? 20 : (walletStats.filesUploaded / 10) * 20;
    
    return Math.round(transactionScore + ageScore + balanceScore + activityScore);
  };

  useEffect(() => {
    if (selectedPeriod) {
      fetchChartData(selectedPeriod);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        setAccount(null);
        setBalance(null);
        setNetworkInfo(null);
        setGasPrice(null);
        setTransactions([]);
        setWalletStats({});
        return;
      }
      
      const newAccount = accounts[0];
      setAccount(newAccount);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const bal = await provider.getBalance(newAccount);
      setBalance(ethers.utils.formatEther(bal));

      const network = await provider.getNetwork();
      setNetworkInfo(network);

      const gas = await provider.getGasPrice();
      setGasPrice(ethers.utils.formatUnits(gas, "gwei"));

      let storedAccounts = JSON.parse(sessionStorage.getItem("connectedAccounts")) || [];
      if (!storedAccounts.includes(newAccount)) {
        storedAccounts.push(newAccount);
        sessionStorage.setItem("connectedAccounts", JSON.stringify(storedAccounts));
      }

      await Promise.all([
        fetchEthPrice(),
        fetchChartData(selectedPeriod),
        fetchTransactions(newAccount),
        fetchWalletStats(newAccount),
        generateActivityData(),
      ]);
      
      generatePortfolioData(ethers.utils.formatEther(bal));
    };

    window.ethereum
      .request({ method: "eth_accounts" })
      .then(handleAccountsChanged)
      .catch(console.error);

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", () => window.location.reload());

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeAllListeners("chainChanged");
    };
  }, [selectedPeriod]);

  useEffect(() => {
    if (balance && usdPrice) {
      generatePortfolioData(balance);
    }
  }, [balance, usdPrice]);

  const healthScore = getWalletHealthScore();

  return (
    <Section>
      <div className="container mt-16">
        
        {/* Enhanced Header */}
        {account && (
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-4 lg:space-y-0">
            <div>
              <h2 className="h2 flex items-center">
                <AiOutlineFire className="text-color-1 mr-3" />
                Wallet Dashboard
              </h2>
              <p className="text-n-4 mt-2">
                Comprehensive overview of your DeFi activities and file storage
              </p>
            </div>
            <div className="flex space-x-3">
              <Button onClick={openEtherscan} className="flex items-center">
                <AiOutlineEye className="mr-2" />
                Etherscan
              </Button>
              <Button onClick={openMetaMaskDashboard} className="flex items-center">
                <AiOutlineExport className="mr-2" />
                MetaMask Dashboard
              </Button>
            </div>
          </div>
        )}

        {/* Wallet Health and Quick Stats */}
        {account && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-2xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Wallet Health</p>
                  <p className="text-2xl font-bold">{healthScore}%</p>
                </div>
                <AiOutlineTrophy className="text-2xl opacity-80" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-2xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Transactions</p>
                  <p className="text-2xl font-bold">{walletStats.totalTransactions || 0}</p>
                </div>
                <AiOutlineHistory className="text-2xl opacity-80" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-2xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Files Uploaded</p>
                  <p className="text-2xl font-bold">{walletStats.filesUploaded || 0}</p>
                </div>
                <AiOutlineCloudUpload className="text-2xl opacity-80" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-2xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Volume</p>
                  <p className="text-2xl font-bold">{walletStats.totalVolume || "0 ETH"}</p>
                </div>
                <AiOutlineRise className="text-2xl opacity-80" />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Enhanced Profile Card */}
          <div className="block relative p-0.5 bg-no-repeat bg-[length:100%_100%] lg:col-span-1 min-h-[36rem]" 
               style={{ backgroundImage: `url(/src/assets/benefits/card-1.svg)` }}>
            <div className="relative z-2 flex flex-col justify-center min-h-[36rem] p-[2.4rem] items-center text-center space-y-4">
              {account ? (
                <>
                  <div className="relative">
                    <img
                      src={notification2}
                      alt="Profile"
                      className="rounded-full w-20 h-20 border-4 border-color-1 shadow-lg"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  
                  <div className="text-center">
                    <h5 className="h6 text-color-1">Wallet Connected</h5>
                    <div className="flex items-center space-x-2 mt-2">
                      <p className="text-sm text-n-3">
                        {account.slice(0, 8)}...{account.slice(-6)}
                      </p>
                      <button onClick={copyAddress} className="text-color-1 hover:text-color-2 transition-colors">
                        <AiOutlineCopy />
                      </button>
                    </div>
                  </div>
                  
                  <div className="w-full space-y-3">
                    <div className="bg-n-7 rounded-xl p-4 relative overflow-hidden">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-n-4">ETH Balance</p>
                        <button 
                          onClick={() => setShowBalance(!showBalance)}
                          className="text-n-4 hover:text-color-1"
                        >
                          {showBalance ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
                        </button>
                      </div>
                      {showBalance ? (
                        <>
                          <p className="text-xl text-color-1 font-bold">{parseFloat(balance).toFixed(4)} ETH</p>
                          {usdPrice && (
                            <div className="flex items-center space-x-2 mt-1">
                              <p className="text-lg text-n-1 font-semibold">${(balance * usdPrice).toFixed(2)} USD</p>
                              <span className={`text-xs px-2 py-1 rounded-full ${priceChange.change >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                {priceChange.change >= 0 ? <AiOutlineRise className="inline mr-1" /> : <AiOutlineFall className="inline mr-1" />}
                                {Math.abs(priceChange.percentage).toFixed(2)}%
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-xl text-n-3">••••••••</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {networkInfo && (
                        <div className="bg-n-7 rounded-xl p-3">
                          <p className="text-xs text-n-4">Network</p>
                          <p className="text-sm text-n-1 font-medium">{getNetworkName(networkInfo.chainId)}</p>
                        </div>
                      )}
                      
                      {gasPrice && (
                        <div className="bg-n-7 rounded-xl p-3">
                          <p className="text-xs text-n-4">Gas Price</p>
                          <p className="text-sm text-n-1 font-medium">{parseFloat(gasPrice).toFixed(1)} Gwei</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Wallet Age and Stats */}
                    <div className="bg-n-7 rounded-xl p-3">
                      <p className="text-xs text-n-4 mb-2">Wallet Statistics</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-n-4">Age</p>
                          <p className="text-n-1 font-medium">{walletStats.walletAge || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-n-4">Storage Used</p>
                          <p className="text-n-1 font-medium">{walletStats.totalStorage || "0 GB"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Quick Actions */}
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <button className="flex items-center justify-center px-4 py-3 bg-color-1 text-n-8 rounded-xl text-sm hover:bg-color-2 transition-colors">
                      <AiOutlineSend className="mr-2" />
                      Send
                    </button>
                    <button className="flex items-center justify-center px-4 py-3 bg-color-1 text-n-8 rounded-xl text-sm hover:bg-color-2 transition-colors">
                      <AiOutlineSwap className="mr-2" />
                      Swap
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center space-y-4">
                    <img
                      src={notification2}
                      alt="Connect"
                      className="rounded-full w-24 h-24 border-4 border-color-1 shadow-lg mx-auto opacity-50"
                    />
                    <h5 className="h5">Connect Your Wallet</h5>
                    <p className="body-2 text-n-3">
                      Access your comprehensive dashboard and manage your DeFi activities.
                    </p>
                    <Button onClick={connectWallet} disabled={loading}>
                      {loading ? "Connecting..." : "Connect Wallet"}
                    </Button>
                  </div>
                </>
              )}
            </div>
            <GradientLight />
            <div className="absolute inset-0.5 bg-n-8" style={{ clipPath: "url(#benefits)" }}></div>
            <ClipPath />
          </div>

          {/* Enhanced Chart Card with Time Period Selection */}
          <div className="block relative p-0.5 bg-no-repeat bg-[length:100%_100%] lg:col-span-2 min-h-[36rem]"
               style={{ backgroundImage: `url(/src/assets/benefits/card-2.svg)` }}>
            <div className="relative z-2 flex flex-col min-h-[36rem] p-[2.4rem]">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
                <div>
                  <h5 className="h5 mb-2">ETH Price Chart</h5>
                  {usdPrice && (
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl font-bold text-color-1">${usdPrice.toLocaleString()}</span>
                      <span className={`text-sm px-2 py-1 rounded-full ${priceChange.change >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {priceChange.change >= 0 ? '+' : ''}{priceChange.percentage.toFixed(2)}%
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Time Period Selector */}
                <div className="flex bg-n-7 rounded-xl p-1 mt-4 lg:mt-0">
                  {timePeriods.map((period) => (
                    <button
                      key={period.value}
                      onClick={() => setSelectedPeriod(period.value)}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        selectedPeriod === period.value
                          ? 'bg-color-1 text-n-8'
                          : 'text-n-3 hover:text-n-1'
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {chartData.length > 0 ? (
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorUsd" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00f5d4" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#00f5d4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="time" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#8B9DC3', fontSize: 12 }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#8B9DC3', fontSize: 12 }}
                        domain={['auto', 'auto']}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1A1D29',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="usd"
                        stroke="#00f5d4"
                        strokeWidth={3}
                        fill="url(#colorUsd)"
                        dot={false}
                        activeDot={{ r: 6, stroke: '#00f5d4', strokeWidth: 2, fill: '#1A1D29' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="body-2 text-n-3">Loading chart data...</p>
                </div>
              )}
            </div>
            <GradientLight />
            <div className="absolute inset-0.5 bg-n-8" style={{ clipPath: "url(#benefits)" }}></div>
            <ClipPath />
          </div>
        </div>

        {/* Enhanced Second Row with Tabs */}
        {account && (
          <div className="mt-8">
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-n-7 rounded-xl p-1 mb-6 overflow-x-auto">
              {[
                { id: 'overview', label: 'Portfolio Overview', icon: AiOutlineTrophy },
                { id: 'transactions', label: 'Recent Transactions', icon: AiOutlineHistory },
                { id: 'activity', label: 'File Activity', icon: AiOutlineCloudUpload },
                { id: 'analytics', label: 'Analytics', icon: AiOutlineRise },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-3 text-sm rounded-lg transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-color-1 text-n-8'
                      : 'text-n-3 hover:text-n-1'
                  }`}
                >
                  <tab.icon className="mr-2" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Portfolio Overview Tab */}
              {activeTab === 'overview' && (
                <>
                  <div className="block relative p-0.5 bg-no-repeat bg-[length:100%_100%]"
                       style={{ backgroundImage: `url(/src/assets/benefits/card-3.svg)` }}>
                    <div className="relative z-2 p-[2.4rem]">
                      <h5 className="h5 mb-4 flex items-center">
                        <AiOutlineTrophy className="mr-2 text-color-1" />
                        Portfolio Breakdown
                      </h5>
                      {portfolioData.length > 0 ? (
                        <div className="space-y-4">
                          <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                              <Pie
                                data={portfolioData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={70}
                                innerRadius={30}
                                paddingAngle={2}
                              >
                                {portfolioData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="space-y-3">
                            {portfolioData.map((item, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-n-7 rounded-xl">
                                <div className="flex items-center">
                                  <div 
                                    className="w-4 h-4 rounded-full mr-3" 
                                    style={{ backgroundColor: item.color }}
                                  ></div>
                                  <div>
                                    <span className="text-sm font-medium text-n-1">{item.name}</span>
                                    <p className="text-xs text-n-4">{item.amount}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-sm font-medium text-n-1">
                                    {item.name === 'ETH' || item.name === 'USDC' ? `$${item.value.toFixed(2)}` : item.value}
                                  </span>
                                  <p className="text-xs text-n-4">{item.percentage}%</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-n-3">Loading portfolio data...</p>
                      )}
                    </div>
                    <GradientLight />
                    <div className="absolute inset-0.5 bg-n-8" style={{ clipPath: "url(#benefits)" }}></div>
                    <ClipPath />
                  </div>

                  <div className="block relative p-0.5 bg-no-repeat bg-[length:100%_100%]"
                       style={{ backgroundImage: `url(/src/assets/benefits/card-4.svg)` }}>
                    <div className="relative z-2 p-[2.4rem]">
                      <h5 className="h5 mb-4 flex items-center">
                        <AiOutlineInfoCircle className="mr-2 text-color-1" />
                        Wallet Insights
                      </h5>
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-4 rounded-xl">
                          <h6 className="text-sm font-semibold text-n-1 mb-2">Performance Score</h6>
                          <div className="flex items-center space-x-3">
                            <div className="flex-1 bg-n-7 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                                style={{ width: `${healthScore}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-bold text-color-1">{healthScore}%</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-n-7 p-3 rounded-xl">
                            <p className="text-xs text-n-4">NFTs Owned</p>
                            <p className="text-lg font-bold text-n-1">{walletStats.nftCount || 0}</p>
                          </div>
                          <div className="bg-n-7 p-3 rounded-xl">
                            <p className="text-xs text-n-4">DeFi Interactions</p>
                            <p className="text-lg font-bold text-n-1">{walletStats.defiInteractions || 0}</p>
                          </div>
                          <div className="bg-n-7 p-3 rounded-xl">
                            <p className="text-xs text-n-4">Total Fees Paid</p>
                            <p className="text-lg font-bold text-n-1">{walletStats.totalFees || "0 ETH"}</p>
                          </div>
                          <div className="bg-n-7 p-3 rounded-xl">
                            <p className="text-xs text-n-4">Highest Balance</p>
                            <p className="text-lg font-bold text-n-1">{walletStats.highestBalance || "0 ETH"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <GradientLight />
                    <div className="absolute inset-0.5 bg-n-8" style={{ clipPath: "url(#benefits)" }}></div>
                    <ClipPath />
                  </div>
                </>
              )}

              {/* Transactions Tab */}
              {activeTab === 'transactions' && (
                <div className="lg:col-span-2">
                  <div className="block relative p-0.5 bg-no-repeat bg-[length:100%_100%]"
                       style={{ backgroundImage: `url(/src/assets/benefits/card-3.svg)` }}>
                    <div className="relative z-2 p-[2.4rem]">
                      <div className="flex items-center justify-between mb-6">
                        <h5 className="h5 flex items-center">
                          <AiOutlineHistory className="mr-2 text-color-1" />
                          Transaction History
                        </h5>
                        <Button onClick={openMetaMaskDashboard} className="text-sm">
                          <AiOutlineLink className="mr-2" />
                          View All
                        </Button>
                      </div>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {transactions.map((tx, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-n-7 rounded-xl hover:bg-n-6 transition-colors">
                            <div className="flex items-center space-x-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                tx.type === 'Send' ? 'bg-red-100 text-red-600' :
                                tx.type === 'Receive' ? 'bg-green-100 text-green-600' :
                                'bg-blue-100 text-blue-600'
                              }`}>
                                {tx.type === 'Send' ? <AiOutlineSend /> :
                                 tx.type === 'Receive' ? <AiOutlineDownload /> :
                                 <AiOutlineSwap />}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-n-1">{tx.type}</p>
                                <p className="text-xs text-n-4">{tx.time}</p>
                                <p className="text-xs text-n-4">
                                  {tx.to && `To: ${typeof tx.to === 'string' && tx.to.startsWith('0x') ? tx.to.slice(0,6)+'...'+tx.to.slice(-4) : tx.to}`}
                                  {tx.from && `From: ${tx.from}`}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-n-1">{tx.amount}</p>
                              <p className="text-xs text-green-400">{tx.status}</p>
                              <p className="text-xs text-n-4">Fee: {tx.fee}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <GradientLight />
                    <div className="absolute inset-0.5 bg-n-8" style={{ clipPath: "url(#benefits)" }}></div>
                    <ClipPath />
                  </div>
                </div>
              )}

              {/* Activity Tab */}
              {activeTab === 'activity' && (
                <>
                  <div className="block relative p-0.5 bg-no-repeat bg-[length:100%_100%]"
                       style={{ backgroundImage: `url(/src/assets/benefits/card-3.svg)` }}>
                    <div className="relative z-2 p-[2.4rem]">
                      <h5 className="h5 mb-4 flex items-center">
                        <AiOutlineCloudUpload className="mr-2 text-color-1" />
                        File Activity (7 Days)
                      </h5>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={activityData}>
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="uploads" fill="#00D4FF" name="Uploads" />
                          <Bar dataKey="downloads" fill="#FF6B9D" name="Downloads" />
                          <Bar dataKey="shares" fill="#FFA500" name="Shares" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <GradientLight />
                    <div className="absolute inset-0.5 bg-n-8" style={{ clipPath: "url(#benefits)" }}></div>
                    <ClipPath />
                  </div>

                  <div className="block relative p-0.5 bg-no-repeat bg-[length:100%_100%]"
                       style={{ backgroundImage: `url(/src/assets/benefits/card-4.svg)` }}>
                    <div className="relative z-2 p-[2.4rem]">
                      <h5 className="h5 mb-4 flex items-center">
                        <AiOutlineShareAlt className="mr-2 text-color-1" />
                        Storage Statistics
                      </h5>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-xl">
                            <AiOutlineCloudUpload className="text-2xl text-purple-400 mb-2" />
                            <p className="text-lg font-bold text-n-1">{walletStats.filesUploaded || 0}</p>
                            <p className="text-xs text-n-4">Files Uploaded</p>
                          </div>
                          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-4 rounded-xl">
                            <AiOutlineShareAlt className="text-2xl text-blue-400 mb-2" />
                            <p className="text-lg font-bold text-n-1">{walletStats.filesShared || 0}</p>
                            <p className="text-xs text-n-4">Files Shared</p>
                          </div>
                        </div>
                        
                        <div className="bg-n-7 p-4 rounded-xl">
                          <p className="text-sm text-n-4 mb-2">Storage Usage</p>
                          <div className="flex items-center space-x-3">
                            <div className="flex-1 bg-n-6 rounded-full h-3">
                              <div className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full" style={{ width: '35%' }}></div>
                            </div>
                            <span className="text-sm font-medium text-n-1">{walletStats.totalStorage || "0 GB"} / 10 GB</span>
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 p-4 rounded-xl">
                          <h6 className="text-sm font-semibold text-n-1 mb-2">Monthly Activity</h6>
                          <div className="text-xs text-n-4 space-y-1">
                            <p>• 15 files uploaded this month</p>
                            <p>• 8 files shared with others</p>
                            <p>• 45 downloads by shared users</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <GradientLight />
                    <div className="absolute inset-0.5 bg-n-8" style={{ clipPath: "url(#benefits)" }}></div>
                    <ClipPath />
                  </div>
                </>
              )}

              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Performance Metrics */}
                    <div className="block relative p-0.5 bg-no-repeat bg-[length:100%_100%]"
                         style={{ backgroundImage: `url(/src/assets/benefits/card-3.svg)` }}>
                      <div className="relative z-2 p-[2.4rem]">
                        <h5 className="h5 mb-4 flex items-center">
                          <AiOutlineRise className="mr-2 text-color-1" />
                          Performance Metrics
                        </h5>
                        <div className="space-y-4">
                          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-xl">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-n-4">Portfolio Growth</p>
                                <p className="text-xl font-bold text-n-1">+12.5%</p>
                              </div>
                              <AiOutlineRise className="text-2xl text-green-400" />
                            </div>
                          </div>
                          
                          <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 p-4 rounded-xl">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-n-4">Avg. Gas Efficiency</p>
                                <p className="text-xl font-bold text-n-1">95.2%</p>
                              </div>
                              <AiOutlineTrophy className="text-2xl text-blue-400" />
                            </div>
                          </div>
                          
                          <div className="bg-gradient-to-r from-purple-500/20 to-violet-500/20 p-4 rounded-xl">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-n-4">File Engagement</p>
                                <p className="text-xl font-bold text-n-1">78%</p>
                              </div>
                              <AiOutlineShareAlt className="text-2xl text-purple-400" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <GradientLight />
                      <div className="absolute inset-0.5 bg-n-8" style={{ clipPath: "url(#benefits)" }}></div>
                      <ClipPath />
                    </div>

                    {/* Advanced Stats */}
                    <div className="block relative p-0.5 bg-no-repeat bg-[length:100%_100%]"
                         style={{ backgroundImage: `url(/src/assets/benefits/card-4.svg)` }}>
                      <div className="relative z-2 p-[2.4rem]">
                        <h5 className="h5 mb-4 flex items-center">
                          <AiOutlineInfoCircle className="mr-2 text-color-1" />
                          Advanced Analytics
                        </h5>
                        <div className="space-y-4">
                          <div className="bg-n-7 p-4 rounded-xl">
                            <p className="text-sm font-semibold text-n-1 mb-3">Transaction Pattern Analysis</p>
                            <div className="space-y-2 text-xs text-n-4">
                              <div className="flex justify-between">
                                <span>Peak Activity Time:</span>
                                <span className="text-n-1">2-4 PM UTC</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Most Active Day:</span>
                                <span className="text-n-1">Tuesday</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Avg Transaction Size:</span>
                                <span className="text-n-1">0.15 ETH</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-n-7 p-4 rounded-xl">
                            <p className="text-sm font-semibold text-n-1 mb-3">Risk Assessment</p>
                            <div className="flex items-center space-x-3">
                              <div className="flex-1 bg-n-6 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                              </div>
                              <span className="text-xs font-medium text-green-400">Low Risk</span>
                            </div>
                          </div>
                          
                          <div className="bg-n-7 p-4 rounded-xl">
                            <p className="text-sm font-semibold text-n-1 mb-3">Network Efficiency</p>
                            <div className="text-xs text-n-4 space-y-1">
                              <p>• Optimal gas usage: 92%</p>
                              <p>• Failed transactions: 2%</p>
                              <p>• Network congestion avoided: 87%</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <GradientLight />
                      <div className="absolute inset-0.5 bg-n-8" style={{ clipPath: "url(#benefits)" }}></div>
                      <ClipPath />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
};

export default Profile;
