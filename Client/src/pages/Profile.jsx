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
} from "recharts";

const Profile = () => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [usdPrice, setUsdPrice] = useState(null);
  const [chartData, setChartData] = useState([]);

  const connectedAccounts =
    JSON.parse(sessionStorage.getItem("connectedAccounts")) || [];

  const connectWallet = async () => {
    if (!window.ethereum) return alert("MetaMask not detected!");

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();

      setAccount(address);

      if (!connectedAccounts.includes(address)) {
        connectedAccounts.push(address);
        sessionStorage.setItem(
          "connectedAccounts",
          JSON.stringify(connectedAccounts)
        );
      }

      const bal = await provider.getBalance(address);
      setBalance(ethers.utils.formatEther(bal));

      fetchEthPrice();
      fetchChartData();
    } catch (err) {
      console.error("Connection Error:", err);
    }
  };

  const fetchEthPrice = async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
      );
      const data = await res.json();
      setUsdPrice(data.ethereum.usd);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchChartData = async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=7&interval=daily"
      );
      const data = await res.json();
      const formattedData = data.prices.map((item) => {
        const date = new Date(item[0]);
        return {
          day: date.toLocaleDateString("en-US", { weekday: "short" }),
          usd: item[1],
          eth: (item[1] / (usdPrice || item[1])).toFixed(4),
        };
      });
      setChartData(formattedData);
    } catch (err) {
      console.error(err);
    }
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      alert("Address copied!");
    }
  };

useEffect(() => {
  if (!window.ethereum) return;

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      setAccount(null);
      setBalance(null);
      return;
    }
    const newAccount = accounts[0];
    setAccount(newAccount);

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const bal = await provider.getBalance(newAccount);
    setBalance(ethers.utils.formatEther(bal));

    // Update sessionStorage
    let storedAccounts = JSON.parse(sessionStorage.getItem("connectedAccounts")) || [];
    if (!storedAccounts.includes(newAccount)) {
      storedAccounts.push(newAccount);
      sessionStorage.setItem("connectedAccounts", JSON.stringify(storedAccounts));
    }

    fetchEthPrice();
    fetchChartData();
  };

  // Initial load
  window.ethereum
    .request({ method: "eth_accounts" })
    .then(handleAccountsChanged)
    .catch(console.error);

  // Listen for account changes
  window.ethereum.on("accountsChanged", handleAccountsChanged);

  // Reload on network change
  window.ethereum.on("chainChanged", () => window.location.reload());

  return () => {
    window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    window.ethereum.removeAllListeners("chainChanged");
  };
}, []);


  return (
    <Section>
      <div className="container grid grid-cols-1 lg:grid-cols-3 gap-10 mt-16">
        {/* Profile Card */}
        <div
          className="block relative p-0.5 bg-no-repeat bg-[length:100%_100%] lg:col-span-1 min-h-[36rem]"
          style={{
            backgroundImage: `url(/src/assets/benefits/card-1.svg)`,
          }}
        >
          <div className="relative z-2 flex flex-col justify-center min-h-[36rem] p-[2.4rem] items-center text-center space-y-6">
            {account ? (
              <>
                <img
                  src={notification2}
                  alt="Profile"
                  className="rounded-full w-32 h-32 border-4 border-color-1 shadow-lg"
                />
                <h5 className="h5 mt-4">Wallet Connected</h5>
                <p className="body-2 text-n-3">
                  {account.slice(0, 6)}...{account.slice(-4)}
                  <button
                    onClick={copyAddress}
                    className="ml-2 text-color-1 font-bold hover:underline"
                  >
                    Copy
                  </button>
                </p>
                <p className="body-2">
                  Balance: <span className="text-color-1">{balance} ETH</span>
                </p>
                {usdPrice && (
                  <p className="body-2 mb-2">
                    (~ ${(balance * usdPrice).toFixed(2)} USD)
                  </p>
                )}
              </>
            ) : (
              <>
                <h5 className="h5 mb-3">Connect Your Wallet</h5>
                <p className="body-2 text-n-3 mb-4">
                  Access your profile and manage your uploads.
                </p>
                <Button onClick={connectWallet}>Connect Wallet</Button>
              </>
            )}
          </div>

          <GradientLight />
          <div
            className="absolute inset-0.5 bg-n-8"
            style={{ clipPath: "url(#benefits)" }}
          ></div>
          <ClipPath />
        </div>

        {/* Chart Card */}
        <div
          className="block relative p-0.5 bg-no-repeat bg-[length:100%_100%] lg:col-span-2 min-h-[36rem]"
          style={{
            backgroundImage: `url(/src/assets/benefits/card-2.svg)`,
          }}
        >
          <div className="relative z-2 flex flex-col min-h-[36rem] p-[2.4rem]">
            <h5 className="h5 mb-6">ETH Price (Last 7 Days)</h5>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <XAxis dataKey="day" />
                  <YAxis
                    yAxisId="left"
                    domain={["auto", "auto"]}
                    label={{ value: "USD", angle: -90, position: "insideLeft" }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={["auto", "auto"]}
                    label={{ value: "ETH", angle: 90, position: "insideRight" }}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="usd"
                    stroke="#00f5d4"
                    strokeWidth={2}
                    dot={false}
                    name="Price (USD)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="eth"
                    stroke="#ff6ec7"
                    strokeWidth={2}
                    dot={false}
                    name="Price (ETH)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="body-2 text-n-3">Loading chart...</p>
            )}
          </div>

          <GradientLight />
          <div
            className="absolute inset-0.5 bg-n-8"
            style={{ clipPath: "url(#benefits)" }}
          ></div>
          <ClipPath />
        </div>
      </div>
    </Section>
  );
};

export default Profile;
