import { ethers } from 'ethers'
import TOKEN_ABI from '../abis/Token.json';
import EXCHANGE_ABI from '../abis/Exchange.json';

export const loadProvider = (dispatch) => {
  const connection = new ethers.BrowserProvider(window.ethereum)
  dispatch({ type: 'PROVIDER_LOADED', connection: connection })

  return connection
}

export const loadNetwork = async (provider, dispatch) => {
  const { chainId } = await provider.getNetwork()
  dispatch({ type: 'NETWORK_LOADED', chainId: parseInt(chainId.toString())})

  return parseInt(chainId.toString())
}

export const loadAccount = async (provider, dispatch) => {
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
  const account = ethers.getAddress(accounts[0])

  dispatch({ type: 'ACCOUNT_LOADED', account: account })

  let balance = await provider.getBalance(account)
  balance = ethers.formatEther(balance)

  dispatch({ type: 'ETHER_BALANCE_LOADED', balance })

  return account
}

export const loadTokens = async (provider, addresses, dispatch) => {
  let token, symbol

  token = new ethers.Contract(addresses[0], TOKEN_ABI, provider)
  symbol = await token.symbol()
  dispatch({ type: 'TOKEN_1_LOADED', token, symbol })

  token = new ethers.Contract(addresses[1], TOKEN_ABI, provider)
  symbol = await token.symbol()
  dispatch({ type: 'TOKEN_2_LOADED', token, symbol })

  return token
}

export const loadExchange = async (provider, address, dispatch) => {
    const exchange = new ethers.Contract(address, EXCHANGE_ABI, provider);
    dispatch({ type: 'EXCHANGE_LOADED', exchange: exchange })
  
    return exchange
}

// BigInt was causing problem 
export const subscribeToEvents = (exchange, dispatch) => {

  exchange.on('Cancel', (id, user, tokenGet, amountGet, tokenGive, amountGive, timestamp, event) => {

    const convertedId = id.toString();
    const convertedAmountGet = amountGet.toString();
    const convertedAmountGive = amountGive.toString();
    const convertedTimestamp = timestamp.toString();

    const convertedEvent = {
      ...event,
      id: convertedId,
      amountGet: convertedAmountGet,
      amountGive: convertedAmountGive,
      timestamp: convertedTimestamp,
      args: {
        ...event.args,
        //0,3,5,6
        0: convertedId,
        3: convertedAmountGet,
        5: convertedAmountGive,
        6: convertedTimestamp
      }
    }

    const order = convertedEvent.args
    dispatch({ type: 'ORDER_CANCEL_SUCCESS', order, event: convertedEvent })
  })

  exchange.on('Trade', (id, user, tokenGet, amountGet, tokenGive, amountGive, creator, timestamp, event) => {

    const convertedId = id.toString();
    const convertedAmountGet = amountGet.toString();
    const convertedAmountGive = amountGive.toString();
    const convertedTimestamp = timestamp.toString();

    const convertedEvent = {
      ...event,
      id: convertedId,
      amountGet: convertedAmountGet,
      amountGive: convertedAmountGive,
      timestamp: convertedTimestamp,
      args: {
        ...event.args,
        //0,3,5,6
        0: convertedId,
        3: convertedAmountGet,
        5: convertedAmountGive,
        7: convertedTimestamp
      }
    }

    const order = convertedEvent.args
    dispatch({ type: 'ORDER_FILL_SUCCESS', order, event: convertedEvent })
  })



  exchange.on('Deposit', (token, user, amount, balance, event) => { // Deposit event hone ke bad, matlab 'TRANSFER_PENDING' ya deposit successful rha.
    const convertedAmount = amount.toString();
    const convertedBalance = balance.toString();

    const convertedEvent = {
      ...event,
      amount: convertedAmount,
      balance: convertedBalance,
      args: {
        ...event.args,
        2: convertedAmount,
        3: convertedBalance
      }
    };

    dispatch({ type: 'TRANSFER_SUCCESS', event: convertedEvent }); // iska matlab ab 'TRANSFER_SUCCESS' ko trigger kar sakte.
  });

  exchange.on('Withdraw', (token, user, amount, balance, event) => { // event pehla charo parameter ka information rakhta h, is liye directly event ko hi dispatch kar dete
    // naki sabko alag alag.
    const convertedAmount = amount.toString();
    const convertedBalance = balance.toString();

    const convertedEvent = {
      ...event,
      amount: convertedAmount,
      balance: convertedBalance,
      args: {
        ...event.args,
        2: convertedAmount,
        3: convertedBalance
      }
    };

    dispatch({ type: 'TRANSFER_SUCCESS', event: convertedEvent });
  });

  exchange.on('Order', (id, user, tokenGet, amountGet, tokenGive, amountGive, timestamp, event) => {

    const convertedId = id.toString();
    const convertedAmountGet = amountGet.toString();
    const convertedAmountGive = amountGive.toString();
    const convertedTimestamp = timestamp.toString();

    const convertedEvent = {
      ...event,
      id: convertedId,
      amountGet: convertedAmountGet,
      amountGive: convertedAmountGive,
      timestamp: convertedTimestamp,
      args: {
        ...event.args,
        //0,3,5,6
        0: convertedId,
        3: convertedAmountGet,
        5: convertedAmountGive,
        6: convertedTimestamp
      }
    }

    const order = convertedEvent.args
    console.log('EVENT', event)
    console.log('CONVERTED EVENT', convertedEvent)
    console.log('NEW ORDER', order)

    dispatch({ type: 'NEW_ORDER_SUCCESS', order, event: convertedEvent })

    // const convertedAmount = amount.toString();
    // const convertedBalance = balance.toString();

    // const convertedEvent = {
    //   ...event,
    //   amount: convertedAmount,
    //   balance: convertedBalance,
    //   args: {
    //     ...event.args,
    //     2: convertedAmount,
    //     3: convertedBalance
    //   }
    // };

    // dispatch({ type: 'TRANSFER_SUCCESS', event: convertedEvent });
  });


}


