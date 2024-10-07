import {
    Button,
    Text,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
  } from "@chakra-ui/react";
  import { Dispatch, FC, SetStateAction } from "react";
  import { JsonRpcSigner } from "ethers";
  import { Link, useNavigate } from "react-router-dom";
  
  interface HeaderMenuProps {
    text: string;
    menuItem: string[] | undefined;
    setSigner: Dispatch<SetStateAction<JsonRpcSigner | null>>;
  }
  
  const HeaderMenu: FC<HeaderMenuProps> = ({ text, menuItem, setSigner }) => {
    const navigator = useNavigate();
    const onClickMetamaskLogout = () => {
      setSigner(null);
      localStorage.removeItem("isLogin");
      navigator("/");
    };
  
    return (
      <Menu>
        <MenuButton
          as={Button}
          bgColor="teal"
          variant="filled"
          w="170px"
          _hover={{ bgColor: "teal.400" }}
        >
          <Text className="styled-text" fontWeight="bold" color="white">
            {text}
          </Text>
        </MenuButton>
        <MenuList minWidth="150px" bgColor="gray.700">
          {menuItem?.map((v, i) => (
            <MenuItem
              key={i}
              onClick={v === "로그아웃" ? onClickMetamaskLogout : undefined}
              bgColor="gray.700"
              color="white"
            >
              {v === "마이페이지" ? (
                <Text className="styled-text" fontWeight="bold">
                  <Link to="/my-page">{v}</Link>
                </Text>
              ) : (
                <Text className="styled-text" fontWeight="bold">
                  {v}
                </Text>
              )}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    );
  };
  
  export default HeaderMenu;
  