import { createSelector } from 'reselect'
import { get, groupBy, reject, maxBy, minBy} from 'lodash';
import moment from 'moment'
import { ethers } from 'ethers';

const GREEN = '#25CE8F'
const RED = '#F45353'

const events = state => get(state, 'exchange.events')
const account = state => get(state, 'provider.account')
const tokens = state => get(state, 'tokens.contracts')
// Now the allOrders has been modififed and we are fetching it from redux store, it not contain any BigInt and serilization issues.
const allOrders = state => get(state, 'exchange.allOrders.data', [])// third parameter [] is   default value, that is an empty array.
const cancelledOrders = state => get(state, 'exchange.cancelledOrders.data', [])
const filledOrders = state => get(state, 'exchange.filledOrders.data', [])

const openOrders = state => {
  const all = allOrders(state)
  const filled = filledOrders(state)
  const cancelled = cancelledOrders(state)

  console.log('CCCCCCCCCCCCCCCCC', filled)
  console.log('DDDDDDDDDDDDDDDDDD', cancelled)
  console.log('RRRRRRRRRRRRR', all)

  const openOrders = reject(all, (order) => {
    const orderFilled = filled.some((o) => o[0] === order[0])
    const orderCancelled = cancelled.some((o) => o[0] === order[0])
    return(orderFilled || orderCancelled)
  })
  console.log('OPEN ORDERS', openOrders)
  return openOrders
}

// ------------------------------------------------------------------------------
// MY EVENTS

export const myEventsSelector = createSelector(
  account,
  events,
  (account, events) => {
    events = events.filter((e) => e.args[1] === account)
    if(events.length>0){
      console.log('Italy', events[0].log.transactionHash)
    }    
    return events
  }
)

// ------------------------------------------------------------------------------
// MY OPEN ORDERS

// =========ORDER==========
// {id, user, tokenGet, amountGet, tokenGive, amountGive, timestamp}
// [0,   1,      2,        3,         4,          5,         6     ]

export const myOpenOrdersSelector = createSelector( 
  account,
  tokens,
  openOrders,
  (account, tokens, orders) => {
    if (!tokens[0] || !tokens[1]) { return }

    // Filter orders created by current account
    orders = orders.filter((o) => o[1] === account) // this is done because in seed exchange orders also made from second hardhat account, i mean 
    // from user2.

    // Filter orders by token addresses
    orders = orders.filter((o) => o[2] === tokens[0].target || o[2] === tokens[1].target)
    orders = orders.filter((o) => o[4] === tokens[0].target || o[4] === tokens[1].target)

    // Decorate orders - add display attributes
    orders = decorateMyOpenOrders(orders, tokens)

    // Sort orders by date descending
    orders = orders.sort((a, b) => b[6] - a[6])

    return orders
}
)

const decorateMyOpenOrders = (orders, tokens) => { // for collection of all orders [outer array]
return(
  orders.map((order) => {
    order = decorateOrder(order, tokens)
    order = decorateMyOpenOrder(order, tokens)
    return(order)
  })
)
}

const decorateMyOpenOrder = (order, tokens) => { // for particular order [inner array]
let orderType = order[4] === tokens[1].target ? 'buy' : 'sell' // if tokenGive is 'mETH' then it's buy order, mCOIN is considered for buying here.
// And all orders are sell orders because in seed exchange we only made sell orders i.e. get 'mETH' in exchange of 'mCOIN' from user1.
return({
  ...order,
  orderType: orderType,
  orderTypeClass: (orderType === 'buy' ? GREEN : RED)
})
}

//-------------------------------------------------------------------------------------------------------------------------------------------------

const decorateOrder = (order, tokens) => {
  let token0Amount, token1Amount

  // =========ORDER==========
  // {id, user, tokenGet, amountGet, tokenGive, amountGive, timestamp}
  // [0,   1,      2,        3,         4,          5,         6     ]

  // Note: mCoin should be considered token0, mETH is considered token1
  // Example: Giving mETH in exchange for mCoin
  
  if (order[4] === tokens[1].target) {
    token0Amount = order[5] // The amount of mCoin we are giving
    token1Amount = order[3] // The amount of mETH we want...
  } else {
    token0Amount = order[3] // The amount of mCoin we want
    token1Amount = order[5] // The amount of mETH we are giving...
  }

  // Calculate token price to 5 decimal places
  const precision = 100000
  let tokenPrice = (token1Amount / token0Amount)
  tokenPrice = Math.round(tokenPrice * precision) / precision

  return ({
    ...order,
    token1Amount: ethers.formatUnits(token1Amount, "ether"),
    token0Amount: ethers.formatUnits(token0Amount, "ether"),
    tokenPrice: tokenPrice,
    formattedTimestamp: moment.unix(order[6]).format('h:mm:ssa d MMM D')
  })
}

