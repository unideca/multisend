import { Box, Button, Divider, Flex, Input, Select, Text } from "@chakra-ui/react";
import { ChangeEvent, FC, useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import MultiInputSet from "../components/MultiInputset";
import MultiTextarea from "../components/MultiTextarea";
import MultiUploadTooltip from "../components/MultiUploadTooltip";
import { TbSend } from "react-icons/tb";
import { useOutletContext } from "react-router-dom";
import { OutletContext } from "../components/Layout";
import { Contract } from "ethers";
import { ethers } from "ethers";
import tokenMultiContractAbi from "../lib/tokenMultiContractAbi.json";
import useToastNotification from "../hooks/useToastNotification";
import { BSCtokenMultisenderCA } from "../lib/contractAddresses";
import { ArbitrumtokenMultisenderCA } from "../lib/contractAddresses";
import erc20Approve from "../lib/erc20Approve.json";

const Multi: FC = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null); // Textarea를 참조할 ref
  const [excelValue, setExcelValue] = useState<any>("");
  const [inputValue, setInputValue] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);
  const [isTextareaDisable, setIsTextareaDisable] = useState<boolean>(false);
  const [inputKey, setInputKey] = useState<number>(0); // 키값을 관리할 상태 : 동일한 excel파일 선택했을때 브라우저가 변경으로 인식하지 않아서 onChange이벤트 발생 X
  //react key속성을 사용해서 <input type="file">로 input요소를 강제로 다시 렌더링 하면 동일 파일 선택했을 때도 onChange이벤트 발생
  const [addrAmountInputPage, setAddrAmountInputPage] = useState<number>(0);
  // const theme = useTheme();
  const [inputNumber, setInputNumber] = useState<number>(1);
  const [isWriting, setIsWriting] = useState<boolean>(true);
  const [multiContract, setMultiContract] = useState<Contract | null>(null);
  const [tokenContract, setTokenContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [network, setNetwork] = useState<string>("ETH");
  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [tokenAmount, setTokenAmount] = useState<bigint>(0n);
  const [tokenName, setTokenName] = useState<string>("");
  const { signer, setSigner } = useOutletContext<OutletContext>();
  const { showToast } = useToastNotification();  

  const inputChange = (e: any) => {
    setInputValue(e.target.value);
  };
  
  // 네트워크가 변경될 때마다 자동으로 처리
  //window.ethereum.on('chainChanged', ...) 이벤트에서 전달되는 인자는 chainId 하나뿐임
  window.ethereum.on('chainChanged', async (chainId : string) => {
      console.log("Network changed to:", chainId);
      const provider = new ethers.BrowserProvider(window.ethereum); // 메타마스크 프로바이더 설정
      const signer = provider.getSigner(); // 새로 변경된 네트워크에 맞는 signer 가져오기
      console.log("New Signer for the network:", signer);
      setNewSigner(); //새로 변경된 네트워크의 signer를 setSigner함수로 signer변수에 할당 async작업 이루어져야 해서 함수 따로 뺌
      setTokenAmount(0n); //프론트 단이 아닌 지갑 상에서 네트워크 변경 시켰을 때 전송 페이지 최소화
      switchToNetwork(chainId); // switchToNetwork의 파라미터 인자를 chainId로 모두 교환함
      setNetwork(chainId); // 현재 network 변수를 변경하여 <select> 컴포넌트의 네트워크 value 변경
  });

  //네트워크 변경 시 새로운 Signer 호출 , signer가 변경되어야 해당 네트워크에서 함수들 호출 가능
  const setNewSigner = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    setSigner(await provider.getSigner());
  }

  const switchToNetwork = async (selectedNetwork : string) => {
    try {
      if(!signer) return;
      if(selectedNetwork === "0xa4b1") {
        //switchToNetwork는 1.window.ethereum.on()
        setMultiContract(new Contract(ArbitrumtokenMultisenderCA, tokenMultiContractAbi, signer));
        console.log(selectedNetwork);
      } else if(selectedNetwork === "0x38") {
        console.log(selectedNetwork);
        setMultiContract(new Contract(BSCtokenMultisenderCA, tokenMultiContractAbi, signer));
      }
    } catch (error) {
      console.error("네트워크를 변경하지 못했습니다:", error);
    }
  };

  const networkHandler = async (e : React.ChangeEvent<HTMLSelectElement>) => {
    try {
      const selectedNetwork = e.target.value;
      console.log(selectedNetwork);
      
      if(selectedNetwork === "0xa4b1") {
        const arbitrumChainId = "0xa4b1"; // Arbitrum One Chain ID (42161 in decimal)
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: arbitrumChainId }],
        });
        setNetwork(selectedNetwork);
        setTokenAmount(0n);
        setTokenName("");
        const provider = new ethers.BrowserProvider(window.ethereum);
        setSigner(await provider.getSigner());
        switchToNetwork("0xa4b1");
        
      } else if(selectedNetwork === "0x38") {
        const bscChainId = "0x38"; // Arbitrum One Chain ID (42161 in decimal)
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: bscChainId }],
          });
        setNetwork(selectedNetwork);
        setTokenAmount(0n);
        setTokenName("");
        const provider = new ethers.BrowserProvider(window.ethereum);
        setSigner(await provider.getSigner());
        switchToNetwork("0x38");
        
      }
    } catch (error) {
      console.error(error);
      await getNetwork();
      console.log(network);
    } 
  }
  
  const getNetwork = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    // 현재 네트워크 정보 가져오기
    const network = await provider.getNetwork();
    console.log("0x" + network.chainId.toString(16)); // 첫 로딩시 네트워크 value 띄우기 위해 16진수로 맞춰줌
    setNetwork("0x" + network.chainId.toString(16)); //toString은 기본적으로 10진수 toString(16)은 16진수로 변환
  }

  const getTokenContract = async() => {
    try {
      if (!signer) {
        showToast("지갑 연결 후 이용해주세요.", "", "error");
        return;
      }
      if(network === "0xa4b1") {
        setMultiContract(new Contract(ArbitrumtokenMultisenderCA, tokenMultiContractAbi, signer));
      } else if(network === "0x38") {
        setMultiContract(new Contract(BSCtokenMultisenderCA, tokenMultiContractAbi, signer));
      }
      setTokenContract(new Contract(tokenAddress, erc20Approve ,signer));
    } catch(error) {
      console.error(error);
    }
  }

  const getTokenBalance = async (token : string) => {
    try {
      if(!tokenContract || !signer) return;
      const response = await tokenContract.balanceOf(signer?.address);
      console.log(response);
      setTokenAmount(response);
      if (response === 0n) {
        alert(`[전송불가]\n${signer.address}지갑주소에 \n${token} 토큰의 잔액이 "0" 입니다`)
      }
    } catch (error) {
      console.error(error);
    }
  }

  const getTokenSymbol = async () => {
    console.log(tokenContract);
    try {
      if(!tokenContract || !signer) return;
      const response = await tokenContract.symbol();
      setTokenName(response);
      console.log(response);
      return response;
    } catch (error) {
      console.error(error);
      alert("해당 네트워크의 토큰 컨트랙트 주소를 확인해주세요")
      setTokenAmount(0n);
      setTokenName("");

      return null;
    }
  }

  const getTokenData = async () => {
    try {
      if(!tokenContract || !signer) return;
      const token = await getTokenSymbol();
      if (token) {
        await getTokenBalance(token);
      }
    } catch (error) {
      console.error(error);
    }
  }

  const checkFormat = async () => {
    if (!signer) {
      showToast("지갑 연결 후 이용해주세요.", "", "error");
      return;
    }

    var input = inputValue.trim().replace(/\r\n|\r|\n/g, "\n"); // 모든 줄바꿈 문자를 통일된 '\n'으로 변경
    input = input.replace(/,\s+/g, ","); // ,뒤에 \s는 공백 문자를 의미. +는 앞의 패턴이 1회 이상 반복됨을 의미 -> 공백 있으면 그냥 ,로 replace

    const lines = input.split("\n");
    const lineFormat = /^0x[a-fA-F0-9]{40},\d+(\.\d+)?$/i; // 각 줄을 검사할 정규식

    var isValid = true;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!lineFormat.test(line)) {
        isValid = false;
        alert(
          `상태 : 전송 불가능 [${i + 1}번째 줄에 문제가 있습니다] \n\n내용 : "${line}" \n\n해결 : \n0x1abe2a054618d6ce633f54468082bf11433e8b69, 2\n0x62e44d06e80a9e7072df5ae1d350fb66a9887d72, 3.5\n위와 같은 형식으로 수정해주세요`
        );
        return;
      }
    }

    const addresses = [];
    const amounts = [];
    let totalValue: bigint = 0n;

    for (let i = 0; i < lines.length; i++) {
      const [address, amount] = lines[i].split(",");
      addresses.push(address);
      if (parseFloat(amount) === 0) return;
      const amountBigNumber = ethers.parseEther(amount); //이부분을 수정했는데 작은값은 이전에 전송안되었는데 parseUnits으로 했을 땐 전송 가능
      const amountBigInt = BigInt(amountBigNumber);
      amounts.push(amountBigNumber);
      totalValue += amountBigInt;
    }

    console.log(addresses);
    console.log(amounts);

    if (!multiContract) return;
    setIsLoading(true);

    try {
      // const tx = await multiContract.multisender(addresses, amounts, {
      //   value: totalValue + lines.length * 10 ** 14,
      // });
      console.log(totalValue);
      if(!tokenContract) return;
      const allowance = await tokenContract.allowance(signer.address, multiContract);
      console.log(allowance);
      if(allowance < totalValue) {
        const approveAmount = await tokenContract.approve(multiContract, totalValue);
        await approveAmount.wait();
      }
      
      const tx = await multiContract.multisendToken2(tokenContract, addresses, amounts);
      showToast(
        "토큰 전송 중",
        "토큰을 전송하고 있습니다. 잠시만 기다려주세요.",
        "info"
      );
      await tx.wait();

      showToast(
        "전송 완료!",
        "토큰 전송이 성공적으로 완료되었습니다.",
        "success"
      );

      // await addPoints(signer, 10 * lines.length);
    } catch (error) {
      console.log(error);
      showToast("전송 실패", "토큰 전송 중 오류가 발생했습니다.", "error");
    } finally {
      setIsLoading(false);
    }

    if (!isValid) {
      setIsError(true);
      // alert("전송 불가능");
    } else {
      setIsError(false);
      // alert("전송 가능");
    }
  };

  const onChangeFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader(); // 브라우저 내에서 파일을 읽을 수 있도록 해주는 객체 웹API 일부
    //fileReader는 readAsArrayBuffer, readAsText, readAsDataURL 메서드에 따라 result형식 달라짐
    try {
      if (!e.currentTarget.files) return;
      const formData = new FormData();
      formData.append("file", e.currentTarget.files[0]); //formData객체에서 특정이름으로 필드값을 가져올때 const uploadedFile = formData.get("file"); 이럴때 저 append한 이름을 사용함
      console.log(formData);
      console.log(Array.from(formData.entries())); //파일명은 이걸로 확인하기

      const file = e.currentTarget.files[0];
      console.log(file);
      const fileType = file.type;
      const validExcelTypes = [
        "application/vnd.ms-excel", // .xls
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
        "text/csv", // csv
        "text/plain", //txt
      ];

      if (!validExcelTypes.includes(fileType)) {
        alert("엑셀 파일이 아닙니다");
        return;
      }

      reader.readAsArrayBuffer(file); //fileReader의 onload 이벤트 트리거
    
      e.currentTarget.value = ''; // 동일한 파일 선택 가능 해당코드 없으면 동일 파일은 input[type='file']의 상태가 유지 됨
    
    } catch (error) {
      console.error(error);
    }

    //onload는 파일 읽기가 완료되었을 때 호출할 코드 정의
    reader.onload = (event) => {
      //event.target이 null이 아닌지, event.target.result가 undefined가 아닌지

      if (event.target?.result) {
        const arrayBuffer = event.target.result;
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetNames = workbook.SheetNames; //시트 전체 이름 호출
        const sheetName = sheetNames[0]; //첫번째 시트 이름
        const sheet = workbook.Sheets[sheetName]; //시트들 중에 첫번째 시트 선택

        //참조할 값이 있는지 확인, 참조할 값 없다면 빈 엑셀임
        if (sheet["!ref"]) {
          const sheetRange = XLSX.utils.decode_range(sheet["!ref"]);
          //sheetRange.start.row
          let excelData = "";
          for (let row = sheetRange.s.r; row <= sheetRange.e.r; row++) {
            const cellA = sheet[XLSX.utils.encode_cell({ r: row, c: 0 })];
            const cellB = sheet[XLSX.utils.encode_cell({ r: row, c: 1 })];

            console.log(cellA);
            console.log(cellB);
            console.log(sheetRange);

            if (cellA && cellB) {
              const concatAddressAmount = `${cellA.w},${Number(cellB.v)}`;
              excelData += concatAddressAmount + "\n"; // 주소, 수량 엔터 역할 줄바꿈
            } else {
              alert(
                `엑셀의 ${row + 1}행에 있는 지갑 주소 ${
                  cellA.v
                } 혹은 보내는 수량을 확인해 주세요.`
              );
            }
            setExcelValue(excelData.trim());
            setInputValue(excelData.trim());
            if (textareaRef.current) {
              textareaRef.current.value = excelData.trim(); // Textarea에 값 설정
              setIsTextareaDisable(true);
            }
          }
        } else {
          alert("빈엑셀 입니다"); //출력확인
        }
        setInputKey(inputKey + 1);
      }
    };
  };

  // useEffect(() => {
  //   getNetwork();
  //   if(network === "0x38") {
  //     setMultiContract(new Contract(BSCtokenMultisenderCA, tokenMultiContractAbi, signer));
  //   } else if(network ==="0xa4b1") {
  //     setMultiContract(new Contract(ArbitrumtokenMultisenderCA, tokenMultiContractAbi, signer));
  //   }
  // },[signer]); // 첫 렌더링시 현재 네트워크 정보 가져오기

  useEffect(() => {
    console.log(inputValue);
  }, [inputValue]);

  useEffect(() => {
    if (isError) {
      setExcelValue("");
      setIsTextareaDisable(false);
    }
  }, [isError]);

  // useEffect(() => {
  //   setMultiContract(
  //     new Contract(multisenderContractAddress, multiContractAbi, signer)
  //   );
  // }, [signer]);
  

  useEffect(() => {
    console.log("multiContract : ",multiContract);
  }, [multiContract]);

  useEffect(() => {
    console.log(isLoading);
  }, [isLoading]);
  
  useEffect(() => {
    console.log(tokenAddress);
  }, [tokenAddress]);
  
  useEffect(() => {
    console.log(tokenContract);
    getTokenData();
  }, [tokenContract]);

  return (
    <Flex
      flexDir="column"
      w="100%"
      minH="100vh"
      alignItems="center"
      bgColor="gray.800"
      p={4}
    >
      <Flex
        flexDir="column"
        borderWidth="3px"
        borderColor="teal"
        minW="4xl"
        minH="xs"
        mt={20}
        mx="auto"
        p="5"
        borderRadius="lg"
        boxShadow="lg"
        bgColor="boxColor"
      >
        <Text fontSize="2xl" fontWeight="bold" pb="6" color="white">
          토큰 다중 전송
        </Text>
        <Divider mb={4} borderColor="gray.600" />
        <Flex>
          <Flex flexDir="column" width="100%">
            <Box fontWeight="bold" fontSize="xl" color="white">
              네트워크 선택
            </Box>
            <Select
              mt="4"
              variant="ghost"
              borderColor="brand.500"
              borderWidth="2px"
              cursor="pointer"
              value={network}
              onChange={networkHandler}
            >
              <option value="0xa4b1">Arbitrum</option>
              <option value="0x38">BSC</option>
            </Select>
          </Flex>
        </Flex>
        <Box mt="4" fontWeight="bold" fontSize="xl" color="white">
          토큰 컨트랙트 주소 입력
        </Box>
        <Flex mt="4" alignItems="center" justifyContent="space-between">
          <Input w="80%" value={tokenAddress} onChange={(e) => setTokenAddress(e.target.value)} color="white"/>
          <Button w="15%" onClick={getTokenContract}>확인</Button>
        </Flex>
        <Input mt="4" border="1px solid white" value={`${tokenName}토큰 잔액 : ${ethers.formatEther(tokenAmount).toString()}`} color="white"/>
        {tokenAmount === 0n ? 
        <></> : 
        <Flex flexDir="column" pt="4">
          <Flex alignItems="center" justifyContent="space-between">
            <Text mb="4" fontWeight="bold" fontSize="xl" color="white">
              주소 수량 입력
            </Text>
          </Flex>
          <Flex justifyContent="space-between" mb="4">
            <Button
              w="49%"
              onClick={() => {
                setAddrAmountInputPage(0);
                setInputValue("");
                setInputNumber(1);
                setIsWriting(true);
              }}
            >
              주소 수량 입력 1
            </Button>
            <Button
              w="49%"
              onClick={() => {
                setAddrAmountInputPage(1);
                setInputValue("");
              }}
            >
              주소 수량 입력 2
            </Button>
          </Flex>
          {addrAmountInputPage == 0 ? (
            <MultiTextarea
              textareaRef={textareaRef}
              isTextareaDisable={isTextareaDisable}
              inputChange={inputChange}
            />
          ) : (
            <>
              <MultiInputSet
                inputNumber={inputNumber}
                setInputNumber={setInputNumber}
                checkFormat={checkFormat}
                inputValue={inputValue}
                setInputValue={setInputValue}
                setIsWriting={setIsWriting}
              />
            </>
          )}
          {addrAmountInputPage == 0 ? (
            <>
              <MultiUploadTooltip
                inputKey={inputKey}
                onChangeFile={onChangeFile}
                excelValue={excelValue}
                setIsTextareaDisable={setIsTextareaDisable}
                setExcelValue={setExcelValue}
              />
              <Button
                onClick={checkFormat}
                borderColor="teal.500"
                borderWidth="2px"
                mt="5"
                bgColor="teal"
                _hover={{ bg: "teal.400" }}
                color="white"
                isDisabled={isLoading}
              >
                <TbSend size="20" />
                <Text ml="1" _hover="teal.400">
                  전송하기
                </Text>
              </Button>
            </>
          ) : (
            <>
              {isWriting ? (
                <></>
              ) : (
                <Button
                  onClick={checkFormat}
                  borderColor="teal.500"
                  borderWidth="2px"
                  mt="5"
                  bgColor="teal"
                  _hover={{ bg: "teal.400" }}
                  color="white"
                  isDisabled={isLoading}
                >
                  <TbSend size="20" />
                  <Text ml="1" _hover={{ color: "teal.400" }}>
                    전송하기
                  </Text>
                </Button>
              )}
            </>
          )}
        </Flex>
        }
      </Flex>
    </Flex>
  );
};

export default Multi;
