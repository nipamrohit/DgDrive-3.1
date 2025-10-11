import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  AiOutlineCloud,
  AiOutlineShareAlt,
  AiOutlineRocket,
  AiOutlineLock,
  AiOutlineGlobal,
  AiOutlineCheckCircle,
  AiOutlineArrowRight,
  AiOutlineDownload,
  AiOutlineTeam,
  AiOutlineEye,
  AiOutlineStar,
  AiOutlineHeart,
  AiOutlineThunderbolt,
  AiOutlineDatabase,
  AiOutlineSafety,
  AiOutlineCloudServer,
  AiOutlineFileProtect
} from "react-icons/ai";

const Home = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [realMousePosition, setRealMousePosition] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();

  // Mouse tracking for bubbles and parallax effects
  useEffect(() => {
    const updateMousePosition = (e) => {
      // For parallax effects (normalized)
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
      
      // For mouse-following bubbles (real coordinates)
      setRealMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener("mousemove", updateMousePosition);
    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, []);

  // Continuously moving particles
  const ContinuousParticles = ({ density = 150 }) => {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(density)].map((_, i) => {
          const size = Math.random() * 3 + 1;
          const opacity = Math.random() * 0.4 + 0.1;
          const speed = Math.random() * 20 + 10;
          
          return (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                background: `rgba(124, 58, 237, ${opacity})`,
              }}
              initial={{
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 50,
              }}
              animate={{
                y: -50,
                x: [
                  Math.random() * window.innerWidth,
                  Math.random() * window.innerWidth + (Math.random() - 0.5) * 100,
                  Math.random() * window.innerWidth,
                ],
              }}
              transition={{
                y: {
                  duration: speed,
                  repeat: Infinity,
                  ease: "linear",
                },
                x: {
                  duration: speed / 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
            />
          );
        })}
      </div>
    );
  };

  // Mouse-following bubbles from previous project
  const MouseFollowingBubbles = () => {
    return (
      <div className="fixed inset-0 pointer-events-none z-10">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-color-1/10"
            style={{
              width: `${60 + i * 20}px`,
              height: `${60 + i * 20}px`,
              background: `radial-gradient(circle, rgba(124, 58, 237, ${0.05 - i * 0.005}) 0%, transparent 70%)`,
            }}
            animate={{
              x: realMousePosition.x - (30 + i * 10),
              y: realMousePosition.y - (30 + i * 10),
            }}
            transition={{
              type: "spring",
              damping: 10 + i * 2,
              stiffness: 50 - i * 2,
              mass: 0.5 + i * 0.1,
            }}
          />
        ))}
        
        {/* Central glowing dot */}
        <motion.div
          className="absolute w-2 h-2 bg-color-1/60 rounded-full"
          animate={{
            x: realMousePosition.x - 4,
            y: realMousePosition.y - 4,
          }}
          transition={{
            type: "spring",
            damping: 8,
            stiffness: 100,
          }}
        />
      </div>
    );
  };

  // Enhanced grid with thunderbolt pattern
  const ThunderboltGrid = () => (
    <div className="fixed inset-0 pointer-events-none opacity-5 z-0">
      <div 
        className="w-full h-full relative"
        style={{
          transform: `translate(${mousePosition.x * 5}px, ${mousePosition.y * 5}px)`,
        }}
      >
        {/* Thunderbolt SVG pattern */}
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <pattern
              id="thunderboltPattern"
              x="0"
              y="0"
              width="120"
              height="120"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M30 20 L50 20 L40 50 L60 50 L30 90 L45 60 L25 60 Z"
                stroke="rgba(124, 58, 237, 0.2)"
                strokeWidth="1"
                fill="none"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#thunderboltPattern)" />
        </svg>
      </div>
    </div>
  );

  const features = [
    {
      icon: AiOutlineDatabase,
      title: "DECENTRALIZED STORAGE",
      subtitle: "Distributed Network",
      description: "Files stored across multiple nodes ensuring 99.9% uptime and redundancy"
    },
    {
      icon: AiOutlineSafety,
      title: "MILITARY-GRADE ENCRYPTION",
      subtitle: "End-to-End Security",
      description: "256-bit AES encryption with blockchain verification for ultimate protection"
    },
    {
      icon: AiOutlineRocket,
      title: "LIGHTNING FAST ACCESS",
      subtitle: "Global CDN Network",
      description: "Instant file access from 150+ edge locations worldwide"
    },
    {
      icon: AiOutlineGlobal,
      title: "UNIVERSAL COMPATIBILITY",
      subtitle: "Cross-Platform Support",
      description: "Works seamlessly across all devices and operating systems"
    }
  ];

  const stats = [
    { number: "10M+", label: "FILES STORED" },
    { number: "1200", label: "ACTIVE NODES" },
    { number: "5+", label: "YEARS UPTIME" }
  ];

  const securityFeatures = [
    {
      icon: AiOutlineFileProtect,
      title: "Immutable Storage",
      description: "Files are permanently stored with cryptographic hashes preventing tampering"
    },
    {
      icon: AiOutlineCloudServer,
      title: "Distributed Architecture",
      description: "No single point of failure with data replicated across global infrastructure"
    },
    {
      icon: AiOutlineLock,
      title: "Private by Design",
      description: "Zero-knowledge architecture ensures only you can access your data"
    },
    {
      icon: AiOutlineSafety,
      title: "Quantum-Resistant",
      description: "Future-proof encryption algorithms resistant to quantum computing attacks"
    }
  ];

  return (
    <div className="min-h-screen bg-n-8 text-white overflow-hidden">
      <ThunderboltGrid />
      <ContinuousParticles density={200} />
      <MouseFollowingBubbles />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <motion.div
            className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full filter blur-3xl"
            style={{ 
              background: 'radial-gradient(circle, rgba(124, 58, 237, 0.12) 0%, transparent 70%)',
              transform: 'translate(-50%, -50%)'
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full filter blur-2xl"
            style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)' }}
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            {/* Main Title */}
            <motion.h1 
              className="text-6xl md:text-8xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <span className="block text-n-4 text-2xl md:text-3xl font-light mb-4 tracking-wider">
                DECENTRALIZED STORAGE
              </span>
              <span className="block bg-gradient-to-r from-white via-color-1 to-color-2 bg-clip-text text-transparent">
                THROUGH AI-DRIVEN
              </span>
              <span className="block text-white">
                ADVANCEMENTS
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-lg md:text-xl text-n-3 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Experience the future of file storage with blockchain-powered security,
              AI-optimized performance, and decentralized reliability.
            </motion.p>

            {/* Hero Icon with Thunderbolt */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
              className="relative mb-16"
            >
              <div className="w-24 h-24 mx-auto border-2 border-color-1/30 rounded-2xl flex items-center justify-center bg-color-1/10 relative overflow-hidden">
                <AiOutlineThunderbolt className="text-4xl text-color-1 relative z-10" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-color-1/20 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
              <div className="absolute inset-0 border-2 border-color-1/20 rounded-2xl animate-ping" />
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="grid grid-cols-3 gap-8 md:gap-16 mb-16"
            >
              {stats.map((stat, index) => (
                <motion.div 
                  key={index} 
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="text-3xl md:text-5xl font-bold text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-n-4 tracking-wider">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <Link to="/profile">
                <motion.button
                  className="group relative px-12 py-4 bg-gradient-to-r from-color-1 to-color-2 rounded-xl font-semibold text-lg tracking-wider border border-color-1/30 overflow-hidden"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <span className="relative z-10 flex items-center justify-center gap-3 text-n-8">
                    GET STARTED
                    <AiOutlineArrowRight className="group-hover:translate-x-1 transition-transform duration-200" />
                  </span>
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-n-4 block text-lg tracking-widest mb-4">SMARTER, SAFER,</span>
              <span className="text-white">FASTER FILES</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="group relative"
                whileHover={{ y: -10 }}
              >
                <div className="relative p-8 border border-n-6 rounded-2xl bg-n-7/50 backdrop-blur-sm hover:border-color-1/30 transition-all duration-300 h-full">
                  <motion.div
                    className="w-16 h-16 border border-color-1/30 rounded-xl flex items-center justify-center mb-6 group-hover:border-color-1/50 transition-colors duration-300 relative overflow-hidden"
                    whileHover={{ rotate: 5 }}
                  >
                    <feature.icon className="text-2xl text-color-1 relative z-10" />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-color-1/10 to-transparent"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </motion.div>

                  <h3 className="text-lg font-bold text-white mb-2 tracking-wide">
                    {feature.title}
                  </h3>
                  <p className="text-color-1 text-sm mb-4 font-medium">
                    {feature.subtitle}
                  </p>
                  <p className="text-n-3 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Everything You Need Section */}
      <section className="py-32 relative z-10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              <span className="text-n-4 block text-lg tracking-widest mb-4">EVERYTHING YOU NEED</span>
              IN ONE PLATFORM
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {securityFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="group text-center"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div 
                  className="w-20 h-20 border border-n-6 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:border-color-1/50 transition-colors duration-300 relative overflow-hidden"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <feature.icon className="text-3xl text-color-1 relative z-10" />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-color-1/10 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-n-3 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Unified Crypto Ecosystem */}
      <section className="py-32 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
              <span className="text-n-4 block text-lg tracking-widest mb-4">UNIFIED CRYPTO</span>
              ECOSYSTEM
            </h2>
            <p className="text-xl text-n-3 max-w-3xl mx-auto leading-relaxed">
              Built on cutting-edge blockchain technology with seamless integration 
              across multiple networks and protocols.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              {[
                { color: "bg-color-1", text: "Ethereum Integration" },
                { color: "bg-color-2", text: "IPFS Protocol" },
                { color: "bg-color-3", text: "Smart Contracts" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-4 p-4 border border-n-6 rounded-xl bg-n-7/30"
                  whileHover={{ x: 10, backgroundColor: "rgba(124, 58, 237, 0.05)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className={`w-8 h-8 ${item.color} rounded-lg`}></div>
                  <span className="text-white font-medium">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              viewport={{ once: true }}
              className="flex items-center justify-center"
            >
              <div className="relative">
                <motion.div 
                  className="w-32 h-32 border-2 border-color-1/30 rounded-full flex items-center justify-center"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 1 }}
                >
                  <div className="w-20 h-20 bg-gradient-to-r from-color-1 to-color-2 rounded-full flex items-center justify-center relative overflow-hidden">
                    <AiOutlineThunderbolt className="text-3xl text-white relative z-10" />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                </motion.div>
                <div className="absolute inset-0 border-2 border-color-1/20 rounded-full animate-ping"></div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              {[
                { color: "bg-color-4", text: "Cross-Chain Support" },
                { color: "bg-color-5", text: "DeFi Integration" },
                { color: "bg-color-6", text: "Token Rewards" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-4 p-4 border border-n-6 rounded-xl bg-n-7/30"
                  whileHover={{ x: -10, backgroundColor: "rgba(124, 58, 237, 0.05)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className={`w-8 h-8 ${item.color} rounded-lg`}></div>
                  <span className="text-white font-medium">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

     
      {/* Final CTA Section */}
      <section className="py-32 relative z-10">
        <div className="max-w-4xl mx-auto text-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
              <span className="text-n-4 block text-lg tracking-widest mb-4">UNLOCK YOUR</span>
              POTENTIAL WITH DGDRIVE
            </h2>
            <p className="text-xl text-n-3 mb-12 max-w-2xl mx-auto">
              Join thousands of users who have transformed their file storage experience
              with our decentralized platform.
            </p>
            
            <Link to="/profile">
              <motion.button
                className="group relative px-12 py-5 bg-gradient-to-r from-color-1 to-color-2 rounded-2xl font-bold text-xl tracking-wider text-n-8 overflow-hidden"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-color-2 to-color-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ filter: 'blur(12px)' }}
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                <span className="relative z-10 flex items-center gap-3">
                  <AiOutlineRocket />
                  GET STARTED
                </span>
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