const decorateOrderforTrades = (order, tokens) => {
  let token0Amount, token1Amount

  // =========TRADE__ORDER==========
  // {id, user, tokenGet, amountGet, tokenGive, amountGive, addresscreator, timestamp}
  // [0,   1,      2,        3,         4,          5,           6        ,      7   ]

  // Note: mCoin should be considered token0, mETH is considered token1
  // Example: Giving mETH in exchange for mCoin
  
  if (order[4] === tokens[1].target) {
    token0Amount = order[5] // The amount of mCoin we are giving
    token1Amount = order[3] // The amount of mETH we want...
  } else {
    token0Amount = order[3] // The amount of mCoin we want
    token1Amount = order[5] // The amount of mETH we are giving...
  }

  // Calculate token price to 5 decimal places
  const precision = 100000
  let tokenPrice = (token1Amount / token0Amount)
  tokenPrice = Math.round(tokenPrice * precision) / precision

  return ({
    ...order,
    token1Amount: ethers.formatUnits(token1Amount, "ether"),
    token0Amount: ethers.formatUnits(token0Amount, "ether"),
    tokenPrice: tokenPrice,
    formattedTimestamp: moment.unix(order[7]).format('h:mm:ssa d MMM D')
  })
}

// ------------------------------------------------------------------------------
// ALL FILLED ORDERS

export const filledOrdersSelector = createSelector(
  filledOrders,
  tokens,
  (orders, tokens) => {
    if (!tokens[0] || !tokens[1]) { return }

    // Filter orders by selected tokens
    orders = orders.filter((o) => o[2] === tokens[0].target || o[2] === tokens[1].target)
    orders = orders.filter((o) => o[4] === tokens[0].target || o[4] === tokens[1].target)

    // Sort orders by time ascending for price comparison
    orders = orders.sort((a, b) => a[7] - b[7])

    // Decorate the orders
    orders = decorateFilledOrders(orders, tokens)

    // Sort orders by date descending for display
    orders = orders.sort((a, b) => b[7] - a[7])

    return orders

  }
)

const decorateFilledOrders = (orders, tokens) => {
  // Track previous order to compare history
  let previousOrder = orders[0]

  return(
    orders.map((order) => {
      // decorate each individual order
      order = decorateOrderforTrades(order, tokens) // Created by me.
      order = decorateFilledOrder(order, previousOrder)
      previousOrder = order  // Update the previous order once it's decorated
      return order
    })
  )
}

const decorateFilledOrder = (order, previousOrder) => {
  return({
    ...order,
    tokenPriceClass: tokenPriceClass(order.tokenPrice, order[0], previousOrder)
  })
}

const tokenPriceClass = (tokenPrice, orderId, previousOrder) => {
  // Show green price if only one order exists
  if (previousOrder[0] === orderId) {
    return GREEN
  }

  // Show green price if order price higher than previous order
  // Show red price if order price lower than previous order
  if (previousOrder.tokenPrice <= tokenPrice) {
    return GREEN // success
  } else {
    return RED // danger
  }
}

// ------------------------------------------------------------------------------
// MY FILLED ORDERS

// =========FILLED__ORDER==========
// {id, user, tokenGet, amountGet, tokenGive, amountGive, addresscreator, timestamp}
// [0,   1,      2,        3,         4,          5,           6,             7    ]

export const myFilledOrdersSelector = createSelector(
  account,
  tokens,
  filledOrders,
  (account, tokens, orders) => {
    if (!tokens[0] || !tokens[1]) { return }

    console.log('Spain', orders)
    // Find our orders
    orders = orders.filter((o) => o[1] === account || o[6] === account) // the first part is to check wheather the account is user(filler or order) and second part
    // is wheather the user is creator(initiater of order), if either of condo=ition meet than the trade belong to user, which is clearly visible.
    // Filter orders for current trading pair
    orders = orders.filter((o) => o[2] === tokens[0].target || o[2] === tokens[1].target)
    orders = orders.filter((o) => o[4] === tokens[0].target || o[4] === tokens[1].target)

    // Sort by date descending
    orders = orders.sort((a, b) => b[7] - a[7])

    // Decorate orders - add display attributes
    orders = decorateMyFilledOrders(orders, account, tokens)

    console.log('LATIN', orders)

    return orders
}
)

const decorateMyFilledOrders = (orders, account, tokens) => {
return(
  orders.map((order) => {
    order = decorateOrderforTrades(order, tokens) // Created by me.
    order = decorateMyFilledOrder(order, account, tokens)
    return(order)
  })
)
}

const decorateMyFilledOrder = (order, account, tokens) => {
const myOrder = order[6] === account // o[6] is order creator.

let orderType
if(myOrder) {
  orderType = order[4] === tokens[1].target ? 'buy' : 'sell'
} else {
  orderType = order[4] === tokens[1].target ? 'sell' : 'buy'
}

return({
  ...order,
  orderType,
  orderClass: (orderType === 'buy' ? GREEN : RED),
  orderSign: (orderType === 'buy' ? '+' : '-')
})
}

