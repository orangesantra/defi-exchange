import { useRef, useEffect } from 'react'
import { useSelector } from 'react-redux';

import { myEventsSelector } from '../store/selectors';

import config from '../config.json';

const Alert = () => {
  const alertRef = useRef(null)

  const network = useSelector(state => state.provider.network)
  const account = useSelector(state => state.provider.account)
  const isPending = useSelector(state => state.exchange.transaction.isPending)
  const isError = useSelector(state => state.exchange.transaction.isError) // it will only present in redux if transaction will fail, by default it's not there.
  const events = useSelector(myEventsSelector)

  if(events.length>0){ // as events is already defined as empty array, we cannot just use if(events){}, beaco=use empty array is allready exist and this
    // consition will execute any way, so we have to use if(events.length>0){}, to vetify that events array is not empty any more. 
    console.log('Italy', events[0].log.transactionHash)
  }  

  const removeHandler = async (e) => {
    alertRef.current.className = 'alert--remove'
  }

  useEffect(() => {
    if((events[0] || isPending || isError) && account) {
      alertRef.current.className = 'alert'
    }
  }, [events, isPending, isError, account])

  return (
    <div>
        {isPending ? (

          <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}>
            <h1>Transaction Pending...</h1>
          </div>

        ) : isError ? (

          <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}>
            <h1>Transaction Will Fail</h1>
          </div>

        ) : !isPending && events.length>0 ? (

          <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}>
            <h1>Transaction Successful</h1>
              <a
                href={config[network] ? `${config[network].explorerURL}/tx/${events[0].transactionHash}` : '#'}
                target='_blank'
                rel='noreferrer'
              >
                {events[0].log.transactionHash.slice(0, 6) + '...' + events[0].log.transactionHash.slice(60, 66)}
              </a>
          </div>

        ) : (
          <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}></div>
        )}
    </div>
  );
}

export default Alert;