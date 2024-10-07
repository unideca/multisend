import { Flex, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const linkItems = [
    { name: "Home", path: "/" },
  ];

  return (
    
      <Flex
        color="white"
        gap={4}
      >
        {linkItems.map((link) => (
          <Flex
            as={Link}
            to={link.path}
            p={4}
            borderRadius="md"
            _hover={{ transform: "scale(1.05)" }}
            _active={{ transform: "scale(0.95)" }}
            key={link.name}
            justify="center"
            
          >
            <Text fontWeight="bold" fontSize="20px" textAlign="center">
              {link.name}
            </Text>
          </Flex>
        ))}
      </Flex>
    
  );
};

export default Navbar;
