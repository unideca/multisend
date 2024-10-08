import { Button, Flex, Text } from "@chakra-ui/react";
import { Dispatch, FC, SetStateAction, useEffect } from "react";
import { JsonRpcSigner, ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import HeaderMenu from "./HeaderMenu";
import Navbar from "./Navbar";



interface HeaderProps {
  signer: JsonRpcSigner | null;
  setSigner: Dispatch<SetStateAction<JsonRpcSigner | null>>;
}

const Header: FC<HeaderProps> = ({ signer, setSigner }) => {


  const navigator = useNavigate();

  const getSigner = async () => {
    if (!window.ethereum) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    setSigner(await provider.getSigner());
  };


  const onClickMetamaskLogin = async () => {
    try {
        await getSigner();
        await window.ethereum.request({method : 'wallet_requestPermissions', params:[{eth_accounts: {}}]});//지갑 허가 다시 받기
        localStorage.setItem("isLogin", "true");      
    } catch (error) {
      console.error("onClickMetamaskLogin Error : ",error);
    }
  };

  useEffect(() => {
    const localIsLogin = localStorage.getItem("isLogin");
    if (localIsLogin === "true") {
      getSigner();
    } else {
      localStorage.removeItem("isLogin");
    }
  }, []);

  return (
    <Flex
      position="fixed"
      top={0}
      left={0}
      w="full"
      h="6vh"
      justifyContent="space-between"
      alignItems="center"
      fontWeight="bold"
      borderBottomColor="white"
      borderBottomWidth="2px"
      px={4}
      zIndex={2}
      bgColor="gray.800"
    >
      <Flex gap={24} position="relative">
        <Button
          variant="ghost"
          w={220}
          fontSize="20px"
          textAlign="center"
          alignSelf="center"
          color="white"
          fontWeight="bold"
          _hover={{ transform: "scale(1.05)" }}
          _active={{ transform: "scale(0.95)" }}
          onClick={() => navigator("/")}
        >
          Unideca
        </Button>
        <Navbar/>
      </Flex>
      <Flex>
        {signer ? (
          <Flex alignItems="center" gap={4}>
            <HeaderMenu
              text={`${signer.address.slice(0,5)}...${signer.address.slice(-4)}`}
              menuItem={["마이페이지", "로그아웃"]}
              setSigner={setSigner}
            />
          </Flex>
        ) : (
          <Button
            p={0}
            bgColor="teal"
            w="170px"
            _hover={{ bg: "teal.400" }}
            onClick={onClickMetamaskLogin}
          >
            <Text color="white" fontWeight="bold">
              지갑 연결
            </Text>
          </Button>
        )}
      </Flex>
    </Flex>
  );
};

export default Header;