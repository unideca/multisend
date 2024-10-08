import { Select } from "@chakra-ui/react";
import { FC, useEffect } from "react";

interface NetworkSelectorProps {
    network : string;
    networkHandler : (e: React.ChangeEvent<HTMLSelectElement>) => Promise<void>;
    isValidNetwork : boolean | null;
}

const NetworkSelector : FC<NetworkSelectorProps> = ({network, networkHandler, isValidNetwork}) => {
    
    useEffect(() => {
        console.log(isValidNetwork)
    },[isValidNetwork]);

    return (
        <Select
              mt="4"
              variant="ghost"
              borderColor="brand.500"
              borderWidth="2px"
              cursor="pointer"
              value={isValidNetwork ? network : "none"}
              onChange={networkHandler}
            >
              <option value="0xa4b1">Arbitrum</option>
              <option value="0x38">BSC</option>
              <option value="none">지원하지 않는 네트워크</option>
            </Select>
    )
}

export default NetworkSelector;