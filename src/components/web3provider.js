const web3 = require('web3');


const Web3Provider = () => {
  const [web3, setWeb3] = useState(new Web3(Web3.givenProvider || "ws://localhost:8546"))


  return (<>


  </>);
}