// ------------------------------------------------------------------------------
// ORDER BOOK

export const orderBookSelector = createSelector(openOrders, tokens, (orders, tokens)=>{
    console.log('ALL ORDERSX', orders, tokens)

    // Filter orders by selected tokens

    /* orders = orders.filter(async (o) => o.tokenGet === await tokens[0].getAddress() || o.tokenGet === tokens[1].address) 
    the o.tokenGet is to be figured out later, on how to convert the array 'o' to object 'o' with properties like id, amountGet, amountGive etc.*/

    // {id, user, tokenGet, amountGet, tokenGive, amountGive, timestamp}

    if (!tokens[0] || !tokens[1]) { return }

    orders =  orders.filter((o) => o[2] === tokens[0].target || o[2] ===  tokens[1].target) // First filter that amountGet is mCOIN or mETH
    orders =  orders.filter((o) => o[4] === tokens[0].target || o[4] ===  tokens[1].target) // second filter that amountGive is mCOIN pr mETH, excepet these consitions
    // fulfilling orders will form new array and other orders will be rejected.
    console.log('uuuuuuuuuuuuuuuuuuu', orders)

    // Decorate orders
    orders = decorateOrderBookOrders(orders, tokens)
    console.log('M16', orders)

    // Group orders by "orderType"
    orders = groupBy(orders, 'orderType')
    console.log('BullUP', orders)

    // Fetch buy orders
    const buyOrders = get(orders, 'buy', [])

    // Sort buy orders by token price
    orders = {
        ...orders,
        buyOrders: buyOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
      }
      
    console.log('Uzi', orders)
    // Fetch sell orders
    const sellOrders = get(orders, 'sell', [])

    // Sort sell orders by token price
    orders = {
      ...orders,
      sellOrders: sellOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
    }

    console.log('Magnum', orders)
    return orders
  }
)

  const decorateOrderBookOrders =  (orders, tokens) => {
      return orders.map((order) => {
        order =  decorateOrder(order, tokens); // adding token0Amount and token1Amount
        order =  decorateOrderBookOrder(order, tokens); // adding orderType
        return order;
      })  
      console.log('pppppppppppppp', orders)
  };
  

const decorateOrderBookOrder = (order, tokens) => {

  const orderType = order[4] === tokens[1].target ? 'buy' : 'sell'
  
  return({
    ...order,
    orderType: orderType,
    orderTypeClass: (orderType === 'buy' ? GREEN : RED),
    orderFillAction: (orderType === 'buy' ? 'sell' : 'buy')
  })

}

// ------------------------------------------------------------------------------
// PRICE CHART

// =========FILLED__ORDER==========
// {id, user, tokenGet, amountGet, tokenGive, amountGive, addresscreator, timestamp}
// [0,   1,      2,        3,         4,          5,           6        ,      7   ]

export const priceChartSelector = createSelector(
  filledOrders,
  tokens,
  (orders, tokens) => {
    if (!tokens[0] || !tokens[1]) { return }

    // Filter orders by selected tokens
    orders = orders.filter((o) => o[2] === tokens[0].target || o[2] === tokens[1].target)
    orders = orders.filter((o) => o[4] === tokens[0].target || o[4] === tokens[1].target)

    // Sort orders by date ascending to compare history
    orders = orders.sort((a, b) => a[7] - b[7])

    // Decorate orders - add display attributes
    orders = orders.map((o) => decorateOrderforTrades(o, tokens))

    // Get last 2 order for final price & price change
    let secondLastOrder, lastOrder
    [secondLastOrder, lastOrder] = orders.slice(orders.length - 2, orders.length)

    // get last order price
    const lastPrice = get(lastOrder, 'tokenPrice', 0)

    // get second last order price
    const secondLastPrice = get(secondLastOrder, 'tokenPrice', 0)

    return ({
      lastPrice: lastPrice,
      lastPriceChange: (lastPrice >= secondLastPrice ? '+' : '-'),
      series: [{
        data: buildGraphData(orders)
      }]
    })

  }
)

const buildGraphData = (orders) => {
  // Group the orders by hour for the graph
  orders = groupBy(orders, (o) => moment.unix(o[7]).startOf('hour').format())
    if(orders){
      console.log('UBUNTU', orders)
    }
  

  // Get each hour where data exists
  const hours = Object.keys(orders) // It's an array of keys, key is hour here and orders is object here.
  if(hours){
    console.log('NAPKIN', hours)
  }

  // Build the graph series
  const graphData = hours.map((hour) => {
    // Fetch all orders from current hour
    const group = orders[hour]

    // Calculate price values: open, high, low, close
    const open = group[0] // first order
    const high = maxBy(group, 'tokenPrice') // high price
    const low = minBy(group, 'tokenPrice') // low price
    const close = group[group.length - 1] // last order

    return({
      x: new Date(hour),
      y: [open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice]
    })
  })

  return graphData
}
