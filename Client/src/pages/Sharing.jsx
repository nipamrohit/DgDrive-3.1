import React, { useState, useEffect } from "react";
import Section from "../components/Section";
import Button from "../components/Button";
import { grid } from "../assets";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config";

const Sharing = () => {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [accessList, setAccessList] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

  // Fetch list of users you’ve shared with
  const fetchAccessList = async () => {
    if (!window.ethereum) return;
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const list = await contract.shareAccess();
      setAccessList(list);
    } catch (err) {
      console.error("Error fetching access list:", err);
    }
  };

  // Grant access to entered address
  const handleGrantAccess = async (targetAddress) => {
    const addr = targetAddress || address;
    if (!addr.trim()) return alert("Enter a valid address");
    if (!window.ethereum) return alert("MetaMask not found");

    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.allow(addr, { gasLimit: 500000 });
      await tx.wait();

      alert("Access granted successfully!");
      setAddress("");
      fetchAccessList();
    } catch (err) {
      console.error("Grant access error:", err);
      alert("Transaction failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  // Filter suggestions as user types
  const handleAddressChange = (e) => {
    const input = e.target.value;
    setAddress(input);
    const filtered = accessList.filter((item) =>
      item.user.toLowerCase().includes(input.toLowerCase())
    );
    setFilteredSuggestions(filtered);
  };

  useEffect(() => {
    fetchAccessList();
  }, []);

  return (
    <Section className="overflow-hidden">
      <div className="container">
        <h1 className="text-center h3 mb-10">Share Your Files</h1>

        {/* Grant Access */}
        <div className="relative p-10 rounded-[2.5rem] bg-n-8 overflow-hidden mb-12">
          <div className="absolute top-0 left-0 max-w-full opacity-40">
            <img src={grid} alt="Grid" className="w-full" />
          </div>

          <div className="relative z-10 text-center">
            <p className="text-lg mb-4 text-n-3">Enter or select an address to grant access</p>

            <input
              type="text"
              value={address}
              onChange={handleAddressChange}
              placeholder="0x1234...abcd"
              className="p-3 rounded-lg w-full md:w-1/2 mb-2 text-n-1 border border-n-4"
            />

            {/* Suggestions from previously shared addresses */}
            {filteredSuggestions.length > 0 && address && (
              <div className="bg-n-6 rounded-lg text-left p-3 max-h-48 overflow-y-auto md:w-1/2 mx-auto mb-4">
                {filteredSuggestions.map((s, idx) => (
                  <div
                    key={idx}
                    className="cursor-pointer hover:bg-n-7 p-2 rounded"
                    onClick={() => handleGrantAccess(s.user)}
                  >
                    {s.user} {s.access ? "(Already Granted)" : "(Revoked before)"}
                  </div>
                ))}
              </div>
            )}

            <div>
              <Button onClick={() => handleGrantAccess()} disabled={loading}>
                {loading ? "Granting..." : "Grant Access"}
              </Button>
            </div>
          </div>
        </div>

        {/* Access List */}
        <div className="relative p-10 rounded-[2.5rem] bg-n-8 overflow-hidden">
          <h2 className="text-center h4 mb-6">Users with Access</h2>
          {accessList.length === 0 ? (
            <p className="text-center text-n-3">No users have access yet.</p>
          ) : (
            <ul className="space-y-4">
              {accessList.map((item, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center p-4 bg-n-6 rounded-lg"
                >
                  <span>{item.user}</span>
                  {item.access && (
                    <span className="text-green-400 font-medium">Access Granted</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Section>
  );
};

export default Sharing;
