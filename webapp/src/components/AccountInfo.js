import React from "react"
import lodash from "lodash"

const AccountInfo = ({accountInfo, showJSON=false}) => {

    const dropsToXRP = (drops) => {
        return drops.dividedBy(1000000)
    }

    let renderAccountData = (accountInfo) => {

        if(accountInfo && accountInfo.result && accountInfo.result.account_data){
            // let keys = Object.keys(accountInfo.result.account_data);
            const allowed = ['Balance', 'Flags', 'LedgerEntryType', 'OwnerCount',, 'PreviousTxnLgrSeq', 'Sequence'];
            const keys = lodash.filter(Object.keys(accountInfo.result.account_data), function(o) { return allowed.includes(o); });
            if (keys.length === 0) {
                return <div className="flex">No account data</div>;
            } else {
                return keys.map((key, index) => (
                    <div className="flex flex-col w-32 h-16 md:h-32 text-yellow-200 bg-slate-800 m-1 rounded p-1 break-words" key={index}>
                        <div className="text-xs font-bold text-gray-500">{key}</div> 
                        <div className="font-mono font-bold text-lg">{accountInfo.result.account_data[key]}</div>
                    </div>
                ));
            }
        }

    };

    return (
        <>
            {accountInfo && 
             <div className="flex flex-col"> 
               
                <div className="flex flex-row text-heading text-2xl">Account Info</div>
                {showJSON && <div className="flex flex-row">
                    <code className="w-full"><pre>{JSON.stringify(accountInfo,null,2)}</pre></code>
                </div>}
                <div className="flex flex-wrap w-full bg-slate-700 p-1">{renderAccountData(accountInfo)}</div>               
            </div>}
        </>
    );
  };
  
export default AccountInfo