import React, { useEffect, useState, useRef } from "react";
import { Physics } from "@react-three/cannon";
import { Canvas } from "@react-three/fiber";
import { Scene } from "./Scene";
import { Web3 } from "web3";
import MemoryToken from './abis/MemoryToken.json';
import html2canvas from 'html2canvas';
import { Web3Storage } from 'web3.storage';

export function Header() {
    const [owner, setOwner] = useState('');
    const [token, setToken] = useState({});
    const [supply, setSupply] = useState({});
    const [tokenURIs, setTokenURIs] = useState([]);
    const [showMint, setShowMint] = useState(false);
    const [cid, setCid] = useState('');
    const printRef = React.useRef();

    async function catchup(address) {
        //check cryptohodlers NFT ownership
        const fetchowner = await fetch(`https://adm.cryptohodlers.io/api/v1/users/ownership/${address}`);
        const res = await fetchowner.json();
        //Comment the following 2 lines to enable ownership check
        const prova = true;
        setShowMint(prova);
        //uncomment the following line to enable ownership check
        //setShowMint(res);

    }

    async function loadWeb3() {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum)
            await window.ethereum.enable()
        }
        else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider)
        }
        else {
            window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
    }

    async function loadBlockchainData() {

        //load account data
        const web3 = window.web3;
        let accounts = await web3.eth.getAccounts();
        let verify = web3.utils.isAddress(accounts[0]);
        if (verify) {
            setOwner(accounts[0]);
            //load blockchain data
            const networkId = await web3.eth.net.getId();
        
            const networkData = MemoryToken.networks[networkId];
            if (networkData) {
                const abi = MemoryToken.abi;
                const address = networkData.address;
                const token = new web3.eth.Contract(abi, address);
                setToken(token);
                const totalSupply = await token.methods.totalSupply().call();
                setSupply(totalSupply);

                //load tokens
                let balanceOf = await token.methods.balanceOf(accounts[0]).call();
                for (let i = 0; i < balanceOf; i++) {
                    let id = await token.methods.tokenOfOwnerByIndex(accounts[0], i).call();
                    let tokenURI = await token.methods.tokenURI(id).call();
                    setTokenURIs([...tokenURIs, tokenURI]);
                }
                catchup(accounts[0]);
            } else { window.alert("please login into your metamask") }
            
        } else {
            window.alert("the smart contract is not deployed to the network");
        }
    }

    function getAccessToken() {
        // If you're just testing, you can paste in a token
        // and uncomment the following line:
        // return 'paste-your-token-here'

        // In a real app, it's better to read an access token from an
        // environement variable or other configuration that's kept outside of
        // your code base. For this to work, you need to set the
        // WEB3STORAGE_TOKEN environment variable before you run your code.
        return process.env.WEB3STORAGE_TOKEN
    }

    function makeStorageClient() {
        return new Web3Storage({ token: getAccessToken() })
    }

    async function storeFiles(files) {
        const client = makeStorageClient();
        const cid = await client.put(files);
        console.log('stored files with cid:', cid);
        setCid(cid);
        return cid
    }

    const handleTokenImage = async () => {
        const element = printRef.current;
        const canvas = await html2canvas(element);
        // JPEG file
        let file = null;
        const blob = canvas.toBlob((function (blob) {
            file = new File([blob], 'mint.jpg', { type: 'image/jpeg' });
            storeFiles(file);
        }, 'image/jpeg'));
        let newTokenURI = `${cid}.ipfs.4everland.io`;
        token.methods.mint(
            owner,
            newTokenURI
        )
            .send({ from: owner })
            .on('transactionHash', (hash) => {
                setTokenURIs([...tokenURIs, newTokenURI])
            })
    };

    useEffect(() => {
        loadWeb3();
        loadBlockchainData();
    }, []);

    return (
        <>
            <div className="header">
                <ul className="menu">
                    <li className="title">hodlers on aurora</li>
                    {showMint && <li className="mint" onClick={ handleTokenImage }>Mint</li> }
                    <li className="wallet">{ owner }</li>
                </ul>
            </div>
            <Canvas ref={printRef}>
                <Physics
                    broadphase="SAP"
                    gravity={[0, -2.6, 0]}
                >
                    <Scene />
                </Physics>
            </Canvas>
        </>
        )
}