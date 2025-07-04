"use client"

import { Box, Button, Flex, Heading, Stack, Text, useColorModeValue } from "@chakra-ui/react"
import { useRouter } from "next/navigation"

export default function ImportPage() {
  const router = useRouter()

  return (
    <Flex minH={"100vh"} align={"center"} justify={"center"} bg={useColorModeValue("gray.50", "gray.800")}>
      <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"} textAlign={"center"}>
            Import Options
          </Heading>
          <Text fontSize={"lg"} color={"gray.600"}>
            Choose the import option that suits your needs.
          </Text>
        </Stack>
        <Box rounded={"lg"} bg={useColorModeValue("white", "gray.700")} boxShadow={"lg"} p={8}>
          <Stack spacing={4}>
            <Button
              bg={"blue.400"}
              color={"white"}
              _hover={{
                bg: "blue.500",
              }}
              onClick={() => router.push("/import/booking")}
            >
              Roadbooks & Vouchers
            </Button>
            <Button
              bg={"green.400"}
              color={"white"}
              _hover={{
                bg: "green.500",
              }}
              onClick={() => router.push("/import/travelidea")}
            >
              Offertes & Media
            </Button>
            <Button
              bg={"purple.400"}
              color={"white"}
              _hover={{
                bg: "purple.500",
              }}
              onClick={() => router.push("/import/holidaypackage")}
            >
              Offertes & Media
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  )
}
