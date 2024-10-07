import { Flex } from "@chakra-ui/react";
import { Dispatch, FC, SetStateAction, useState } from "react";
import Header from "./Header";
import { Outlet } from "react-router";
import { JsonRpcSigner } from "ethers";

export interface OutletContext {
    signer : JsonRpcSigner | null
    setSigner: Dispatch<SetStateAction<JsonRpcSigner | null>>;
}

const Layout : FC = () => {
    const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
    
    return (
        <Flex minH="100vh" flexDir="column">
            <Header signer={signer} setSigner={setSigner}/>
            <Outlet context={
                {
                    signer,
                    setSigner
                }
            }/>
        </Flex>
    );
}

export default Layout;