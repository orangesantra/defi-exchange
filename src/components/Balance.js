import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import mockcoin from '../assets/mockcoin.svg';
import eth from '../assets/eth.svg';

import {
  loadBalances,
  transferTokens
} from '../store/interactions';

const Balance = () => {
  const [isDeposit, setIsDeposit] = useState(true)
  const [token1TransferAmount, setToken1TransferAmount] = useState(0)
  const [token2TransferAmount, setToken2TransferAmount] = useState(0)

  const dispatch = useDispatch()

  const provider = useSelector(state => state.provider.connection)
  const account = useSelector(state => state.provider.account)

  const exchange = useSelector(state => state.exchange.contract)
  const exchangeBalances = useSelector(state => state.exchange.balances)
  const transferInProgress = useSelector(state => state.exchange.transferInProgress)

  const tokens = useSelector(state => state.tokens.contracts)
  const symbols = useSelector(state => state.tokens.symbols)
  const tokenBalances = useSelector(state => state.tokens.balances)

  const depositRef = useRef(null)
  const withdrawRef = useRef(null)

  const tabHandler = (e) => {
    if(e.target.className !== depositRef.current.className) {
      e.target.className = 'tab tab--active'
      depositRef.current.className = 'tab'
      setIsDeposit(false)
    } else {
      e.target.className = 'tab tab--active'
      withdrawRef.current.className = 'tab'
      setIsDeposit(true)
    }
  }

  const amountHandler = (e, token) => {

    const newValue = e.target.value;
   
    token.getAddress()
    .then((value) =>{
      return value;
    })
    .then((v)=>{
     tokens[0].getAddress()
      .then((value)=>{
        if(v===value){
          console.log('VALUE', value)
          console.log('v',v)
          setToken1TransferAmount(newValue)
          console.log('Updated Value1', newValue)
        } else{
          setToken2TransferAmount(newValue)
          console.log('Updated Value2', newValue)
        }
      })

    })

    // const b = tokens[0].getAddress()
    // .then(async (value) =>{
    //   n=value
    //   return value;
  
    // })

    // if(a===b){
    //   setToken1TransferAmount(e.target.value)
    // }


    // console.log('tttttttttttttttttt',token.address)
    // console.log('ffffffffffffffffff',tokens[0].address)

    // if(token.address === tokens[0].address){
    //   console.log('Inside')
    //   setToken1TransferAmount(e.target.value)
    //   console.log('Updated Token Amount:', e.target.value);
    // }

    // token.getAddress()
    // .then(async (value) =>{
    //   console.log('A',value)
    //   console.log('B',await tokens[0].getAddress())
    //   console.log('C',e.target.value)

    //   if(value === await tokens[0].getAddress()){
    //     console.log('Inside')
    //     setToken1TransferAmount(e.target.value)
    //     console.log('Updated Token Amount:', e.target.value);
    //   }

    // })

    // console.log('eeeeeeeeeeeeeeeeeeeeee',token.getAddress())
    
    // if (await token.getAddress() === await tokens[0].getAddress()) {
    //   console.log('eeeeeeeeeeeeeeeeeeeeee',await token.getAddress())
    //   console.log('mmmmmmmmmmmmmmmmmmmm',await tokens[0].getAddress())
    //   console.log('yyyyyyyyyyyyyyyyyyyyyyyyyy', e.target)
    //   console.log('zzzzzzzzzzzzzzzzzzzzzzzzz', setToken1TransferAmount(e.target.value) )
    //   setToken1TransferAmount(e.target.value)
    // }
  }

  // useEffect(() => {
  //   console.log('Updated Value', token1TransferAmount);
  // }, [token1TransferAmount]);

  const depositHandler = async (e, token) => {
    e.preventDefault()

    if (await token.getAddress() === await tokens[0].getAddress()) {
      console.log('ANDAR ANDAR')
      transferTokens(provider, exchange, 'Deposit', token, token1TransferAmount, dispatch) // transferType is selfcreated function, it's not from contract
      setToken1TransferAmount(0)
    } else {
      console.log('YEH WLAAA')
      transferTokens(provider, exchange, 'Deposit', token, token2TransferAmount, dispatch)
      setToken2TransferAmount(0)
    }
  }

  const withdrawHandler = async (e, token) => {
    e.preventDefault()

    if (await token.getAddress() === await tokens[0].getAddress()) {
      console.log('BAR BAR')
      transferTokens(provider, exchange, 'Withdraw', token, token1TransferAmount, dispatch)
      setToken1TransferAmount(0)
    } else {
      transferTokens(provider, exchange, 'Withdraw', token, token2TransferAmount, dispatch)
      setToken2TransferAmount(0)
    }
    console.log("withrawing tokens...")
  }
 
  useEffect(() => {
    if(exchange && tokens[0] && tokens[1] && account) {
      loadBalances(exchange, tokens, account, dispatch)
    }
  }, [exchange, tokens, account, transferInProgress, dispatch]) // loadBalances function will be called if either of 4 parametersof array changes.

  return (
    <div className='component exchange__transfers'>
      <div className='component__header flex-between'>
        <h2>Balance</h2>
        <div className='tabs'>
          <button onClick={tabHandler} ref={depositRef} className='tab tab--active'>Deposit</button>
          <button onClick={tabHandler} ref={withdrawRef} className='tab'>Withdraw</button>
        </div>
      </div>

      {/* Deposit/Withdraw Component 1 (mCoin) */}

      <div className='exchange__transfers--form'>
        <div className='flex-between'>
          <p><small>Token</small><br /><img src={mockcoin} alt="Token Logo" />{symbols && symbols[0]}</p>
          <p><small>Wallet</small><br />{tokenBalances && tokenBalances[0]}</p>
          <p><small>Exchange</small><br />{exchangeBalances && exchangeBalances[0]}</p>
        </div>

        <form onSubmit={isDeposit ? (e) => depositHandler(e, tokens[0]) : (e) => withdrawHandler(e, tokens[0])}>
          <label htmlFor="token0">{symbols && symbols[0]} Amount</label>
          <input
            type="text"
            id='token0'
            placeholder='0.0000'
            value={token1TransferAmount === 0 ? '' : token1TransferAmount}
            onChange={(e) => amountHandler(e, tokens[0])}/>

          <button className='button' type='submit'>
            {isDeposit ? (
                <span>Deposit</span>
            ) : (
                <span>Withdraw</span>
            )}
          </button>
        </form>
      </div>

      <hr />

      {/* Deposit/Withdraw Component 2 (mETH) */}

      <div className='exchange__transfers--form'>
        <div className='flex-between'>
          <p><small>Token</small><br /><img src={eth} alt="Token Logo" />{symbols && symbols[1]}</p>
          <p><small>Wallet</small><br />{tokenBalances && tokenBalances[1]}</p>
          <p><small>Exchange</small><br />{exchangeBalances && exchangeBalances[1]}</p>
        </div>

        <form onSubmit={isDeposit ? (e) => depositHandler(e, tokens[1]) : (e) => withdrawHandler(e, tokens[1])}>
          <label htmlFor="token1">{symbols && symbols[1]} Amount</label>
          <input
            type="text"
            id='token1'
            placeholder='0.0000'
            value={token2TransferAmount === 0 ? '' : token2TransferAmount}
            onChange={(e) => amountHandler(e, tokens[1])}
          />

          <button className='button' type='submit'>
            {isDeposit ? (
                <span>Deposit</span>
            ) : (
                <span>Withdraw</span>
            )}
          </button>
        </form>
      </div>

      <hr />
    </div>
  );
}

export default Balance;