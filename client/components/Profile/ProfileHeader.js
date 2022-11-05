import { useRouter } from "next/router";
import { useContext } from "react";
import { BsArrowLeft } from "react-icons/bs";
import { TwitterContext } from "../../context/TwitterContext";

const style = {
    wrapper: `border-[#38444d] border-b`,
    header: `py-1 px-3 mt-2 flex items-center`,
    primary: `bg-transparent outline-none font-bold`,
    secondary: `text-[#8899a6] text-xs`,
    backButton: `text-3xl cursor-pointer mr-2 rounded-full hover:bg-[#313b44] p-1`,
    coverPhotoContainer: `flex items-center justify-center h-[15vh] overflow-hidden`,
    coverPhoto: `object-cover h-full w-full`,
    profileImageContainer: `w-full h-[6rem] rounded-full mt-[-3rem] mb-2 flex justify-start items-center px-3 flex justify-between`,
    profileImage: `object-cover rounded-full h-full`,
    profileImageNft: `object-cover h-full`,
    profileImageMint: `bg-white text-black px-3 py-1 rounded-full hover:bg-[#8899a6] cursor-pointer`,
    details: `px-3`,
    nav: `flex justify-around mt-4 mb-2 text-x font-semibold text-[#8899a6]`,
    activeNav: `text-white`,
};

const ProfileHeader = () => {
    const router = useRouter();
    const { currentUser, currentAccount } = useContext(TwitterContext);

    return (
        <div className={style.wrapper}>
            <div className={style.header}>
                <div
                    className={style.backButton}
                    onClick={() => router.push("/")}
                >
                    <BsArrowLeft />
                </div>
                <div className={style.details}>
                    <div className={style.primary}>{currentUser?.name}</div>
                    <div className={style.secondary}>
                        {currentUser?.tweets?.length}{" "}
                        {currentUser?.tweets?.length === 1 ? "Tweet" : "Tweets"}
                    </div>
                </div>
            </div>
            <div>
                <img
                    src={currentUser?.coverImage}
                    alt="cover"
                    className={style.coverPhoto}
                />
            </div>
            <div className={style.profileImageContainer}>
                <div
                    className={
                        currentUser?.isProfileImageNft
                            ? "hex"
                            : style.profileImageContainer
                    }
                >
                    <img
                        src={currentUser?.profileImage}
                        alt="profile image"
                        className={
                            currentUser?.isProfileImageNft
                                ? style.profileImageNft
                                : style.profileImage
                        }
                    />
                </div>
            </div>
            <div className={style.details}>
                <div>
                    <div className={style.primary}>{currentUser?.name}</div>
                </div>
                <div className={style.secondary}>
                    {currentAccount && (
                        <>
                            @{currentAccount.slice(0, 8)}...
                            {currentAccount.slice(-5)}
                        </>
                    )}
                </div>
            </div>
            <div className={style.nav}>
                <div className={style.activeNav}>Tweets</div>
                <div>Tweets & Replies</div>
                <div>Media</div>
                <div>Likes</div>
            </div>
        </div>
    );
};

export default ProfileHeader;
