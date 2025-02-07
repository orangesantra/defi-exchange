export const provider = (state = {}, action) => {
    switch (action.type) {
      case 'PROVIDER_LOADED':
        return {
          ...state,
          connection: action.connection //connection can be rewritten as connection1 or any other name.
        }
      case 'NETWORK_LOADED':
        return {
          ...state,
          chainId: action.chainId
        }
      case 'ACCOUNT_LOADED':
        return {
          ...state,
          account: action.account
        }
      case 'ETHER_BALANCE_LOADED':
        return {
        ...state,
        balance: action.balance
      }
  
      default:
        return state
    }
  }

  const DEFAULT_TOKENS_STATE = {
    loaded: false,
    contracts: [],
    symbols: []
  }
  
  export const tokens = (state = DEFAULT_TOKENS_STATE, action) => {
    switch (action.type) {
      case 'TOKEN_1_LOADED':
        return {
          ...state,
          loaded: true,
          contracts: [ action.token], // the way adding new elements to array.
          symbols: [ action.symbol]
        }

      case 'TOKEN_1_BALANCE_LOADED':
          return {
            ...state,
            balances: [action.balance]
          }

      case 'TOKEN_2_LOADED':
          return {
            ...state,
            loaded: true,
            contracts: [...state.contracts, action.token], // ...state.contracts means copy the current and state take the value of contracts key from
            //from copied state and then a array of two elements are formed.
            symbols: [...state.symbols, action.symbol]
        }
        
      case 'TOKEN_2_BALANCE_LOADED':
          return {
            ...state,
            balances: [...state.balances, action.balance]
          }

        default:
          return state
    }
  }

  const DEFAULT_EXCHANGE_STATE = {
    loaded: false,
    contract: {},
    transaction: {
      isSuccessful: false
    },
    allOrders: {
      loaded: false,
      data: []
    },
    cancelledOrders: {
      data: []
    },
    filledOrders: {
      data: []
    },
    events: []
  }

  export const exchange = (state = DEFAULT_EXCHANGE_STATE, action) => {
    let index, data

    switch (action.type) {
      case 'EXCHANGE_LOADED':
        return {
          ...state,
          loaded: true,
          contract: action.exchange
        }

    // ------------------------------------------------------------------------------
    // ORDERS LOADED (CANCELLED, FILLED & ALL)

      case 'CANCELLED_ORDERS_LOADED':
        return {
          ...state,
          cancelledOrders: {
            loaded: true,
            data: action.cancelledOrders
          }
        }

      case 'FILLED_ORDERS_LOADED':
        return {
          ...state,
          filledOrders: {
            loaded: true,
            data: action.filledOrders
          }
        }

      case 'ALL_ORDERS_LOADED':
        return {
          ...state,
          allOrders: {
            loaded: true,
            data: action.allOrders
          }
        }

        // ------------------------------------------------------------------------------
        // CANCELLING ORDERS
        case 'ORDER_CANCEL_REQUEST':
          return {
            ...state,
            transaction: {
              transactionType: 'Cancel',
              isPending: true,
              isSuccessful: false
            }
          }

        case 'ORDER_CANCEL_SUCCESS':
          return {
            ...state,
            transaction: {
              transactionType: 'Cancel',
              isPending: false,
              isSuccessful: true
            },
            cancelledOrders: {                 // After sucess the cancelledOrders in state also from 'case 'CANCELLED_ORDERS_LOADED':' (see above) is updated with new entity
              // in element array. so whenever fetching happens from orderbook selector, new updated data visisble in orderbook component. 
              ...state.cancelledOrders,
              data: [
                ...state.cancelledOrders.data,
                action.order
              ]
            },
            events: [action.event, ...state.events]
          }

        case 'ORDER_CANCEL_FAIL':
          return {
            ...state,
            transaction: {
              transactionType: 'Cancel',
              isPending: false,
              isSuccessful: false,
              isError: true
            }
          }

        case 'ORDER_FILL_SUCCESS':
          // Prevent duplicate orders
          index = state.filledOrders.data.findIndex(order => order[0] === action.order[0]) // earlier order.id.toString() and action.order.toString()
    
          if (index === -1) {
            // data = [...state.filledOrders.data, action.order]
            data = [...state.filledOrders.data, Object.values(action.order)] // const arr = Object.values(obj);
          } else {
            data = state.filledOrders.data
          }
    
          return {
            ...state,
            transaction: {
              transactionType: "Fill Order",
              isPending: false,
              isSuccessful: true
            },
            filledOrders: {
              ...state.filledOrders,
              data
            },
            events: [action.event, ...state.events]
          }
    
        case 'ORDER_FILL_FAIL':
          return {
            ...state,
            transaction: {
              transactionType: "Fill Order",
              isPending: false,
              isSuccessful: false,
              isError: true
            }
          }

      // ------------------------------------------------------------------------------
      // BALANCE CASES
      case 'EXCHANGE_TOKEN_1_BALANCE_LOADED':
        return {
          ...state,
          balances: [action.balance]
        }
      case 'EXCHANGE_TOKEN_2_BALANCE_LOADED':
        return {
          ...state,
          balances: [...state.balances, action.balance]
        }

      // ------------------------------------------------------------------------------
      // TRANSFER CASES (DEPOSIT & WITHDRAWS)
      case 'TRANSFER_REQUEST':
        return {
          ...state,
          transaction: {
            transactionType: 'Transfer',
            isPending: true,
            isSuccessful: false
          },
          transferInProgress: true
        }
      case 'TRANSFER_SUCCESS':    
        return {
          ...state,
          transaction: {
            transactionType: 'Transfer',
            isPending: false,
            isSuccessful: true
          },
          transferInProgress: false,
          events: [
            action.event,
            ...state.events
          ]
        };

        

      /* 
        THIS IS ALSO WORKING CODE SNIPPET, ABOVE IS THE SIMPLIFIED VERSION REMOVING UNNECESSARY CHECKS AND INDIVIDUAL EXTRACTION OF 
        ELEMENTS OF EVENT

        case 'TRANSFER_SUCCESS':
        const { amount, balance, ...rest } = action.event;
        const convertedAmount = typeof action.event.args[2] === 'string' ? action.event.args[2] : action.event.args[2].toString();
        const convertedBalance = typeof action.event.args[3] === 'string' ? action.event.args[3] : action.event.args[3].toString();

        return {
          ...state,
          transaction: {
            transactionType: 'Transfer',
            isPending: false,
            isSuccessful: true
          },
          transferInProgress: false,
          events: [
            {
              amount: convertedAmount,
              balance: convertedBalance,
              ...rest
            },
            ...state.events
          ]
        };

     */

      /*

      case 'TRANSFER_SUCCESS':
        const { amount, balance, ...rest } = action.event;
        console.log('BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB')
        console.log('ACTIONNNNNNNNNNNNNNNNNNNNNNNNN',action.event)
        return {
          ...state,
          transaction: {
            transactionType: 'Transfer',
            isPending: false,
            isSuccessful: true
          },
          transferInProgress: false,
          events: [{ amount, balance, ...rest }, ...state.events]
      }

      */


      /*

      case 'TRANSFER_SUCCESS':
        return {
          ...state,
          transaction: {
            transactionType: 'Transfer',
            isPending: false,
            isSuccessful: true
          },
          transferInProgress: false,
          events: [action.event, ...state.events]
        }

      */

      case 'TRANSFER_FAIL':
        return {
          ...state,
          transaction: {
            transactionType: 'Transfer',
            isPending: false,
            isSuccessful: false,
            isError: true

          },
          transferInProgress: false
        }

    // ------------------------------------------------------------------------------
    // MAKING ORDERS CASES

    case 'NEW_ORDER_REQUEST':
      return {
        ...state,
        transaction: {
          transactionType: 'New Order',
          isPending: true,
          isSuccessful: false
        },
      }

    case 'NEW_ORDER_SUCCESS':
      // Prevent duplicate orders
      index = state.allOrders.data.findIndex(order => order[0] === action.order[0])
      console.log('INDEX',index)
      console.log('kokoko', action.order)
      console.log('momomo', action.order.id)
      console.log('jojojo', action.order[0])
  
      if(index === -1) {
        data = [...state.allOrders.data, action.order]
      } else {
        data = state.allOrders.data 
        // this line is for dublicate orderid, if this case happens then data will not very even a slight, it will be
        // just take value of original state with data.
        // confirmation is yet from chat gpt 3.
      }

      return {
        ...state,
        allOrders: {
          ...state.allOrders,
          data
        },
        transaction: {
          transactionType: 'New Order',
          isPending: false,
          isSuccessful: true
        },
        events: [action.event, ...state.events]
      }

    case 'NEW_ORDER_FAIL':
      return {
        ...state,
        transaction: {
          transactionType: 'New Order',
          isPending: false,
          isSuccessful: false,
          isError: true
        },
      }
    
        default:
          return state
    }
  }