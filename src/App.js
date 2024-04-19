
import './App.css';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import config from './config.json'


import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadTokens,
  loadExchange,
  loadAllOrders,
  subscribeToEvents
} from './store/interactions';

import Navbar from './components/Navbar';
import Markets from './components/Markets';
import Balance from './components/Balance';
import Order from './components/Order';
import OrderBook from './components/OrderBook';
import PriceChart from './components/PriceChart';
import Trades from './components/Trade';
import Transactions from './components/Transactions';
import Alert from './components/Alert';

function App() {

  const dispatch = useDispatch()

  const loadBlockchainData = async () => {
    
    // Connect Ethers to blockchain
    const provider = loadProvider(dispatch)
    
    // Fetch current network's chainId (e.g. hardhat: 31337, kovan: 42)
    const chainId = await loadNetwork(provider, dispatch)
    // console.log(chainId)

    // Reload page when network changes
    window.ethereum.on('chainChanged', () => {   // It will execute any way, either changing network from metamask or from interface select network.
      window.location.reload()
    })

    // Fetch current account & balance from Metamask when changed
    window.ethereum.on('accountsChanged', () => {
      loadAccount(provider, dispatch)
    })
    
    // Fetch current account & balance from Metamask
    // await loadAccount(provider, dispatch)

    // Load token smart contracts
    const mCoin = config[chainId].mCoin
    const mETH = config[chainId].mETH

    let k = await loadTokens(provider, [mCoin.address, mETH.address], dispatch)
    console.log("Loaded TOKENS", k)

    // Load exchange smart contract
    const exchangeConfig = config[chainId].exchange
    const exchange = await loadExchange(provider, exchangeConfig.address, dispatch)

    // Fetch all orders: open, filled, cancelled
    loadAllOrders(provider, exchange, dispatch)

    // Listen to events
    subscribeToEvents(exchange, dispatch)
    

    // if(chainId===31337){ // It's until only localhost exist.
    //   let k = await loadTokens(provider, [mCoin.address, mETH.address], dispatch)
    //   console.log("Loaded TOKENS", k)

    //   // Load exchange smart contract
    //   const exchangeConfig = config[chainId].exchange
    //   const exchange = await loadExchange(provider, exchangeConfig.address, dispatch)

    //   // Fetch all orders: open, filled, cancelled
    //   loadAllOrders(provider, exchange, dispatch)

    //   // Listen to events
    //   subscribeToEvents(exchange, dispatch)
    // }
  }

  useEffect(() => {
    loadBlockchainData()
  })

  return (
    <div>

      <Navbar />

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          <Markets/>

          <Balance/>

          <Order />

        </section>
        <section className='exchange__section--right grid'>

          <PriceChart/>

          <Transactions/>

          <Trades/>

          <OrderBook/>

        </section>
      </main>

      <Alert/>

    </div>
  );
}

export default App;