// export const subscribeToEvents = (exchange, dispatch) => {
//   exchange.on('Deposit', (token, user, amount, balance, event) => {
//     const convertedAmount = amount.toString();
//     const convertedBalance = balance.toString();

//     const convertedEvent = {
//       ...event,
//       amount: convertedAmount,
//       balance: convertedBalance
//     };

//     dispatch({ type: 'TRANSFER_SUCCESS', event: convertedEvent });
//   });
// }


// export const subscribeToEvents = (exchange, dispatch) => {
//   exchange.on('Deposit', (token, user, amount, balance, event) => {

//     // Convert BigInt to integer
//     const amountInteger = parseInt(amount.toString());
//     const balanceInteger = parseInt(balance.toString());

//     console.log('xxx', token)
//     console.log('yyy', user)
//     console.log('zzz', amountInteger)
//     console.log('mmm', balanceInteger)
//     console.log('SUBBBBBBB', event)

//     // Dispatch the action with converted values
//     dispatch({
//       type: 'TRANSFER_SUCCESS',
//       event: {
//         ...event,
//         amount: amountInteger,
//         balance: balanceInteger
//       }
//     });

//     console.log('WAYYYYYYYYYYY', event)


//   });
// };

// export const subscribeToEvents = (exchange, dispatch) => {
//   exchange.on('Deposit', (token, user, amount, balance, event) => {
//     console.log('xxx', token)
//     console.log('yyy', user)
//     console.log('zzz', amount)
//     console.log('mmm', balance)
//     console.log('SUBBBBBBB', event)
//     dispatch({ type: 'TRANSFER_SUCCESS', event })
//   })
// }



// ------------------------------------------------------------------------------
// LOAD USER BALANCES (WALLET & EXCHANGE BALANCES)


export const loadBalances = async (exchange, tokens, account, dispatch) => {
  let balance;
  // console.log('ppppppppppppppppppp', ethers.formatUnits(await exchange.balanceOf(tokens[0].address, account), 18))
  /* In the above commented code tokens[0].address was causeing the error */
  balance = ethers.formatUnits(await tokens[0].balanceOf(account), 18)
  dispatch({ type: 'TOKEN_1_BALANCE_LOADED', balance })

  balance = ethers.formatUnits(await exchange.balanceOf(await tokens[0].getAddress(), account), 18)
  dispatch({ type: 'EXCHANGE_TOKEN_1_BALANCE_LOADED', balance })

  balance = ethers.formatUnits(await tokens[1].balanceOf(account), 18)
  dispatch({ type: 'TOKEN_2_BALANCE_LOADED', balance })

  balance = ethers.formatUnits(await exchange.balanceOf(await tokens[1].getAddress(), account), 18)
  dispatch({ type: 'EXCHANGE_TOKEN_2_BALANCE_LOADED', balance })

}

// ------------------------------------------------------------------------------
// LOAD ALL ORDERS

