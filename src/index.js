import "./index.css";
import { createRoot } from "react-dom/client";
import { Header } from "./Header";
import { Web3 } from "web3";


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
        const web3 = window.web3;
        let accounts = await web3.eth.getAccounts();
    }

    window.onload = async () => {
        loadWeb3();
        loadBlockchainData();
    }
    createRoot(

        document.getElementById("root")

    ).render(
        <>
            <Header />

            <div className="controls">
                <p>press [w] [a] [s] [d] to move</p>
                <p>press [k]  to change POV</p>
                <p>press [r] to reset car position</p>
                <p>press the arrows for flips</p>
            </div>
        </>
    );