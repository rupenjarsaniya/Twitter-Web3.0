import { useRouter } from "next/router";
import { useState, useContext } from "react";
import { TwitterContext } from "../../context/TwitterContext";
import InitialState from "./InitialState";
import LoadingState from "./LoadingState";
import FinishedState from "./FinishedState";
import { client } from "../../lib/client";
import { contractAddress, contractABI } from "../../lib/constants";
import { pinFileToIPFS, pinJSONToIPFS } from "../../lib/pinata";
import { ethers } from "ethers";

let metamask;
if (typeof window !== "undefined") {
    metamask = window.ethereum;
}

const getEthereumContract = async () => {
    if (!metamask) return;

    const provider = new ethers.providers.Web3Provider(metamask);
    const signer = provider.getSigner();

    const transactionContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
    );

    return transactionContract;
};

const ProfileImageMinter = () => {
    const router = useRouter();
    const [status, setStatus] = useState("initial");
    const [profileImage, setProfileImage] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const { setAppStatus, currentAccount } = useContext(TwitterContext);

    const mint = async () => {
        if (!name || !description || !profileImage || !metamask) return;

        setStatus("loading");

        const pinataMetadata = {
            name: `${name} - ${description}`,
        };

        const ipfsImageHash = await pinFileToIPFS(profileImage, pinataMetadata);

        await client
            .patch(currentAccount)
            .set({ profileImage: ipfsImageHash })
            .set({ isProfileImageNft: true })
            .commit();

        const imageMetadata = {
            name: name,
            description: description,
            image: `ipfs://${ipfsImageHash}`,
        };

        const ipfsJsonHash = await pinJSONToIPFS(imageMetadata, pinataMetadata);

        const contract = await getEthereumContract();

        const transactionParameters = {
            to: contractAddress,
            from: currentAccount,
            data: await contract.mint(currentAccount, `ipfs://${ipfsJsonHash}`),
        };

        try {
            await metamask.request({
                method: "eth_sendTransaction",
                params: [transactionParameters],
            });
            setStatus("finished");
        } catch (error) {
            console.error(error);
            setStatus("finished");
        }
    };

    const modalChildren = (modelStatus = status) => {
        switch (modelStatus) {
            case "initial":
                return (
                    <InitialState
                        profileImage={profileImage}
                        setProfileImage={setProfileImage}
                        name={name}
                        setName={setName}
                        description={description}
                        setDescription={setDescription}
                        mint={mint}
                    />
                );
            case "loading":
                return <LoadingState />;

            case "finished":
                return <FinishedState />;

            default:
                router.push("/");
                setAppStatus("error");
                break;
        }
    };

    return <>{modalChildren(status)}</>;
};

export default ProfileImageMinter;
