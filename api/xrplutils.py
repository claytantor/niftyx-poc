class XrpNetwork():
    def __init__(self,     
        json_rpc: str,
        websocket: str,
        type: str,
        domain: str):
        self.json_rpc = json_rpc
        self.websocket = websocket
        self.type = type
        self.domain = domain

    def __init__(self, data):
        self.from_dict(data)
    

    def from_dict(self, data):
        for field in ['json_rpc', 'websocket', 'type', 'domain']:
            if field in data:
                setattr(self, field, data[field])

    def to_dict(self):
        return {
            "json_rpc": self.json_rpc,
            "websocket": self.websocket,
            "type": self.type,
            "domain": self.domain
        }


class XrpCurrencyRate():
    #   
    def __init__(self, 
        fiatCurrencyI8NCode: str,
        fiatCurrencyName: str,
        fiatCurrencySymbol: str,
        fiatCurrencyIsoDecimals: int,
        xrpRate: float):

        self.fiatCurrencyI8NCode = fiatCurrencyI8NCode
        self.fiatCurrencyName = fiatCurrencyName
        self.fiatCurrencySymbol = fiatCurrencySymbol
        self.fiatCurrencyIsoDecimals = fiatCurrencyIsoDecimals
        self.xrpRate = xrpRate


    def to_dict(self):
        return {
            "fiatCurrencyI8NCode": self.fiatCurrencyI8NCode,
            "fiatCurrencyName": self.fiatCurrencyName,
            "fiatCurrencySymbol": self.fiatCurrencySymbol,
            "fiatCurrencyIsoDecimals": self.fiatCurrencyIsoDecimals,
            "xrpRate": self.xrpRate
        }


"""
==========================
functional methods
==========================
"""

"""
If you don't run your own rippled server, you can use the following public servers to submit transactions or read data from the ledger.

Operator	Network	JSON-RPC URL	WebSocket URL	Notes
XRP Ledger Foundation	Mainnet	https://xrplcluster.com/
https://xrpl.ws/ ²	wss://xrplcluster.com/
wss://xrpl.ws/ ²	Full history server cluster.
Ripple¹	Mainnet	https://s1.ripple.com:51234/	wss://s1.ripple.com/	General purpose server cluster
Ripple¹	Mainnet	https://s2.ripple.com:51234/	wss://s2.ripple.com/	Full-history server cluster
Sologenic	Mainnet		wss://x1.sologenic.org	Websocket Server
Ripple¹	Testnet	https://s.altnet.rippletest.net:51234/	wss://s.altnet.rippletest.net/	Testnet public server
Ripple¹	Devnet	https://s.devnet.rippletest.net:51234/	wss://s.devnet.rippletest.net/	Devnet public server
"""

xrp_lookup = {
    's.altnet.rippletest.net':{
        'json_rpc':'https://s.altnet.rippletest.net:51234',
        'websocket':'wss://s.altnet.rippletest.net:51233',
        'type':'testnet',
    },
    's.devnet.rippletest.net':{  
        'json_rpc':'https://s.devnet.rippletest.net:51234',
        'websocket':'wss://s.devnet.rippletest.net:51233',
        'type':'devnet',
    },
    's1.ripple.com':{
        'json_rpc':'https://s1.ripple.com:51234',
        'websocket':'wss://s1.ripple.com:51233',
        'type':'mainnet',
    },
    's2.ripple.com':{
        'json_rpc':'https://s2.ripple.com:51234',
        'websocket':'wss://s2.ripple.com:51233',
        'type':'mainnet',
    },
    'xrplcluster.com':{
        'json_rpc':'https://xrplcluster.com',
        'websocket':'wss://xrplcluster.com',
        'type':'mainnet',
    },
    'xrpl.ws':{
        'json_rpc':'https://xrpl.ws',
        'websocket':'wss://xrpl.ws',
        'type':'mainnet',
    },
    'x1.sologenic.org':{
        'json_rpc':'',
        'websocket':'wss://x1.sologenic.org',
        'type':'mainnet',
    },
    'xrpl.link':{
        'json_rpc':'https://xrpl.link',
        'websocket':'wss://xrpl.link',
        'type':'mainnet',
    },
    'testnet.xrpl-labs.com':{
        'json_rpc':'https://testnet.xrpl-labs.com',
        'websocket':'wss://testnet.xrpl-labs.com',
        'type':'testnet',
    },

}

def get_xrp_network_from_jwt(jwt_body)-> XrpNetwork:
    xrp_network = {}
    if 'net' in jwt_body:
        xrp_network['websocket'] = jwt_body['net']
    elif 'network_endpoint' in jwt_body:
        xrp_network['websocket'] = jwt_body['network_endpoint']
    else:
        raise Exception("No network endpoint found in jwt")
    
    xrp_network['json_rpc'] = get_rpc_network_from_wss(xrp_network['websocket'])
    xrp_network['type'] = get_rpc_network_type(xrp_network['json_rpc'])
    xrp_network['domain'] = get_rpc_domain(xrp_network['json_rpc'])

    return XrpNetwork(xrp_network)


def get_wss_from_jwt(jwt_body):
    if 'net' in jwt_body:
        return jwt_body['net']
    elif 'network_endpoint' in jwt_body:
        return jwt_body['network_endpoint']
    else:
        return None


def get_rpc_network_from_jwt(jwt_body):
    rpc_network = xrp_lookup['s.altnet.rippletest.net']['json_rpc']
    if 'net' in jwt_body:
        rpc_network = get_rpc_network_from_wss(jwt_body['net'])
        # app.logger.info(f"rpc_network: {rpc_network} net:{jwt_body['net']}")
    elif 'network_endpoint' in jwt_body:
        rpc_network = get_rpc_network_from_wss(jwt_body['network_endpoint'])
        # app.logger.info(f"rpc_network: {rpc_network} network_endpoint:{jwt_body['network_endpoint']}")
    return rpc_network

def get_rpc_network_from_wss(wss_endpoint):
    for domain in xrp_lookup.keys():
        if xrp_lookup[domain]['websocket'] == wss_endpoint:
            return xrp_lookup[domain]['json_rpc']
    
    return 'none'

def get_rpc_network_type(network):
    for domain in xrp_lookup.keys():
        if xrp_lookup[domain]['json_rpc'] == network:
            return xrp_lookup[domain]['type']
    
    return 'none'

def get_wss_network_type(network):
    for domain in xrp_lookup.keys():
        if xrp_lookup[domain]['websocket'] == network:
            return xrp_lookup[domain]['type']
    
    return 'none'

def get_rpc_domain(network):
    for domain in xrp_lookup.keys():
        if domain in network:
            return domain
    
    return 'none'

def dropsToXRP(drops:int):
    return float(drops/1000000)

def xrpToDrops(xrp:float):
    return int(xrp*1000000.0)