export const loadAllOrders = async (provider, exchange, dispatch) => {

  const block = await provider.getBlockNumber()

  // Fetch canceled orders
  const cancelStream = await exchange.queryFilter('Cancel', 0, block)
  const cancelledOrders = cancelStream.map(event => {
    const args = [...event.args]; // Create a copy of the arguments array
    args[0] = args[0].toString();
    args[3] = args[3].toString();
    args[5] = args[5].toString();
    args[6] = args[6].toString();
    return args;
  });

  dispatch({ type: 'CANCELLED_ORDERS_LOADED', cancelledOrders })

  // Fetch filled orders
  const tradeStream = await exchange.queryFilter('Trade', 0, block)
  const filledOrders = tradeStream.map(event => {
    const args = [...event.args]; // Create a copy of the arguments array
    args[0] = args[0].toString();
    args[3] = args[3].toString();
    args[5] = args[5].toString();
    args[7] = args[7].toString();
    return args;
  });

  dispatch({ type: 'FILLED_ORDERS_LOADED', filledOrders })

  // Fetch all orders
  const orderStream = await exchange.queryFilter('Order', 0, block)
  // Create a new array with modified arguments
  const allOrders = orderStream.map(event => {
    const args = [...event.args]; // Create a copy of the arguments array
    args[0] = args[0].toString();
    args[3] = args[3].toString();
    args[5] = args[5].toString();
    args[6] = args[6].toString();
    return args;
  });

  console.log('Modified AllOrder', allOrders);


  // const allOrders = orderStream.map(event => event.args)

  // const outerArraylength = allOrders.length
  // console.log('Sssssssssssssssss', outerArraylength)

 
  // for (let i=0; i<outerArraylength; i++){
  //   allOrders[i][0] = allOrders[i][0].toString();
  //   allOrders[i][3] = allOrders[i][3].toString();
  //   allOrders[i][5] = allOrders[i][5].toString();
  //   allOrders[i][6] = allOrders[i][6].toString();   
  // }

  // setTimeout(() => {
  //   console.log('Modified AllOrder', allOrders);
  // }, 5000);
 
  //0,3,5,6

  // const convertedId = id.toString();
  // const convertedAmountGet = amountGet.toString();
  // const convertedAmountGive = amountGive.toString();
  // const convertedTimestamp = timestamp.toString();

  // const convertedEvent = {
  //   ...event,
  //   id: convertedId,
  //   amountGet: convertedAmountGet,
  //   amountGive: convertedAmountGive,
  //   timestamp: convertedTimestamp,
  //   args: {
  //     ...event.args,
  //     //0,3,5,6
  //     0: convertedId,
  //     3: convertedAmountGet,
  //     5: convertedAmountGive,
  //     6: convertedTimestamp
  //   }
  // }

  // const order = convertedEvent.args

  

  dispatch({ type: 'ALL_ORDERS_LOADED', allOrders })
}

// ------------------------------------------------------------------------------
// TRANSFER TOKENS (DEPOSIT & WITHDRAWS)

export const transferTokens =  async (provider, exchange, transferType, token, amount, dispatch) => {
  let transaction

  dispatch({ type: 'TRANSFER_REQUEST' }) // when the button clicked transfer request have been called.

  try {
    const signer = await provider.getSigner()
    const amountToTransfer = ethers.parseUnits(amount.toString(), 18)
    
    if (transferType === 'Deposit'){ // transferType is selfcreated function, it's not from contract
      transaction = await token.connect(signer).approve(await exchange.getAddress(), amountToTransfer)
      await transaction.wait()
      transaction = await exchange.connect(signer).depositToken(await token.getAddress(), amountToTransfer)
    } else {
      transaction = await exchange.connect(signer).withdrawToken(await token.getAddress(), amountToTransfer)
    }

    await transaction.wait()
    console.log('Transaction',transaction)

  } catch(error) {
    dispatch({ type: 'TRANSFER_FAIL' })
  }
}

// ------------------------------------------------------------------------------
// ORDERS (BUY & SELL)

export const makeBuyOrder = async (provider, exchange, tokens, order, dispatch) => {
  const tokenGet = await tokens[0].getAddress()
  const amountGet = ethers.parseUnits(order.amount, 18)
  const tokenGive = await tokens[1].getAddress()
  const amountGive = ethers.parseUnits((order.amount * order.price).toString(), 18)

  dispatch({ type: 'NEW_ORDER_REQUEST' })

  try {
    const signer = await provider.getSigner()
    const transaction = await exchange.connect(signer).makeOrder(tokenGet, amountGet, tokenGive, amountGive)
    await transaction.wait()
  } catch (error) {
    dispatch({ type: 'NEW_ORDER_FAIL' })
  }
}

export const makeSellOrder = async (provider, exchange, tokens, order, dispatch) => {
  const tokenGet = await tokens[1].getAddress()
  const amountGet = ethers.parseUnits((order.amount * order.price).toString(), 18)
  const tokenGive = await tokens[0].getAddress()
  const amountGive = ethers.parseUnits(order.amount, 18)

  dispatch({ type: 'NEW_ORDER_REQUEST' })

  try {
    const signer = await provider.getSigner()
    const transaction = await exchange.connect(signer).makeOrder(tokenGet, amountGet, tokenGive, amountGive)
    await transaction.wait()
  } catch (error) {
    dispatch({ type: 'NEW_ORDER_FAIL' })
  }
}

// ------------------------------------------------------------------------------
// CANCEL ORDER

export const cancelOrder = async (provider, exchange, order, dispatch) => {

  dispatch({ type: 'ORDER_CANCEL_REQUEST' })

  try {
    const signer = await provider.getSigner()
    const transaction = await exchange.connect(signer).cancelOrder(order[0])
    await transaction.wait()
  } catch (error) {
    dispatch({ type: 'ORDER_CANCEL_FAIL' })
  }
}

// ------------------------------------------------------------------------------
// FILL ORDER

export const fillOrder = async (provider, exchange, order, dispatch) => {
  dispatch({ type: 'ORDER_FILL_REQUEST' })

  try {
    const signer = await provider.getSigner()
    const transaction = await exchange.connect(signer).fillOrder(order[0])
    await transaction.wait()
  } catch (error) {
    dispatch({ type: 'ORDER_FILL_FAIL' })
  }
}

  