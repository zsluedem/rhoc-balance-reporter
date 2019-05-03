const Web3 = require('web3');

const web3 = new Web3(process.env.ETH_WS || 'https://mainnet.infura.io/v3/565a9e0998a549009935149a1ce51bfd')
const rhoc = new web3.eth.Contract(require('./abi.json'), "0x168296bb09e24a88805cb9c33356536b980d3fc5");

const fromBlock = 3383352;
const toBlock	= process.env.BLOCK || 7686890;
const step = 1000

async function* getTransfer(from, to , step){
	for(let start=from, end=from+step;; start=end, end=end+step){
		if(end> to){
			for (t of await rhoc.getPastEvents('Transfer', { fromBlock:start, toBlock:to })) {
				yield* [t.returnValues.from, t.returnValues.to, t.returnValues.value]
			}
			break
		}
		else {
			for (t of await rhoc.getPastEvents('Transfer', { fromBlock:start, toBlock:end })) {
				yield [t.returnValues.from, t.returnValues.to, t.returnValues.value.toString()]
			}
		}
	}
}

(async () => {
	let timerId = setInterval(async () => {
		await web3.eth.isSyncing()
	}, 1000)
	try {
		for await ([from, to, value] of getTransfer(fromBlock, toBlock, step)) {
			process.stdout.write(from + ',' + to + ',' + value + '\n')
		}
	} catch (e) {
		console.error(e)
	} finally {
		clearInterval(timerId)
		process.exit()
	}
})();
