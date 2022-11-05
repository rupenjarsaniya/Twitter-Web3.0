import { createContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { client } from "../lib/client";

export const TwitterContext = createContext();

export const TwitterProvider = ({ children }) => {
    const router = useRouter();
    const [currentAccount, setCurrentAccount] = useState("");
    const [appStatus, setAppStatus] = useState("");
    const [tweets, setTweets] = useState([]);
    const [currentUser, setCurrentUser] = useState({});

    useEffect(() => {
        checkIfWalletConnected();
    }, []);

    useEffect(() => {
        if (!currentAccount || appStatus !== "connected") return;
        getCurrentUserDetails();
        fetchTweets();
    }, [appStatus, currentAccount]);

    const checkIfWalletConnected = async () => {
        if (!window.ethereum) {
            setAppStatus("noMetaMask");
            return;
        }
        try {
            const addressArray = await window.ethereum.request({
                method: "eth_accounts",
            });

            if (addressArray.length > 0) {
                setAppStatus("connected");
                setCurrentAccount(addressArray[0]);
                createUserAccount(addressArray[0]);
            } else {
                setAppStatus("notConnected");
            }
        } catch (error) {
            setAppStatus("error");
            console.error(error);
        }
    };

    /**
     * Initiates Metamask Wallet Connection
     */
    const connectToWallet = async () => {
        if (!window.ethereum) {
            setAppStatus("noMetaMask");
            return;
        }
        try {
            setAppStatus("loading");
            const addressArray = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            if (addressArray.length > 0) {
                setAppStatus("connected");
                setCurrentAccount(addressArray[0]);
                createUserAccount(addressArray[0]);
            } else {
                router.push("/");
                setAppStatus("notConnected");
            }
        } catch (error) {
            setAppStatus("error");
            console.error(error);
        }
    };

    const createUserAccount = async (userWalleteAddress = currentAccount) => {
        if (!window.ethereum) {
            setAppStatus("noMetaMask");
            return;
        }
        try {
            const userDoc = {
                _type: "users",
                _id: userWalleteAddress,
                name: "Unnamed",
                walletAddress: userWalleteAddress,
                profileImage:
                    "https://png.pngtree.com/png-clipart/20190520/original/pngtree-vector-users-icon-png-image_4144740.jpg",
                isProfileImageNft: false,
                coverImage:
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiwZwTpT6K0FSzjfdigBe2WPaGVqiexVwrPQ&usqp=CAU",
            };
            await client.createIfNotExists(userDoc);
        } catch (error) {
            router.push("/");
            setAppStatus("error");
            console.error(error);
        }
    };

    const getProfileImageUrl = async (imageUri, isNft) => {
        if (isNft) {
            return `https://gateway.pinata.cloud/ipfs/${imageUri}`;
        } else {
            return imageUri;
        }
    };

    const fetchTweets = async () => {
        const query = ` *[_type == 'tweets']{
            "author": author->{name, walletAddress, profileImage, isProfileImageNft},
            tweet,
            timestamp
        }|order(timestamp desc)
        `;

        const sanityResponse = await client.fetch(query);

        setTweets([]);

        sanityResponse.forEach(async (item) => {
            const profileImageUrl = await getProfileImageUrl(
                item.author.profileImage,
                item.author.isProfileImageNft
            );

            const newItem = {
                tweet: item.tweet,
                timestamp: item.timestamp,
                author: {
                    name: item.author.name,
                    walletAddress: item.author.walletAddress,
                    profileImage: profileImageUrl,
                    isProfileImageNft: item.author.isProfileImageNft,
                },
            };
            setTweets((prevState) => [...prevState, newItem]);
        });
    };

    const getCurrentUserDetails = async () => {
        if (appStatus !== "connected") return;

        const query = `*[_type == "users" && _id == "${currentAccount}"]{
            "tweets": tweets[]->{timestamp, tweet}|order(timestamp desc),
            name,
            walletAddress,
            profileImage, 
            isProfileImageNft,
            coverImage
        }`;

        const response = await client.fetch(query);

        const profileImageUrl = await getProfileImageUrl(
            response[0].profileImage,
            response[0].isProfileImageNft
        );

        setCurrentUser({
            tweets: response[0].tweets,
            name: response[0].name,
            walletAddress: response[0].walletAddress,
            profileImage: profileImageUrl,
            isProfileImageNft: response[0].isProfileImageNft,
            coverImage: response[0].coverImage,
        });
    };

    return (
        <TwitterContext.Provider
            value={{
                appStatus,
                setAppStatus,
                currentAccount,
                connectToWallet,
                fetchTweets,
                tweets,
                getCurrentUserDetails,
                currentUser,
            }}
        >
            {children}
        </TwitterContext.Provider>
    );
};
